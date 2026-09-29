# 0.159.0 여러 세션 동시 작업 규칙과 버전 점검

사용자 요청 2026-09-29: "1번 진행해줘"(직전 보고의 다음 단계 제안 1번 "여러 세션 동시 작업 정리: 세션마다 다른 작업 브랜치를 쓰도록 정하면 버전 충돌과 번호 중복이 줄어듭니다").

## 1. 무엇이 문제였나

2026-09-29 하루 동안 여러 세션이 거의 동시에 main에 병합했습니다.

| 겪은 일 | 예 |
|---|---|
| 작업 중에 main 번호가 먼저 올라가 다시 합치고 번호를 바꿈 | QMS-88UX WALL·DUAL 정리가 0.149 → 0.151 → 0.152로, QMS-44UX DUAL 정리가 0.154 → 0.155 → 0.156으로 밀림 |
| 서로 다른 PR이 같은 번호를 씀 | #210과 #211이 모두 커밋 제목에 `0.154.0`을 씀(#211의 CHANGELOG는 0.155.0) |
| 같은 기능을 두 세션이 겹쳐 만듦 | QMS-88UX WALL "출력 9·10번" 문장을 #211과 #213이 각각 넣으려 함 |
| 병합된 브랜치를 강제 push로 되돌림 | 0.152 배포 기록 때 `--force-with-lease` 한 번 사용(CLAUDE.md·`.claude/settings.json` 금지 명령) |

## 2. 정한 규칙 (CLAUDE.md "Git 명령 정책" → "여러 세션이 동시에 작업할 때")

1. 세션마다 시스템이 정해 준 자기 작업 브랜치 하나만 씁니다. 다른 세션의 브랜치에는 push하지 않습니다.
2. 작업하는 동안에는 버전을 "main 버전 + 1"로 임시로 적고, 병합 직전에 확정합니다. 파일 이름에 버전이 들어가는 문서도 이때 맞춥니다.
3. 병합 직전 순서: `git fetch origin main` → main이 바뀌었으면 작업 브랜치에 병합 → 번호를 main + 1로 다시 정함 → 기본 검증 + `node scripts/check-version.cjs --against origin/main` → push → 방금 push한 커밋으로 병합(`expectedHeadSha`). 그 사이 main이 또 바뀌면 처음부터 다시 합니다.
4. 문서만 바뀐 PR(배포 기록 등)은 버전을 올리지 않습니다.
5. 병합이 끝난 작업 브랜치를 이어 쓸 때는 강제 push 대신 main을 병합해 차이를 없앱니다.

## 3. 점검 도구 `scripts/check-version.cjs`

- 기본 실행: 버전 표기 네 곳이 같은지 확인합니다. index.html "CATALOG BASED · 0.N", README "현재 버전: 0.N", CHANGELOG 첫 "## 0.N.0", CLAUDE.md 이력의 마지막 "`0.N.0`으로 기록"과 "다음 기능 묶음은 `0.(N+1).0`"입니다. CHANGELOG에 같은 버전 제목이 두 번 있어도 실패합니다.
- `--against origin/main`: main의 index.html 버전과 비교합니다. 문서 밖 파일(`docs/`·`CHANGELOG.md` 밖)이 바뀌었으면 main + 1이어야 하고, 문서만 바뀌었으면 main과 같아야 합니다. main보다 낮거나 두 단계 이상 높으면 실패합니다.
- 단위 테스트 2건(`tests/site.test.cjs`): 현재 저장소의 네 곳 일치, 그리고 가짜 내용으로 중복·낮은 번호·건너뛴 번호·문서만 바꾼 PR의 번호 올림을 잡는지 확인합니다.
- `.claude/settings.json` 허용 명령에 `node scripts/check-version.cjs`를 더했습니다.

## 4. 한계

- GitHub에는 병합을 막는 필수 검사(CI)가 없어, 이 점검은 세션이 규칙대로 실행할 때만 효과가 있습니다. 두 세션이 몇 초 차이로 병합하면 여전히 겹칠 수 있으나, 병합 직전 fetch와 `expectedHeadSha` 고정으로 그 틈을 줄입니다.
- 이미 main에 남은 커밋 제목(#211의 "0.154.0")은 기록이라 고치지 않습니다. CHANGELOG에는 0.154.0(#210)·0.155.0(#211)으로 바르게 남아 있습니다.

## 검증

`node --test tests/*.test.cjs`, `build-product-index --check`, `package-site`, e2e, `check-version.cjs --against origin/main`, `git diff --check`. 결과는 PR 설명에 적습니다.

## 되돌리기

병합 커밋을 되돌리면 규칙·스크립트·테스트가 함께 빠집니다. 화면·데이터 변경은 없습니다.
