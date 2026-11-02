// 보안 게이트 — 기준 커밋 이후 바뀐 줄만 검사한다
//   node .agents/security/check.mjs [기준]   기준 생략: origin/main, 없으면 HEAD
//   --audit  잠금 파일이 있으면 npm audit (high 이상) 도 돌린다
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "../scripts/lib.mjs";
import { addedLines, scan } from "./rules.mjs";

const git = (...args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 28 });
const args = process.argv.slice(2);
const base = args.find((a) => !a.startsWith("--")) ?? (spawnSync("git", ["rev-parse", "--verify", "-q", "origin/main"], { cwd: ROOT }).status === 0 ? "origin/main" : "HEAD");

const lines = addedLines(git("diff", "-U0", base));
for (const file of git("ls-files", "-o", "--exclude-standard").split("\n").filter(Boolean)) {
  readFileSync(join(ROOT, file), "utf8").split("\n").forEach((text, i) => lines.push({ file, line: i + 1, text }));
}

let fail = false;
const found = scan(lines);
for (const f of found) console.error(`❌ ${f.id} ${f.file}:${f.line} — ${f.what}`);
if (found.length) fail = true;

if (args.includes("--audit")) {
  if (existsSync(join(ROOT, "package-lock.json"))) {
    const audit = spawnSync("npm", ["audit", "--audit-level=high"], { cwd: ROOT, encoding: "utf8" });
    if (audit.status !== 0) { console.error(`❌ SEC-AUDIT — npm audit 실패\n${audit.stdout}${audit.stderr}`); fail = true; }
  } else console.log("⚠️ SEC-AUDIT 건너뜀 — package-lock.json 없음");
}

console.log(fail ? "보안 게이트: ❌ FAIL" : `보안 게이트: ✅ PASS (${lines.length}줄 검사, 기준 ${base})`);
process.exit(fail ? 1 : 0);
