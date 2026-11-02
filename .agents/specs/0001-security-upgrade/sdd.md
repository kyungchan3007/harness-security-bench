# SDD — 어떻게

> 요구사항: [prd.md](prd.md)

## 접근
- 원본 파일은 고치지 않고 새 파일로 더한다. 나중에 원본 템플릿으로 옮기기 쉽다
- 규모별 문서: `.agents/profiles/` 의 빈 문서를 `docs/` 로 복사한다
- 보안 2겹: 정규식 게이트는 패턴을, 서브에이전트는 권한 · 흐름 결함을 맡는다
- 게이트는 바뀐 줄만 검사해 기존 코드 때문에 막히지 않게 한다

## 대안 · 트레이드오프
- 게이트를 `checks.sh` 에 바로 연결 → 보호 파일이라 승인이 필요하고, 조건 A · B에서 끌 방법도 필요해 보류
- 외부 SAST 도구 사용 → 템플릿의 의존성 0 원칙과 맞지 않아 먼저 내장 규칙으로 시작
- 실험을 다른 저장소로 분리 → 결과를 템플릿에 바로 반영하려고 한 저장소에 둠

## 파일 계획
- .agents/specs/0001-security-upgrade/**
- .agents/profiles/**
- .agents/security/**
- .agents/orchestration/roles/security.md
- .agents/orchestration/README.md
- .claude/agents/security.md
- experiments/security/**
- package.json
- CHANGELOG.md

## 계획 밖 변경 이유

## 위험
- 정규식 규칙은 오탐과 미탐이 있다. 실험의 오차단율로 드러난다
- 규칙이 후보 CVE에 맞춰지면 결과가 부풀려진다. 패치를 보지 않고 썼고, 이후 수정은 별도 회차로 잰다
- 공개 저장소라 정답지가 올라가면 사람 기준선이 무효가 된다

## 검증 계획
- `npm test` 로 구성 적용과 보안 규칙 테스트
- `npm run security:check` 를 실제 저장소에 실행
- 일부러 위험한 줄을 넣어 게이트가 막는지 확인 후 제거
- `bash .agents/checks.sh`

## 계획과 달라진 점
- 저장소를 비공개로 만들었다가 사용자 요청으로 공개 전환했다
