import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt =
  "Biro Jasa Tiga Saudara — berkas dibaca dulu, proses dijalankan dengan rapi.";

export const size = {
  width: 1731,
  height: 909,
};

export const contentType = "image/png";

export default async function TwitterImage() {
  const image = await readFile(join(process.cwd(), "public", "og.png"));

  return new Response(image, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
