const fs = require("fs");
const lines = fs.readFileSync("server.js", "utf8").split("\n");
console.log("=== app.get/app.post/app.put/app.delete + app.use + app.all routes (first 60) ===");
let count = 0;
lines.forEach((l, i) => {
  const t = l.trim();
  if (/^app\.(get|post|put|delete|use|all)\(/.test(t)) {
    if (count < 60) console.log((i + 1) + ": " + t.slice(0, 90));
    count++;
  }
});
console.log("=== total app routes:", count, "===");
// find location of blog insert
const blogIdx = lines.findIndex((l) => l.includes("BLOG MANAGEMENT"));
console.log("BLOG MANAGEMENT at line:", blogIdx + 1);
// check what's right before settings endpoint (to make sure blog INSERT is in the correct handler order)
const settingsIdx = lines.findIndex((l) => l.includes('app.get("/api/admin/settings"'));
console.log("settings endpoint at line:", settingsIdx + 1);
// list the 15 lines before blog insert to see context
console.log("=== context 5 lines before blog section ===");
for (let i = blogIdx - 6; i < blogIdx + 3; i++) {
  console.log((i + 1) + ": " + lines[i]);
}