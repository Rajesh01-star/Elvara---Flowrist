"use server";

import { db } from "@/db/drizzle";
import { productsTable, ordersTable, systemSettingsTable } from "@/db/schema";
import { PRODUCT_SELECT_FIELDS, PRODUCT_PUBLIC_FIELDS, getOrderByClause } from "@/db/queries";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, desc, sql, arrayContains, and } from "drizzle-orm";
import { getUploadPresignedUrl, getDownloadPresignedUrl } from "@/lib/r2";
import { v4 as uuidv4 } from "uuid";

export async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user || !session.user.isAdmin) {
    throw new Error("Unauthorized: Only administrators can perform this action");
  }
  return session;
}

export async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user) {
    throw new Error("Unauthorized: Please sign in");
  }
  return session;
}

function parseFormFields(formData: FormData) {
  return {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    price: formData.get("price") as string,
    url: formData.get("url") as string,
    aspect: (formData.get("aspect") as "horizontal" | "vertical") || "horizontal",
    activeThumbnailIndex: parseInt((formData.get("activeThumbnailIndex") as string) || "0"),
    assetType: (formData.get("assetType") as string) || "bouquets",
    sourceLink: formData.get("sourceLink") as string,
    tags: JSON.parse((formData.get("tags") as string) || "[]"),
    thumbnails: JSON.parse((formData.get("thumbnails") as string) || "[]"),
    references: JSON.parse((formData.get("references") as string) || "[]"),
    fileUrl: (formData.get("fileUrl") as string) || null,
  };
}

/**
 * Generates presigned URL for direct client upload to Cloudflare R2
 */
export async function getUploadUrlAction(
  fileName: string,
  fileType: string,
  isPublic = false,
  postId?: string
) {
  await requireAdmin();

  const folderId = postId || uuidv4();
  const subFolder = isPublic ? "images" : "downloads";
  const fileKey = `catalog/${folderId}/${subFolder}/${uuidv4()}-${fileName}`;
  const uploadUrl = await getUploadPresignedUrl(fileKey, fileType, isPublic);

  return { uploadUrl, fileKey };
}

export async function createProductAction(formData: FormData) {
  const session = await requireAdmin();
  const fields = parseFormFields(formData);

  if (!fields.title) {
    throw new Error("Title is required");
  }

  await db.insert(productsTable).values({
    title: fields.title,
    description: fields.description || null,
    price: fields.price ? fields.price : null,
    url: fields.url || null,
    aspect: fields.aspect || "horizontal",
    thumbnails: fields.thumbnails,
    activeThumbnailIndex: fields.activeThumbnailIndex,
    assetType: fields.assetType,
    sourceLink: fields.sourceLink || null,
    tags: fields.tags,
    fileUrl: fields.fileUrl,
    references: fields.references,
    userId: session.user.id,
  });

  revalidatePath("/");
  revalidatePath("/collections");
  revalidatePath("/bouquets");
  revalidatePath("/admin");

  return { success: true };
}

export const createPostAction = createProductAction;

export async function updateProductAction(formData: FormData) {
  await requireAdmin();
  const fields = parseFormFields(formData);
  const id = formData.get("id") as string;

  if (!id || !fields.title) {
    throw new Error("ID and Title are required");
  }

  const updateData: any = {
    title: fields.title,
    description: fields.description || null,
    price: fields.price ? fields.price : null,
    url: fields.url || null,
    aspect: fields.aspect || "horizontal",
    thumbnails: fields.thumbnails,
    activeThumbnailIndex: fields.activeThumbnailIndex,
    assetType: fields.assetType,
    sourceLink: fields.sourceLink || null,
    tags: fields.tags,
    references: fields.references,
  };

  if (fields.fileUrl) {
    updateData.fileUrl = fields.fileUrl;
  }

  await db.update(productsTable).set(updateData).where(eq(productsTable.id, id));

  revalidatePath("/");
  revalidatePath("/collections");
  revalidatePath("/bouquets");
  revalidatePath("/admin");

  return { success: true };
}

export const updatePostAction = updateProductAction;

export async function getProductsAction() {
  await requireAdmin();

  const items = await db
    .select(PRODUCT_SELECT_FIELDS)
    .from(productsTable)
    .orderBy(desc(productsTable.createdAt));
  return items;
}

export const getPostsAction = getProductsAction;

export async function getPublicProductsAction(sort: string = "views", tags: string[] = []) {
  const orderByClause = getOrderByClause(sort);
  const whereClause = tags && tags.length > 0 ? arrayContains(productsTable.tags, tags) : undefined;

  const items = await db
    .select(PRODUCT_PUBLIC_FIELDS)
    .from(productsTable)
    .where(whereClause)
    .orderBy(orderByClause);
  return items;
}

export const getPublicPostsAction = getPublicProductsAction;

export async function getPublicProductsByTypeAction(type: string, sort: string = "views") {
  const orderByClause = getOrderByClause(sort);

  const items = await db
    .select(PRODUCT_PUBLIC_FIELDS)
    .from(productsTable)
    .where(eq(productsTable.assetType, type))
    .orderBy(orderByClause);
  return items;
}

export const getPublicPostsByTypeAction = getPublicProductsByTypeAction;

export async function getPublicProductByIdAction(id: string) {
  const items = await db
    .select(PRODUCT_PUBLIC_FIELDS)
    .from(productsTable)
    .where(eq(productsTable.id, id));
  return items[0] || null;
}

export const getPublicPostByIdAction = getPublicProductByIdAction;

/**
 * Generates secure temporary download link for files if user purchased or is admin
 */
export async function getProductFileUrlAction(id: string) {
  const session = await requireAuth();

  if (!session.user.isAdmin) {
    const purchases = await db
      .select()
      .from(ordersTable)
      .where(
        and(
          eq(ordersTable.userId, session.user.id),
          eq(ordersTable.postId, id),
          eq(ordersTable.status, "paid")
        )
      );

    if (purchases.length === 0) {
      // Check if product is free
      const product = await db
        .select({ price: productsTable.price })
        .from(productsTable)
        .where(eq(productsTable.id, id));
      const isFree = !product[0]?.price || parseFloat(product[0].price) <= 0;
      if (!isFree) {
        throw new Error("You have not purchased this item");
      }
    }
  }

  const items = await db
    .select({ fileUrl: productsTable.fileUrl, title: productsTable.title })
    .from(productsTable)
    .where(eq(productsTable.id, id));

  const fileUrl = items[0]?.fileUrl;
  if (!fileUrl) return null;

  if (fileUrl.startsWith("data:") || fileUrl.startsWith("http")) {
    return fileUrl;
  }

  try {
    const signedUrl = await getDownloadPresignedUrl(
      fileUrl,
      `${items[0].title || "item"}.zip`
    );
    return signedUrl;
  } catch (error) {
    console.error("Failed to generate download URL from R2:", error);
    throw new Error("Failed to generate secure download link.");
  }
}

export const getPostFileUrlAction = getProductFileUrlAction;

export async function getShopStatsAction() {
  try {
    // 1. Total products count
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(productsTable);
    const totalCount = Number(countResult[0]?.count || 0);

    // 2. Total orders count
    const ordersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(ordersTable)
      .where(eq(ordersTable.status, "paid"));
    const paidOrders = Number(ordersResult[0]?.count || 0);

    // 3. New products in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newItemsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(productsTable)
      .where(sql`${productsTable.createdAt} >= ${thirtyDaysAgo}`);
    const newMonthlyItems = Number(newItemsResult[0]?.count || 0);

    // 4. Sum of all views across all items
    const totalViewsResult = await db
      .select({ totalViews: sql<number>`sum(${productsTable.views})` })
      .from(productsTable);
    const totalViews = Number(totalViewsResult[0]?.totalViews || 0);

    return {
      totalCount,
      paidOrders,
      newMonthlyItems,
      totalViews,
    };
  } catch (err) {
    console.error("Failed to fetch shop stats:", err);
    return {
      totalCount: 0,
      paidOrders: 0,
      newMonthlyItems: 0,
      totalViews: 0,
    };
  }
}

export const getMarketplaceStatsAction = getShopStatsAction;

export async function getSystemSettingsAction() {
  try {
    const settings = await db.select().from(systemSettingsTable);
    const settingsMap: Record<string, string> = {};
    for (const item of settings) {
      settingsMap[item.key] = item.value;
    }
    return settingsMap;
  } catch (error) {
    console.error("Failed to fetch system settings:", error);
    return {};
  }
}

export async function updateSystemSettingAction(key: string, value: string) {
  await requireAdmin();

  const existing = await db
    .select()
    .from(systemSettingsTable)
    .where(eq(systemSettingsTable.key, key));

  if (existing.length > 0) {
    await db.update(systemSettingsTable).set({ value }).where(eq(systemSettingsTable.key, key));
  } else {
    await db.insert(systemSettingsTable).values({ key, value });
  }

  revalidatePath("/");
  revalidatePath("/admin");

  return { success: true };
}
