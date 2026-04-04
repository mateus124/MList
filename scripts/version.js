import fs from "node:fs";

const manifestPath = "public/manifest.json";
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

const [majorRaw, minorRaw, patchRaw] = String(manifest.version || "0.0.0")
  .split(".")
  .map((value) => Number(value));

const major = Number.isFinite(majorRaw) ? majorRaw : 0;
const minor = Number.isFinite(minorRaw) ? minorRaw + 1 : 1;
const patch = Number.isFinite(patchRaw) ? 0 : 0;

const newVersion = `${major}.${minor}.${patch}`;
manifest.version = newVersion;

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`version=v${newVersion}`);
console.log(`manifest_version=${newVersion}`);
