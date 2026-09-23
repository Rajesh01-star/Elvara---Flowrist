import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { ordersTable, productsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Join orders (status = 'paid') with products to return purchased items
    const purchases = await db
      .select({
        orderId: ordersTable.id,
        paymentId: ordersTable.paymentId,
        amount: ordersTable.amount,
        purchasedAt: ordersTable.createdAt,
        postId: productsTable.id,
        title: productsTable.title,
        description: productsTable.description,
        price: productsTable.price,
        url: productsTable.url,
        aspect: productsTable.aspect,
        imageUrl: productsTable.imageUrl,
        thumbnails: productsTable.thumbnails,
        activeThumbnailIndex: productsTable.activeThumbnailIndex,
      })
      .from(ordersTable)
      .innerJoin(productsTable, eq(ordersTable.postId, productsTable.id))
      .where(
        and(
          eq(ordersTable.userId, session.user.id),
          eq(ordersTable.status, "paid")
        )
      )
      .orderBy(ordersTable.createdAt);

    return NextResponse.json({ purchases });
  } catch (error: any) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}
