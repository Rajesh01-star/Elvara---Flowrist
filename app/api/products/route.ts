import { db } from "@/db/drizzle";
import { productsTable } from "@/db/schema";
import { PRODUCT_PUBLIC_FIELDS, getOrderByClause } from "@/db/queries";
import { arrayContains, eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") || "views";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "20"));
    const tagsParam = searchParams.get("tags");
    const assetType = searchParams.get("type") || searchParams.get("assetType");

    const tags = tagsParam
      ? tagsParam.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const orderByClause = getOrderByClause(sort);
    const offset = (page - 1) * limit;

    const conditions = [];
    if (tags.length > 0) {
      conditions.push(arrayContains(productsTable.tags, tags));
    }
    if (assetType) {
      conditions.push(eq(productsTable.assetType, assetType));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const products = await db
      .select(PRODUCT_PUBLIC_FIELDS)
      .from(productsTable)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: products,
      page,
      limit,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to fetch catalog items",
      },
      { status: 500 }
    );
  }
}
