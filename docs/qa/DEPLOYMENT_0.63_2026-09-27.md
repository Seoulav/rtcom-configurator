# 0.63.0 GitHub Pages 배포 기록

- 배포일: 2026-09-27
- 사용자 승인: "2가지 세션모두 다 끝나면 병합해서 깃허브 배포해줘"
- 소스 병합: PR #43 → `main` 병합 커밋 `2f3176a3c8d98e7586f427c0a10bdb7d5e07bd7c`(PR head `2f6f5f0863da826285ed856ea5cb1e7b438178df`)
- 배포 방법: `Deploy RTCOM to GitHub Pages`(`.github/workflows/pages.yml`)를 `main`에서 실행
- GitHub Actions run: `36330263948`(run 39), `completed / success`, head_sha가 병합 커밋과 일치
- 공개 URL: `https://seoulav.github.io/rtcom-configurator/`

## 이번에 공개된 내용(0.62.0·0.63.0)

| 작업 | 내용 |
|---|---|
| 0.63.0 QMS-44UX·QMS-88UX 06 화면 구성 모드 카드 넘침 수정 | `videoModesSection`이 05 주요 기능 옆 좁은 칸(360px)에 배치될 수 있어 모드 카드 4개의 설명 문단·레이아웃 칩(최대 12개)이 카드 밖으로 넘쳤습니다(사용자 확인 2026-09-27 "QMS-44UX/QMS-88UX 06화면모드 짤린다"). `edidSwitchSection`과 같은 기준으로 항상 전체 폭 아래(belowCards)에 렌더링하도록 바꿨습니다. |
| 0.62.0 HD-210U·HD-13U 05 주요 기능 정리 | 딥 스위치 번호·로터리 코드·조작 방법 같은 상세는 06·07 카드에만 두고, 05에는 기능 이름만 "~ 지원" 어투로 남겼습니다(HD-210U 5줄, HD-13U 3줄). PR #42에서 빠졌던 HD-210U 오디오 병합·DDC 기능 이름을 스위치 번호 없이 다시 넣었습니다. |
| 0.62.0 HDS-21U·HDS-42MU 딥 스위치 칸 좌우 바꿈 | 07 딥 스위치 설정의 두 칸 순서를 ON → OFF로 바꿨습니다(`dipSwitch.order`). HD-210U는 OFF → ON 그대로입니다. |

- 근거·화면: `docs/qa/HD210U_FEATURES_CLEANUP_QA_2026-09-27.md`
- 병합 전 검증(PR #43 기준): `node --test tests/*.test.cjs` 39/39 통과, `node scripts/build-product-index.cjs --check` 28개 통과, `node scripts/package-site.cjs` 통과, `node scripts/e2e-smoke.cjs` 118/118 통과, `git diff --check` 통과.

## 배포 뒤 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 | `CATALOG BASED · 0.63` |
| `CLAUDE.md` 비공개 확인 | `curl -sS -o /dev/null -w "%{http_code}" https://seoulav.github.io/rtcom-configurator/CLAUDE.md` → `404` |
| Actions run | `36330263948`(run 39) `completed / success`, `head_sha=2f3176a3c8d98e7586f427c0a10bdb7d5e07bd7c` |
| 브랜치 배포(`pages build and deployment`) | 확인 대상 아님(0.48 이후 계속 미실행 기준 유지) |

## Rollback

병합 커밋 `2f3176a3c8d98e7586f427c0a10bdb7d5e07bd7c`를 revert하는 PR을 만들어 병합한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행하면 0.61.0 화면으로 돌아갑니다.
