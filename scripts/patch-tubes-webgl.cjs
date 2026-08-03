/**
 * threejs-components TubesCursor hardcodes WebGPURenderer options.
 * Force WebGL so tubes present reliably (WebGPU often clears with no draw).
 */
const fs = require("fs");
const path = require("path");

const target = path.join(
  __dirname,
  "..",
  "node_modules",
  "threejs-components",
  "build",
  "cursors",
  "tubes1.min.js",
);

if (!fs.existsSync(target)) {
  console.warn("[patch-tubes-webgl] tubes1.min.js not found — skip");
  process.exit(0);
}

const from = "rendererOptions:{alpha:!0,antialias:!1}";
const to = "rendererOptions:{alpha:!0,antialias:!1,forceWebGL:!0}";
const src = fs.readFileSync(target, "utf8");

if (src.includes(to)) {
  console.log("[patch-tubes-webgl] already patched");
  process.exit(0);
}

if (!src.includes(from)) {
  console.warn("[patch-tubes-webgl] expected snippet missing — skip");
  process.exit(0);
}

fs.writeFileSync(target, src.replace(from, to));
console.log("[patch-tubes-webgl] forced WebGL backend");
