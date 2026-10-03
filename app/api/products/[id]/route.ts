import { db } from "@/db/drizzle";
import { productsTable } from "@/db/schema";
import { PRODUCT_PUBLIC_FIELDS } from "@/db/queries";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth, isConfiguredAdminEmail } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function requireAdminSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return { error: "Unauthorized: Please sign in", status: 401 };
  }

  if (!session.user.isAdmin && !isConfiguredAdminEmail(session.user.email)) {
    return { error: "Unauthorized: Admin privileges required", status: 403 };
  }

  return { session };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [product] = await db
      .select(PRODUCT_PUBLIC_FIELDS)
      .from(productsTable)
      .where(eq(productsTable.id, id))
      .limit(1);

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await requireAdminSession();
    if ("error" in authCheck) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
    }

    const { id } = await params;
    const body = await request.json();

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.price !== undefined) updateData.price = body.price ? body.price.toString().trim() : null;
    if (body.url !== undefined) updateData.url = body.url || null;
    if (body.aspect !== undefined) updateData.aspect = body.aspect;
    if (body.assetType !== undefined) updateData.assetType = body.assetType;
    if (body.thumbnails !== undefined) updateData.thumbnails = body.thumbnails;
    if (body.activeThumbnailIndex !== undefined) updateData.activeThumbnailIndex = body.activeThumbnailIndex;
    if (body.sourceLink !== undefined) updateData.sourceLink = body.sourceLink || null;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.fileUrl !== undefined) updateData.fileUrl = body.fileUrl || null;
    if (body.references !== undefined) updateData.references = body.references;

    const [updated] = await db
      .update(productsTable)
      .set(updateData)
      .where(eq(productsTable.id, id))
      .returning();

    revalidatePath("/");
    revalidatePath("/collections");
    revalidatePath("/bouquets");
    revalidatePath("/admin");

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await requireAdminSession();
    if ("error" in authCheck) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status });
    }

    const { id } = await params;
    await db.delete(productsTable).where(eq(productsTable.id, id));

    revalidatePath("/");
    revalidatePath("/collections");
    revalidatePath("/bouquets");
    revalidatePath("/admin");

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
