import { db } from "@/db/drizzle";
import { productsTable } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = body.id || body.postId;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Item ID is required" },
        { status: 400 }
      );
    }

    // Atomically increment the view counter
    const result = await db
      .update(productsTable)
      .set({ views: sql`${productsTable.views} + 1` })
      .where(eq(productsTable.id, id))
      .returning({ views: productsTable.views });

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, views: result[0].views },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update views" },
      { status: 500 }
    );
  }
}
