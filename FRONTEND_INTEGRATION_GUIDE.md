# 🌸 Elvara Florist — Frontend AI & Developer Integration Guide

> **Instructions for AI Assistant / Frontend Developer**:
> You are building the complete frontend UI, pages, and interactive features for **Elvara Florist** (a luxury artisanal floral studio and boutique).
> 
> All backend database tables, authentication handlers, storage presigners, Razorpay checkout endpoints, REST APIs, and server actions are **already fully built, tested, and running in this repository**.
>
> Use this document as your single source of truth for all schemas, API contracts, hooks, and actions. **Do not create separate mock backends or rewrite database schemas** — connect directly to the existing APIs and utilities documented below.

---

## 📋 Table of Contents
1. [Tech Stack & Design Aesthetic](#1-tech-stack--design-aesthetic)
2. [Quick Reference: Imports Cheat Sheet](#2-quick-reference-imports-cheat-sheet)
3. [Authentication System (Better Auth)](#3-authentication-system-better-auth)
4. [Catalog & Products APIs](#4-catalog--products-apis)
5. [Razorpay Payment & Checkout Flow](#5-razorpay-payment--checkout-flow)
6. [Customer Orders & Dashboard API](#6-customer-orders--dashboard-api)
7. [Contact & Custom Inquiries API](#7-contact--custom-inquiries-api)
8. [Admin CMS Server Actions & Image Uploads](#8-admin-cms-server-actions--image-uploads)
9. [Utility & Helper Functions](#9-utility--helper-functions)
10. [Recommended Frontend Pages & Components Checklist](#10-recommended-frontend-pages--components-checklist)

---

## 1. Tech Stack & Design Aesthetic

- **Framework**: Next.js 16 (App Router, Server Components + Client Components)
- **Runtime**: Bun (`bun dev` to run locally)
- **Styling**: Tailwind CSS v4 + Vanilla CSS utilities in `app/globals.css`
- **Animations**: `motion` (`import { motion, AnimatePresence } from "motion/react"`)
- **Icons**: `lucide-react`
- **Notifications**: `sonner` (`toast.success()`, `toast.error()`, Toaster already mounted in `app/layout.tsx`)
- **State & Data Fetching**: `@tanstack/react-query` (QueryClientProvider already mounted)
- **Aesthetic**:
  - High-end artisanal floral boutique.
  - Soft neutrals, warm stone, botanical greens, refined serif/sans typography, glassmorphism cards, micro-animations, and smooth image carousels.

---

## 2. Quick Reference: Imports Cheat Sheet

```tsx
// 1. Authentication
import { authClient, useSession, signIn, signUp, signOut } from "@/lib/auth-client";

// 2. Payments
import { useRazorpay } from "@/lib/useRazorpay";

// 3. UI Helpers & Formatters
import { 
  cn, 
  getMediaUrl, 
  formatPrice, 
  hasPaidPrice, 
  formatDate, 
  formatViews, 
  getActiveThumbnail, 
  getInitials 
} from "@/lib/utils";

// 4. Notifications
import { toast } from "sonner";

// 5. Admin Server Actions
import { 
  createProductAction, 
  updateProductAction, 
  getProductsAction, 
  getPublicProductsAction,
  getPublicProductByIdAction,
  getUploadUrlAction,
  getShopStatsAction,
  getSystemSettingsAction,
  updateSystemSettingAction 
} from "@/app/admin/actions";
```

---

## 3. Authentication System (Better Auth)

Authentication is handled by **Better Auth** with Drizzle adapter and Postgres session persistence.

### Client Import
```tsx
import { authClient, useSession, signIn, signUp, signOut } from "@/lib/auth-client";
```

### 1. Reading Current Session (React Hook)
```tsx
"use client";

import { useSession } from "@/lib/auth-client";

export function UserNav() {
  const { data: session, isPending, error } = useSession();

  if (isPending) return <div>Loading...</div>;

  if (!session) {
    return <button onClick={() => /* open login modal */}>Sign In</button>;
  }

  return (
    <div>
      <p>Hello, {session.user.name}</p>
      <p>Email: {session.user.email}</p>
      {session.user.isAdmin && <span className="badge">Admin</span>}
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

### 2. User Data Structure
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  isAdmin: boolean;        // true for administrator privileges
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. Sign Up with Email & Password
```tsx
await signUp.email({
  email: "customer@example.com",
  password: "SecurePassword123!",
  name: "Jane Doe",
}, {
  onRequest: () => console.log("Signing up..."),
  onSuccess: () => toast.success("Account created successfully!"),
  onError: (ctx) => toast.error(ctx.error.message),
});
```

### 4. Sign In with Email & Password
```tsx
await signIn.email({
  email: "customer@example.com",
  password: "SecurePassword123!",
}, {
  onSuccess: () => {
    toast.success("Welcome back!");
    window.location.reload();
  },
  onError: (ctx) => toast.error(ctx.error.message),
});
```

### 5. Sign In with Google OAuth
```tsx
await signIn.social({
  provider: "google",
  callbackURL: "/", // Where to redirect after authentication
});
```

### 6. Sign Out
```tsx
await signOut({
  fetchOptions: {
    onSuccess: () => {
      toast.success("Signed out");
      window.location.href = "/";
    }
  }
});
```

---

## 4. Catalog & Products APIs

The catalog contains flower arrangements, bouquets, workshops, and botanical gifts.

### Product Object Interface
```typescript
export interface Product {
  id: string;                          // UUID
  title: string;                       // e.g. "Ethereal Peony Bouquet"
  description: string | null;          // Rich text / markdown / description
  price: string | null;                // e.g. "85.00" or null for inquiry
  url: string | null;                  // External link / workshop link
  aspect: "horizontal" | "vertical";   // Photo orientation
  imageUrl: string | null;             // Legacy single image
  thumbnails: string[];                // Up to 4 image keys / URLs
  activeThumbnailIndex: number;        // Primary image index (0-based)
  assetType: string;                   // 'bouquets' | 'collections' | 'workshops' | 'gifts'
  sourceLink: string | null;           // Care guide link or external brochure
  tags: string[];                      // e.g. ["roses", "luxury", "wedding", "dried"]
  references: { label: string; url: string }[]; // Care tips, related links
  userId: string;                      // Creator user ID
  views: number;                       // Total view count
  createdAt: string;                   // ISO date string
  updatedAt: string;
}
```

---

### API 1: Fetch Products List
- **Method**: `GET`
- **Endpoints**: `/api/products` (or `/api/posts`)
- **Query Parameters**:
  - `sort`: `'views'` (popular) | `'newest'` | `'oldest'` | `'atoz'` | `'price-low'` | `'price-high'`
  - `page`: Page number (default `1`)
  - `limit`: Items per page (default `20`)
  - `tags`: Comma-separated tags (e.g. `?tags=roses,luxury`)
  - `type`: Filter by asset type (e.g. `?type=bouquets`)

#### Example Response
```json
{
  "success": true,
  "data": [
    {
      "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "title": "Autumn Blossom Bouquet",
      "description": "Handpicked seasonal blooms with eucalyptus.",
      "price": "65.00",
      "aspect": "vertical",
      "thumbnails": ["catalog/123/images/thumb1.jpg", "catalog/123/images/thumb2.jpg"],
      "activeThumbnailIndex": 0,
      "assetType": "bouquets",
      "tags": ["autumn", "roses", "gift"],
      "views": 342,
      "createdAt": "2026-09-23T10:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 20
}
```

#### React Query Usage
```tsx
import { useQuery } from "@tanstack/react-query";

export function useProducts(filters: { sort?: string; type?: string; tags?: string; page?: number }) {
  return useQuery<Product[]>({
    queryKey: ["products", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.sort) params.set("sort", filters.sort);
      if (filters.type) params.set("type", filters.type);
      if (filters.tags) params.set("tags", filters.tags);
      if (filters.page) params.set("page", filters.page.toString());

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
  });
}
```

---

### API 2: Increment View Counter
Increment views atomically when a user opens a product detail view.
- **Method**: `POST`
- **Endpoints**: `/api/products/views` (or `/api/posts/views`)
- **Body**: `{ "id": "product-uuid-here" }`

#### Example Call
```tsx
useEffect(() => {
  if (product?.id) {
    fetch("/api/products/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: product.id }),
    });
  }
}, [product?.id]);
```

---

## 5. Razorpay Payment & Checkout Flow

Everything needed for payments is pre-wired into a custom React hook: `useRazorpay`.

### Client Hook Usage
```tsx
"use client";

import { useRazorpay } from "@/lib/useRazorpay";
import { formatPrice } from "@/lib/utils";

export function BuyProductButton({ product }: { product: { id: string; title: string; price: string | null } }) {
  const { initiatePurchase, getStatus } = useRazorpay({
    brandName: "Elvara Florist",
    themeColor: "#171717",
    onSuccess: () => {
      // Refresh user purchases or redirect to order confirmation
    },
  });

  const status = getStatus(product.id); // 'idle' | 'processing' | 'success' | 'failed'

  return (
    <button
      onClick={() => initiatePurchase(product)}
      disabled={status === "processing"}
      className="px-6 py-3 bg-neutral-900 text-white rounded-full hover:bg-neutral-800 transition"
    >
      {status === "processing" ? "Securing Order..." : `Purchase ${formatPrice(product.price)}`}
    </button>
  );
}
```

### What Happens Behind the Scenes:
1. `initiatePurchase` calls `POST /api/razorpay/create-order` with `{ postId: product.id }`.
2. The server creates an order via Razorpay API and inserts a record in `ordersTable` with status `'created'`.
3. The hook loads `checkout.js` and opens the Razorpay payment modal.
4. Upon customer payment, Razorpay returns signatures.
5. The hook posts signatures to `POST /api/razorpay/verify-payment`.
6. The server cryptographically verifies HMAC SHA-256 signature and updates order status to `'paid'`.
7. `toast.success("Payment successful! Your order has been placed.")` is triggered.

---

## 6. Customer Orders & Dashboard API

Enables logged-in customers to view their purchased bouquets, arrangements, and workshop tickets.

- **Method**: `GET`
- **Endpoint**: `/api/user/purchases`
- **Authentication**: Requires active session (cookies are automatically sent)

### Example Response
```json
{
  "purchases": [
    {
      "orderId": "order_Ox84JkL9s",
      "paymentId": "pay_Px74KlM2s",
      "amount": "85.00",
      "purchasedAt": "2026-09-23T11:20:00.000Z",
      "postId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "title": "Ethereal Peony Arrangement",
      "description": "Artisanal floral arrangement in a ceramic vase.",
      "price": "85.00",
      "aspect": "horizontal",
      "imageUrl": null,
      "thumbnails": ["catalog/123/images/peony.jpg"],
      "activeThumbnailIndex": 0
    }
  ]
}
```

### React Query Hook
```tsx
export function usePurchases() {
  return useQuery({
    queryKey: ["user-purchases"],
    queryFn: async () => {
      const res = await fetch("/api/user/purchases");
      if (res.status === 401) throw new Error("Please sign in to view your orders");
      const data = await res.json();
      return data.purchases;
    },
  });
}
```

---

## 7. Contact & Custom Inquiries API

Allows visitors and clients to submit custom wedding floral requests, workshop bookings, or general inquiries.

- **Method**: `POST`
- **Endpoint**: `/api/contact`
- **Body**:
```json
{
  "name": "Sarah Miller",
  "email": "sarah@example.com",
  "subject": "Custom Wedding Floral Arrangements",
  "message": "Hello, I'd like to consult for a garden wedding next month..."
}
```
- **Validation**: `name`, `email`, `subject`, `message` are all required; email is regex validated.
- **Response**: `{ "success": true, "message": "Your message has been received! Our florists will get back to you shortly." }`

---

## 8. Admin CMS Server Actions & Image Uploads

Admin actions in `app/admin/actions.ts` are guarded by `requireAdmin()` (`session.user.isAdmin === true`).

### 1. Uploading Product Images to Cloudflare R2
Uploads go **directly from the client browser to Cloudflare R2** via S3 Presigned URLs for maximum speed and zero server overhead.

```tsx
import { getUploadUrlAction } from "@/app/admin/actions";

async function uploadImageToR2(file: File, postId?: string): Promise<string> {
  // 1. Get presigned upload PUT URL from server
  const { uploadUrl, fileKey } = await getUploadUrlAction(
    file.name,
    file.type || "image/jpeg",
    true, // isPublic = true for catalog images
    postId
  );

  // 2. Upload file directly to R2 bucket using PUT
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "image/jpeg" },
    body: file,
  });

  if (!res.ok) throw new Error("Failed to upload image to storage");

  // 3. Return the storage fileKey to be saved in product.thumbnails
  return fileKey;
}
```

### 2. Creating a New Product
```tsx
import { createProductAction } from "@/app/admin/actions";

async function handleSubmit(formData: FormData) {
  // Form fields expected:
  // - title: string
  // - description: string
  // - price: string (e.g. "75.00")
  // - aspect: "horizontal" | "vertical"
  // - assetType: "bouquets" | "collections" | "workshops" | "gifts"
  // - tags: JSON.stringify(["roses", "featured"])
  // - thumbnails: JSON.stringify([fileKey1, fileKey2])
  // - activeThumbnailIndex: "0"
  // - references: JSON.stringify([{ label: "Care Guide", url: "https://..." }])
  
  await createProductAction(formData);
  toast.success("Product created!");
}
```

### 3. Updating an Existing Product
```tsx
import { updateProductAction } from "@/app/admin/actions";

// Same as createProductAction, but include:
// formData.append("id", existingProductId);
await updateProductAction(formData);
toast.success("Product updated!");
```

### 4. Admin Shop Metrics
```tsx
import { getShopStatsAction } from "@/app/admin/actions";

// Returns:
// {
//   totalCount: number,     // Total products in store
//   paidOrders: number,     // Total successfully completed orders
//   newMonthlyItems: number,// New items added in last 30 days
//   totalViews: number      // Sum of all product page views
// }
const stats = await getShopStatsAction();
```

---

## 9. Utility & Helper Functions

All available in `@/lib/utils`:

| Helper Function | Arguments | Description & Example |
| :--- | :--- | :--- |
| `getMediaUrl(key)` | `key: string` | Converts R2 storage key or path to full CDN image URL. If `key` is already `http...`, returns as-is. |
| `getActiveThumbnail(item)` | `item: { thumbnails, activeThumbnailIndex, imageUrl }` | Safely extracts the active thumbnail URL with a fallback flower image. |
| `formatPrice(price, currency?)` | `price: string \| number`, `currency = "USD"` | Formats price as `$85.00`, or `"Free"` if 0 or empty. |
| `hasPaidPrice(price)` | `price: string \| number` | Returns `true` if price is greater than 0. |
| `formatDate(date)` | `date: string \| Date` | Formats ISO date to readable string (e.g. `"Sep 23, 2026"`). |
| `formatViews(views)` | `views: number` | Formats numbers (e.g. `1200` → `"1k+"`, `1500000` → `"2M+"`). |
| `getInitials(name)` | `name: string` | Extracts uppercase initials (e.g. `"Jane Doe"` → `"JD"`). |
| `cn(...inputs)` | class names / conditions | Tailwind CSS class merging utility. |

---

## 10. Recommended Frontend Pages & Components Checklist

Here is a recommended page blueprint for building out the frontend:

### Pages
- [ ] `app/page.tsx`: Hero banner with botanical imagery, Featured Bouquets carousel, About teaser, Workshop highlight, Client reviews.
- [ ] `app/collections/page.tsx` & `app/bouquets/page.tsx`:
  - Category selector tabs (Bouquets, Arrangements, Workshops, Gifts)
  - Sorting dropdown (`views`, `newest`, `price-low`, `price-high`)
  - Tag filter pills
  - Product grid with hover animation, price badge, and Quick Buy button
- [ ] `app/products/[id]/page.tsx` (or `app/bouquets/[id]/page.tsx`):
  - Multi-image gallery / thumbnail switcher
  - Title, price, tags, and description
  - Flower care guide & workshop schedule accordion
  - Razorpay checkout button (`useRazorpay`)
  - Automatic view counter incrementation (`/api/products/views`)
- [ ] `app/dashboard/page.tsx`:
  - Customer profile overview
  - Order history tab displaying items from `/api/user/purchases`
- [ ] `app/contact/page.tsx`:
  - Interactive contact & custom floral inquiry form connected to `POST /api/contact`
  - Studio address, opening hours, and booking info
- [ ] `app/admin/page.tsx`:
  - Admin metrics cards (Total Products, Paid Orders, Views)
  - Product management table with edit/add modals
  - Multi-image file uploader connected to `getUploadUrlAction`

### Shared Components
- [ ] `components/AuthDialog.tsx`: Modal for Sign In, Sign Up, and Google OAuth.
- [ ] `components/ProductCard.tsx`: Reusable floral product card with image, title, price, and instant checkout.
- [ ] `components/Footer.tsx`: Elegant footer with navigation, newsletter, and social links.
