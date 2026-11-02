import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { apply, PROFILES } from "./apply.mjs";

function project() {
  const root = mkdtempSync(join(tmpdir(), "profile-"));
  mkdirSync(join(root, "docs"));
  return root;
}

test("문서 구성: 규모별로 정해진 문서만 만든다", () => {
  const want = { small: ["entities.md", "sdd.md"], medium: ["entities.md", "ontology.md", "sdd.md"], large: ["entities.md", "ontology.md", "prd.md", "sdd.md"] };
  for (const profile of Object.keys(PROFILES)) {
    const root = project();
    apply(profile, root);
    assert.deepEqual(readdirSync(join(root, "docs")).sort(), want[profile], profile);
    rmSync(root, { recursive: true });
  }
});

test("문서 구성: 있는 문서는 덮어쓰지 않고, 없는 구성은 거부한다", () => {
  const root = project();
  writeFileSync(join(root, "docs/sdd.md"), "내 설계");
  assert.deepEqual(apply("small", root), ["docs/entities.md"]);
  assert.equal(readFileSync(join(root, "docs/sdd.md"), "utf8"), "내 설계");
  assert.throws(() => apply("huge", root));
  assert.equal(existsSync(join(root, "docs/ontology.md")), false);
  rmSync(root, { recursive: true });
});
