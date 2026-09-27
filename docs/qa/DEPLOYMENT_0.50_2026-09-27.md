# 0.50.0 GitHub Pages 배포 기록

- 배포일: 2026-09-27
- 사용자 승인: "일괄 배포해"(2026-09-27)
- 소스 병합: PR #30 → `main` 병합 커밋 `647a8ae1b47c8193a145ac804e1f332c92d58666`(0.48 배포 기록 + 0.49.0 + 0.50.0)
- 배포 방법: `Deploy RTCOM to GitHub Pages`(`.github/workflows/pages.yml`)를 `main`에서 실행
- GitHub Actions run: `36314386188`(실행 번호 27), `completed / success`
- 공개 URL: `https://seoulav.github.io/rtcom-configurator/`

## 병합 전 검증(`cd8a255`)

- `node --test tests/*.test.cjs`: 37/37
- `node scripts/build-product-index.cjs --check`: 28종
- `node scripts/package-site.cjs`: 통과
- `node scripts/e2e-smoke.cjs`: 88/88
- `git diff --check`: 통과

## 브랜치 배포

PR #28~#30 병합 뒤 모두 GitHub 기본 브랜치 배포(`pages build and deployment`)가 돌지 않았습니다(마지막 실행은 0.46 병합 09:41). 세 번 연속 돌지 않았으므로 Pages Source가 "GitHub Actions"로 바뀐 것으로 봅니다.

## 배포 뒤 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 | `CATALOG BASED · 0.50` |
| 배포 파일 일치 | 190/190 같음(`dist/` 191개 중 `.nojekyll` 제외, 이전 배포 기록과 같은 기준) |
| 배포하지 않을 파일 | `CLAUDE.md` 404 확인 |
| 데이터 반영 확인 | 공개 `data/products/qms-88ux.json`에서 이번에 고친 멀티뷰 주요 기능 문구 확인 |

## Rollback

직전 배포 커밋 `bab1bbb`(0.48.0)에 태그를 만들고, 그 태그로 배포 작업을 다시 실행합니다. `main`까지 되돌리려면 병합 커밋 `647a8ae1`을 revert하는 PR을 만듭니다. 0.49~0.50은 저장 형식을 바꾸지 않았습니다.
