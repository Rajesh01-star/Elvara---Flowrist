import { auth, isConfiguredAdminEmail } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import AdminAccessDenied from "@/components/admin/AdminAccessDenied";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/admin/login?callbackUrl=/admin");
  }

  // Self-heal: If user is listed in ADMIN_EMAILS, automatically grant admin status
  let isAdmin = session.user.isAdmin;
  if (!isAdmin && isConfiguredAdminEmail(session.user.email)) {
    await db
      .update(user)
      .set({ isAdmin: true, updatedAt: new Date() })
      .where(eq(user.id, session.user.id));
    isAdmin = true;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-stone-50">
        <AdminAccessDenied user={session.user} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/50 flex flex-col">
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
