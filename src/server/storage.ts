import { createHash, randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { fileTypeFromBuffer } from "file-type";
import {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from "@/lib/constants";

function uploadRoot() {
  const dir = process.env.UPLOAD_DIR;
  if (dir && path.isAbsolute(dir)) return dir;
  return path.join(/* turbopackIgnore: true */ process.cwd(), "storage", "uploads");
}

export async function ensureUploadDir() {
  await mkdir(uploadRoot(), { recursive: true });
}

function extensionFromName(name: string) {
  const idx = name.lastIndexOf(".");
  return idx >= 0 ? name.slice(idx).toLowerCase() : "";
}

export async function validateAndStoreFile(
  file: File,
): Promise<
  | {
      ok: true;
      storageKey: string;
      mimeType: string;
      sizeBytes: number;
      sha256: string;
      originalName: string;
    }
  | { ok: false; message: string }
> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { ok: false, message: `File too large: ${file.name}` };
  }

  const ext = extensionFromName(file.name);
  if (!ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number])) {
    return { ok: false, message: `File type not allowed: ${file.name}` };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = await fileTypeFromBuffer(buffer);

  const isDocx =
    ext === ".docx" &&
    detected?.mime === "application/zip" &&
    file.name.toLowerCase().endsWith(".docx");

  const mimeOk =
    (detected && ALLOWED_MIME_TYPES.includes(detected.mime as (typeof ALLOWED_MIME_TYPES)[number])) ||
    isDocx;

  if (!mimeOk) {
    return { ok: false, message: `File content does not match allowed types: ${file.name}` };
  }

  const mimeType = isDocx
    ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    : (detected?.mime ?? file.type);

  await ensureUploadDir();
  const storageKey = randomUUID();
  const fullPath = path.join(uploadRoot(), storageKey);
  await writeFile(fullPath, buffer);

  const sha256 = createHash("sha256").update(buffer).digest("hex");

  return {
    ok: true,
    storageKey,
    mimeType,
    sizeBytes: buffer.length,
    sha256,
    originalName: path.basename(file.name),
  };
}

export function resolveStoragePath(storageKey: string) {
  return path.join(uploadRoot(), storageKey);
}

export async function deleteStoredFile(storageKey: string) {
  try {
    await unlink(resolveStoragePath(storageKey));
  } catch {
    // ignore missing file
  }
}
