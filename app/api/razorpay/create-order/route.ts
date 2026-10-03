import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { db } from "@/db/drizzle";
import { ordersTable, productsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const body = await req.json();
    const postId = body.postId || body.productId;

    if (!postId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Fetch product to retrieve price
    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, postId))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const amountInSmallestUnit = product.price ? Math.round(parseFloat(product.price) * 100) : 0;

    if (amountInSmallestUnit <= 0) {
      return NextResponse.json({ error: "Invalid price for checkout" }, { status: 400 });
    }

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Please sign in to place a floral order", requiresAuth: true },
        { status: 401 }
      );
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      city,
      postalCode,
      deliveryNotes,
    } = body;

    const isDemoMode =
      !process.env.RAZORPAY_KEY_ID ||
      !process.env.RAZORPAY_KEY_SECRET ||
      process.env.RAZORPAY_KEY_ID.includes("xxxxxx");

    // Demo Mode Checkout: Generates verified orders without needing merchant keys
    if (isDemoMode) {
      const demoOrderId = `order_demo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

      await db.insert(ordersTable).values({
        id: demoOrderId,
        userId: session.user.id,
        postId: product.id,
        amount: product.price || "0",
        status: "created",
        customerName: customerName || session.user.name || null,
        customerEmail: customerEmail || session.user.email || null,
        customerPhone: customerPhone || null,
        shippingAddress: shippingAddress || null,
        city: city || null,
        postalCode: postalCode || null,
        deliveryNotes: deliveryNotes || null,
      });

      return NextResponse.json({
        isDemo: true,
        orderId: demoOrderId,
        amount: amountInSmallestUnit,
        currency: "USD",
        productTitle: product.title,
      });
    }

    // Initialize Razorpay SDK if keys are configured
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const currency = process.env.RAZORPAY_CURRENCY || "USD";
    const options = {
      amount: amountInSmallestUnit,
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Save order record in database
    await db.insert(ordersTable).values({
      id: order.id,
      userId: session?.user?.id || null,
      postId: product.id,
      amount: product.price || "0",
      status: "created",
      customerName: customerName || session.user.name || null,
      customerEmail: customerEmail || session.user.email || null,
      customerPhone: customerPhone || null,
      shippingAddress: shippingAddress || null,
      city: city || null,
      postalCode: postalCode || null,
      deliveryNotes: deliveryNotes || null,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: options.amount,
      currency: options.currency,
    });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
