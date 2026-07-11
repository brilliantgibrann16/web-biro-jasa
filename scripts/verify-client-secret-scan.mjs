import { readdir, readFile, stat } from "node:fs/promises";
import { relative, resolve } from "node:path";

const CLIENT_BUNDLE_DIR = resolve(".next", "static");
const TEXT_EXTENSIONS = new Set([".css", ".html", ".js", ".json", ".map", ".txt"]);
const FORBIDDEN_IDENTIFIERS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SECRET_KEY",
  "SUPABASE_DB_PASSWORD",
  "SUPABASE_TEST_ADMIN_EMAIL",
  "SUPABASE_TEST_ADMIN_PASSWORD",
];
const SENSITIVE_ENV_NAMES = [
  ...FORBIDDEN_IDENTIFIERS,
  "POSTGRES_PASSWORD",
];

function extensionOf(filePath) {
  const dotIndex = filePath.lastIndexOf(".");
  return dotIndex === -1 ? "" : filePath.slice(dotIndex).toLowerCase();
}

async function collectFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(entryPath)));
    } else if (entry.isFile() && TEXT_EXTENSIONS.has(extensionOf(entryPath))) {
      files.push(entryPath);
    }
  }
  return files;
}

async function main() {
  try {
    const bundleStats = await stat(CLIENT_BUNDLE_DIR);
    if (!bundleStats.isDirectory()) throw new Error();
  } catch {
    throw new Error("bundle client belum ada; jalankan npm run build lebih dulu");
  }

  const secretValues = SENSITIVE_ENV_NAMES.map((name) => process.env[name])
    .filter((value) => typeof value === "string")
    .map((value) => value.trim())
    .filter((value) => value.length >= 8);
  const findings = [];
  const files = await collectFiles(CLIENT_BUNDLE_DIR);

  for (const filePath of files) {
    const contents = await readFile(filePath, "utf8");
    const identifierHit = FORBIDDEN_IDENTIFIERS.some((name) =>
      contents.includes(name),
    );
    const secretValueHit = secretValues.some((secret) => contents.includes(secret));
    const secretKeyPatternHit = /\bsb_secret_[A-Za-z0-9_-]+/.test(contents);

    if (identifierHit || secretValueHit || secretKeyPatternHit) {
      findings.push(relative(process.cwd(), filePath));
    }
  }

  if (findings.length > 0) {
    console.error(
      `[FAIL] kemungkinan secret ditemukan pada ${findings.length} file bundle client`,
    );
    for (const file of findings.slice(0, 10)) console.error(`- ${file}`);
    if (findings.length > 10) console.error("- dan file lainnya");
    process.exitCode = 1;
    return;
  }

  console.log(
    `[PASS] ${files.length} file bundle client bebas dari credential Supabase terlarang`,
  );
}

main().catch((error) => {
  const message =
    error instanceof Error ? error.message : "secret scan gagal dijalankan";
  console.error(`[FAIL] ${message}`);
  process.exitCode = 1;
});
