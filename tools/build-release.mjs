import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist");
const MAX_RELEASE_BYTES = 16 * 1024 * 1024;
const manifestPath = path.join(root, "assets", "assets-manifest.json");
const assetManifest = JSON.parse(await readFile(manifestPath, "utf8"));

function collectAssetPaths(value, key = "") {
  if (!value || typeof value !== "object") return [];
  const paths = [];
  for (const [childKey, childValue] of Object.entries(value)) {
    if (childKey === "path" && typeof childValue === "string" && childValue) paths.push(childValue);
    else paths.push(...collectAssetPaths(childValue, childKey));
  }
  return paths;
}

const runtimeEntries = [
  "index.html",
  "style.css",
  "favicon.svg",
  "CNAME",
  "src",
  "vendor/phaser.min.js",
  "assets/assets-manifest.json",
  ...collectAssetPaths(assetManifest),
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const entry of [...new Set(runtimeEntries)]) {
  const source = path.resolve(root, entry);
  if (source !== root && !source.startsWith(root + path.sep)) throw new Error(`Invalid runtime path: ${entry}`);
  await mkdir(path.dirname(path.join(output, entry)), { recursive: true });
  await cp(source, path.join(output, entry), { recursive: true });
}

async function collectFiles(directory, base = directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(absolute, base));
    else files.push({ path: path.relative(base, absolute).replaceAll("\\", "/"), bytes: (await stat(absolute)).size });
  }
  return files;
}

const files = await collectFiles(output);
const totalBytes = files.reduce((sum, file) => sum + file.bytes, 0);
if (totalBytes > MAX_RELEASE_BYTES) {
  throw new Error(`Release is ${totalBytes} bytes; budget is ${MAX_RELEASE_BYTES} bytes.`);
}

const manifest = {
  schemaVersion: 1,
  totalBytes,
  budgetBytes: MAX_RELEASE_BYTES,
  files: files.sort((a, b) => a.path.localeCompare(b.path)),
};
await writeFile(path.join(output, "release-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
process.stdout.write(`Built ${files.length} runtime files (${totalBytes} bytes, budget ${MAX_RELEASE_BYTES}).\n`);
