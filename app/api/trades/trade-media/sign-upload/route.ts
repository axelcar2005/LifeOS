import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

const BUCKET_NAME = "trade-media";
const MAX_FILE_SIZE = 120 * 1024 * 1024; // 120 MB

function sanitizeFileName(fileName: string) {
  const extension = fileName.includes(".")
    ? fileName.split(".").pop()?.toLowerCase()
    : "bin";

  const cleanName = fileName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

  return `${cleanName || "trade-media"}.${extension || "bin"}`;
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const fileName = String(body.fileName || "trade-media.bin");
    const fileType = String(body.fileType || "application/octet-stream");
    const fileSize = Number(body.fileSize || 0);

    if (!fileType.startsWith("image/") && !fileType.startsWith("video/")) {
      return NextResponse.json(
        { error: "Solo se permiten imágenes o videos." },
        { status: 400 }
      );
    }

    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "El archivo supera 120 MB. Reduce el peso o cambia el límite del bucket." },
        { status: 400 }
      );
    }

    const safeFileName = sanitizeFileName(fileName);
    const path = `${userId}/${Date.now()}-${crypto.randomUUID()}-${safeFileName}`;

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .createSignedUploadUrl(path);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: publicData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);

    return NextResponse.json({
      path,
      token: data.token,
      signedUrl: data.signedUrl,
      publicUrl: publicData.publicUrl,
    });
  } catch (error) {
    console.error("POST /api/trade-media/sign-upload error:", error);
    return NextResponse.json(
      { error: "Error preparando subida de media" },
      { status: 500 }
    );
  }
}
