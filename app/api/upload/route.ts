import { NextRequest, NextResponse } from "next/server";
import { auth, isConfiguredAdminEmail } from "@/lib/auth";
import { headers } from "next/headers";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized: Please sign in" }, { status: 401 });
    }

    if (!session.user.isAdmin && !isConfiguredAdminEmail(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized: Admin privileges required" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename and create unique name
    const ext = path.extname(file.name) || ".jpg";
    const cleanName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueFileName = `${Date.now()}-${uuidv4().slice(0, 8)}-${cleanName}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, uniqueFileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileKey: publicUrl,
    });
  } catch (error: any) {
    console.error("Local upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to save file" }, { status: 500 });
  }
}
