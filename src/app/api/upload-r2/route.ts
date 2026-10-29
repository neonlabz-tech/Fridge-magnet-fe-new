import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// Only these R2 folders can be written to from the website.
const ALLOWED_FOLDERS = ["orders", "receipts"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per file

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const requestedFolder = String(formData.get("folder") || "orders");
    const folder = ALLOWED_FOLDERS.includes(requestedFolder) ? requestedFolder : "orders";

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const urls: string[] = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "File too large" }, { status: 413 });
      }
      if (folder === "receipts" && !file.type.startsWith("image/")) {
        return NextResponse.json({ error: "Receipts must be images" }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split(".").pop() || "jpg";
      const key = `${folder}/${uuidv4()}.${ext}`;

      await r2.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: key,
          Body: buffer,
          ContentType: file.type,
        })
      );

      urls.push(`${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`);
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error("R2 upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
