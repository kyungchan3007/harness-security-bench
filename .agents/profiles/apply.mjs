// 규모별 문서 구성 — node .agents/profiles/apply.mjs <small|medium|large>
// docs/ 에 빈 문서를 만든다. 이미 있는 문서는 덮어쓰지 않는다
import { copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const PROFILES = {
  small: ["sdd", "entities"],
  medium: ["ontology", "sdd", "entities"],
  large: ["ontology", "prd", "sdd", "entities"],
};

const HERE = dirname(fileURLToPath(import.meta.url));

export function apply(profile, root) {
  const docs = PROFILES[profile];
  if (!docs) throw new Error(`없는 구성: ${profile} (small · medium · large)`);
  const made = [];
  for (const doc of docs) {
    const to = join(root, "docs", `${doc}.md`);
    if (existsSync(to)) continue;
    copyFileSync(join(HERE, "templates", `${doc}.md`), to);
    made.push(`docs/${doc}.md`);
  }
  return made;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const profile = process.argv[2];
  if (!PROFILES[profile]) { console.error("사용법: npm run profile:apply -- <small|medium|large>"); process.exit(2); }
  const made = apply(profile, join(HERE, "../.."));
  console.log(`구성 ${profile}: ${PROFILES[profile].join(" · ")}\n만듦: ${made.join(", ") || "없음 (이미 있음)"}`);
}
