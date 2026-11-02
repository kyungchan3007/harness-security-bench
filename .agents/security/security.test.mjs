import assert from "node:assert/strict";
import test from "node:test";
import { addedLines, RULES, scan } from "./rules.mjs";

const hit = (text, file = "src/a.js") => scan([{ file, line: 1, text }]).map((f) => f.id);

test("보안 규칙: 위험한 줄을 잡는다", () => {
  const cases = {
    "SEC-SECRET": 'const password = "abcd1234efgh5678";',
    "SEC-EXEC": "exec(`git log ${ref}`);",
    "SEC-EVAL": "eval(input);",
    "SEC-HTML": "el.innerHTML = name;",
    "SEC-SQL": "db.query(`select * from t where id = ${id}`);",
    "SEC-PATH": "path.join(root, req.params.file);",
    "SEC-SSRF": "fetch(req.query.url);",
    "SEC-TLS": "new Agent({ rejectUnauthorized: false });",
  };
  assert.deepEqual(Object.keys(cases).sort(), RULES.map((r) => r.id).sort());
  for (const [id, text] of Object.entries(cases)) assert.deepEqual(hit(text), [id], text);
});

test("보안 규칙: 안전한 줄은 통과한다", () => {
  for (const text of ['execFile("git", ["log", ref]);', 'db.query("select * from t where id = ?", [id]);', 'el.textContent = name;', "if (el.innerHTML === saved) reset();", "const password = input.password;", "path.join(root, safeName);"]) {
    assert.deepEqual(hit(text), [], text);
  }
});

test("보안 규칙: 이유 있는 예외와 테스트 파일은 건너뛴다", () => {
  assert.deepEqual(hit("eval(input); // security-ok: 샌드박스 안에서만 실행"), []);
  assert.deepEqual(hit("eval(input); // security-ok:"), ["SEC-EVAL"]);
  assert.deepEqual(hit("eval(input);", "src/a.test.js"), []);
});

test("보안 게이트: 추가된 줄만, 줄 번호와 함께 뽑는다", () => {
  const diff = "--- a/src/a.js\n+++ b/src/a.js\n@@ -3 +3,2 @@\n-eval(old);\n+safe();\n+eval(input);\n";
  assert.deepEqual(addedLines(diff), [{ file: "src/a.js", line: 3, text: "safe();" }, { file: "src/a.js", line: 4, text: "eval(input);" }]);
});
