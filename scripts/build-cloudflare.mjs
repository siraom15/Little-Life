import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("../", import.meta.url));
const result = spawnSync(process.execPath, [require.resolve("next/dist/bin/next"), "build"], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, NEXT_STATIC_EXPORT: "1" },
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
for (const page of ["index.html", "404.html"]) {
  if (!existsSync(join(root, "out", page))) throw new Error("Missing static export: " + page);
}
console.log("Cloudflare static export ready in out/");
