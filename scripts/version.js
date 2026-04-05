import fs from "node:fs";

const manifestPath = "public/manifest.json";
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

const bumpType = (process.argv[2] || "patch").toLowerCase();
const validBumps = new Set(["patch", "minor", "major"]);

if (!validBumps.has(bumpType)) {
  console.error('Uso: node scripts/version.js [patch|minor|major]');
  process.exit(1);
}

const [majorRaw, minorRaw, patchRaw] = String(manifest.version || "0.0.0")
  .split(".")
  .map((value) => Number(value));

let major = Number.isFinite(majorRaw) ? majorRaw : 0;
let minor = Number.isFinite(minorRaw) ? minorRaw : 0;
let patch = Number.isFinite(patchRaw) ? patchRaw : 0;

if (bumpType === "major") {
  major += 1;
  minor = 0;
  patch = 0;
} else if (bumpType === "minor") {
  minor += 1;
  patch = 0;
} else {
  patch += 1;
}

const newVersion = `${major}.${minor}.${patch}`;
manifest.version = newVersion;

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`version=v${newVersion}`);
console.log(`manifest_version=${newVersion}`);
