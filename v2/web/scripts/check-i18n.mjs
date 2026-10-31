import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const enPath = path.resolve(__dirname, "../messages/en.json");
const hiPath = path.resolve(__dirname, "../messages/hi.json");

const en = JSON.parse(fs.readFileSync(enPath, "utf-8"));
const hi = JSON.parse(fs.readFileSync(hiPath, "utf-8"));

function getKeys(obj, prefix = "") {
  let keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      keys = keys.concat(getKeys(v, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const enKeys = new Set(getKeys(en));
const hiKeys = new Set(getKeys(hi));

const missingInHi = [...enKeys].filter((k) => !hiKeys.has(k));
const missingInEn = [...hiKeys].filter((k) => !enKeys.has(k));

if (missingInHi.length > 0 || missingInEn.length > 0) {
  console.error("❌ i18n Key Parity Check Failed!");
  if (missingInHi.length > 0) {
    console.error("Missing in Hindi (hi.json):", missingInHi);
  }
  if (missingInEn.length > 0) {
    console.error("Missing in English (en.json):", missingInEn);
  }
  process.exit(1);
} else {
  console.log(`✅ i18n Key Parity Check Passed: ${enKeys.size} translation keys synchronized.`);
  process.exit(0);
}
