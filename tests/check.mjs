// Zero-dependency static checks. Run: npm test   (or: node tests/check.mjs)
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
let fails = 0;
const ok = (m) => console.log("  PASS", m);
const bad = (m) => { fails++; console.log("  FAIL", m); };
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");
// exact-case existence (works on case-insensitive filesystems too)
function existsExact(rel) {
  const parts = rel.split("/").filter(Boolean); let dir = root;
  for (const p of parts) { if (!fs.existsSync(dir) || !fs.readdirSync(dir).includes(p)) return false; dir = path.join(dir, p); }
  return true;
}
const html = read("index.html"), css = read("css/styles.css");

console.log("1. Local file references (exact filename case)");
const refs = [...html.matchAll(/(?:src|href)="([^"#:]+?)"/g)].map((m) => m[1]).filter((r) => !r.startsWith("data:"));
refs.concat([...css.matchAll(/url\("?([^")]+?)"?\)/g)].map((m) => path.posix.join("css", m[1]))).forEach((r) => {
  const p = path.posix.normalize(r); existsExact(p) ? ok(p) : bad("missing or wrong case: " + p);
});

console.log("2. Asset manifest -> files");
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(read("js/assets-manifest.js"), ctx);
const A = ctx.window.FASTGEN_ASSETS;
[...Object.values(A.stills), ...Object.values(A.clips), ...A.unusedByDefault].forEach((f) => {
  const p = (f.includes("/") ? "assets/character/" : A.base) + f;
  existsExact(p) ? ok(p) : bad("manifest file missing: " + p);
});

console.log("3. In-page anchors have targets");
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
[...new Set([...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]))].forEach((a) => (ids.has(a) ? ok("#" + a) : bad("no target for #" + a)));

console.log("4. Contact config + URL formats");
vm.runInContext(read("js/config.js"), ctx);
const C = ctx.window.FASTGEN_CONFIG, sample = encodeURIComponent("Hello\nWorld");
const wa = `https://wa.me/${C.whatsapp}?text=${sample}`, mail = `mailto:${C.email}?subject=${encodeURIComponent("Project enquiry")}&body=${sample}`;
if (C.whatsapp === "") ok("WhatsApp not configured yet; button guarded");
else (/^\d{8,15}$/.test(C.whatsapp) && /^https:\/\/wa\.me\/[0-9]+\?text=/.test(wa)) ? ok("WhatsApp URL format valid") : bad("WhatsApp URL malformed");
/^mailto:[^@\s]+@[^@\s]+\?subject=/.test(mail) ? ok("mailto format valid") : bad("mailto malformed");
C.whatsapp === "91XXXXXXXXXX" || C.email === "hello@example.com" ? console.log("  NOTE placeholders still in js/config.js (expected until you replace them)") : ok("placeholders replaced");

console.log("5. Hygiene");
!/localStorage|sessionStorage/.test(read("js/main.js") + read("js/character.js")) ? ok("no browser storage used") : bad("storage API used");
!/https?:\/\/(?!wa\.me|www\.w3\.org)/.test(html) ? ok("no external hosts in HTML") : bad("external URL found in HTML");
/<html lang="en">/.test(html) && /<title>/.test(html) && /name="viewport"/.test(html) ? ok("lang, title, viewport present") : bad("head basics missing");
console.log(fails ? `\n${fails} check(s) FAILED` : "\nAll static checks passed");
process.exit(fails ? 1 : 0);
