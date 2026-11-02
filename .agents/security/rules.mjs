// 보안 규칙 — 정규식으로 잡히는 위험한 패턴만. 권한 로직 결함은 못 잡는다 → 보안 역할(roles/security.md)의 몫
// 줄 끝에 `security-ok: 이유` 를 적으면 그 줄은 통과한다. 이유 없는 예외는 통과하지 않는다
export const RULES = [
  { id: "SEC-SECRET", what: "비밀값이 코드에 있음", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----|\bAKIA[0-9A-Z]{16}\b|\b(api[_-]?key|secret|password|token)\b["']?\s*[:=]\s*["'][^"'\s]{12,}["']/i },
  { id: "SEC-EXEC", what: "셸 명령에 값을 이어 붙임", re: /\b(exec|execSync)\s*\(\s*(`[^`]*\$\{|["'][^"']*["']\s*\+|[A-Za-z_$][\w$.]*\s*\+)/ },
  { id: "SEC-EVAL", what: "문자열을 코드로 실행", re: /\beval\s*\(|\bnew\s+Function\s*\(/ },
  { id: "SEC-HTML", what: "검증 없는 HTML 삽입", re: /\.innerHTML\s*=[^=]|dangerouslySetInnerHTML|\bv-html\b/ },
  { id: "SEC-SQL", what: "SQL에 값을 이어 붙임", re: /\b(query|execute|raw|prepare)\s*\(\s*(`[^`]*\$\{|["'][^"']*["']\s*\+)/ },
  { id: "SEC-PATH", what: "요청 값으로 파일 경로를 만듦", re: /\b(path\.)?(join|resolve)\s*\([^)]*\breq(uest)?\.(params|query|body)\b/ },
  { id: "SEC-SSRF", what: "요청 값으로 외부 호출", re: /\b(fetch|axios(\.\w+)?|got)\s*\(\s*req(uest)?\.(params|query|body)\b/ },
  { id: "SEC-TLS", what: "인증서 검증을 끔", re: /rejectUnauthorized\s*:\s*false|NODE_TLS_REJECT_UNAUTHORIZED/ },
];

const EXCEPTION = /security-ok:\s*\S+/;
const SKIP = [/^\.agents\/security\//, /(^|\/)(tests?|__tests__|fixtures?)\//, /\.(test|spec)\.[cm]?[jt]sx?$/, /\.md$/];

export function scan(lines) {
  const found = [];
  for (const { file, line, text } of lines) {
    if (SKIP.some((re) => re.test(file)) || EXCEPTION.test(text)) continue;
    for (const rule of RULES) if (rule.re.test(text)) found.push({ id: rule.id, what: rule.what, file, line });
  }
  return found;
}

// git diff -U0 에서 추가된 줄만 뽑는다
export function addedLines(diff) {
  const out = [];
  let file = "", line = 0;
  for (const raw of diff.split("\n")) {
    if (raw.startsWith("+++ ")) { file = raw.slice(4).replace(/^b\//, ""); continue; }
    const hunk = /^@@ -\S+ \+(\d+)/.exec(raw);
    if (hunk) { line = Number(hunk[1]); continue; }
    if (raw.startsWith("+")) out.push({ file, line: line++, text: raw.slice(1) });
  }
  return out;
}
