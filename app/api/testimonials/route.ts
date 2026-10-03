import { db } from "@/db/drizzle";
import { testimonialsTable } from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";
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

// GET /api/testimonials
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get("all") === "true";

    let query = db.select().from(testimonialsTable);

    if (!showAll) {
      const items = await db
        .select()
        .from(testimonialsTable)
        .where(eq(testimonialsTable.isApproved, true))
        .orderBy(asc(testimonialsTable.orderIndex), desc(testimonialsTable.createdAt));
      return NextResponse.json({ success: true, data: items });
    }

    const items = await query.orderBy(asc(testimonialsTable.orderIndex), desc(testimonialsTable.createdAt));
    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

// POST /api/testimonials (Admin only)
export async function POST(request: Request) {
  try {
    const authCheck = await requireAdminSession();
    if ("error" in authCheck) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status }
      );
    }

    const body = await request.json();
    const { author, location, quote, rating, isApproved, orderIndex } = body;

    if (!author?.trim() || !quote?.trim()) {
      return NextResponse.json(
        { success: false, error: "Author name and testimonial quote are required" },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(testimonialsTable)
      .values({
        author: author.trim(),
        location: location?.trim() || null,
        quote: quote.trim(),
        rating: typeof rating === "number" ? Math.max(1, Math.min(5, rating)) : 5,
        isApproved: isApproved !== undefined ? Boolean(isApproved) : true,
        orderIndex: typeof orderIndex === "number" ? orderIndex : 0,
      })
      .returning();

    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create testimonial" },
      { status: 500 }
    );
  }
}
