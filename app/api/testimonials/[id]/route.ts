import { db } from "@/db/drizzle";
import { testimonialsTable } from "@/db/schema";
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

// PUT /api/testimonials/[id] (Admin only)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await requireAdminSession();
    if ("error" in authCheck) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const updateData: any = {};
    if (body.author !== undefined) updateData.author = body.author.trim();
    if (body.location !== undefined) updateData.location = body.location?.trim() || null;
    if (body.quote !== undefined) updateData.quote = body.quote.trim();
    if (body.rating !== undefined) updateData.rating = Math.max(1, Math.min(5, Number(body.rating)));
    if (body.isApproved !== undefined) updateData.isApproved = Boolean(body.isApproved);
    if (body.orderIndex !== undefined) updateData.orderIndex = Number(body.orderIndex);

    const [updated] = await db
      .update(testimonialsTable)
      .set(updateData)
      .where(eq(testimonialsTable.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ success: false, error: "Testimonial not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Error updating testimonial:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update testimonial" },
      { status: 500 }
    );
  }
}

// DELETE /api/testimonials/[id] (Admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await requireAdminSession();
    if ("error" in authCheck) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status }
      );
    }

    const { id } = await params;
    await db.delete(testimonialsTable).where(eq(testimonialsTable.id, id));

    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json({ success: true, message: "Testimonial deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting testimonial:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete testimonial" },
      { status: 500 }
    );
  }
}
