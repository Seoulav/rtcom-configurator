# 0.48.0 GitHub Pages 배포 기록

- 배포일: 2026-09-27
- 사용자 승인: "일괄 올려줘"(2026-09-27)
- 소스 병합: PR #29 → `main` 병합 커밋 `bab1bbb153529f988f9db8f9453fb22feab2ef36`(0.47 배포 기록 + 0.48.0)
- 배포 방법: `Deploy RTCOM to GitHub Pages`(`.github/workflows/pages.yml`)를 `main`에서 실행
- GitHub Actions run: `36312358809`(실행 번호 26), `completed / success`
- 공개 URL: `https://seoulav.github.io/rtcom-configurator/`

## 병합 전 검증(`167890a`)

- `node --test tests/*.test.cjs`: 37/37
- `node scripts/build-product-index.cjs --check`: 28종
- `node scripts/package-site.cjs`: 통과
- `node scripts/e2e-smoke.cjs`: 85/85
- `git diff --check`: 통과

## 브랜치 배포

0.47에 이어 이번 병합 뒤에도 GitHub 기본 브랜치 배포(`pages build and deployment`)가 돌지 않았습니다. 마지막 실행은 0.46 병합(09:41) 때였습니다. 두 번 연속으로 돌지 않았으므로 Pages Source가 "GitHub Actions"로 바뀐 것으로 판단합니다. `CLAUDE.md`의 저장소 역할 항목을 이 기준으로 고쳤습니다. 공개 주소에서 `CLAUDE.md`가 404인지 확인하는 절차는 그대로 남깁니다.

## 배포 뒤 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 | `CATALOG BASED · 0.48` |
| 배포 파일 일치 | 190/190 같음(`.nojekyll` 제외, 0.47 기록과 같은 기준) |
| 배포하지 않을 파일 | `CLAUDE.md`, `README.md`, 카탈로그 PDF, QA 문서, `.source-materials` 모두 404 |

## Rollback

직전 배포 커밋 `442c4f5`(0.47.0)에 태그를 만들고, 그 태그로 배포 작업을 다시 실행합니다. `main`까지 되돌리려면 병합 커밋 `bab1bbb`를 revert하는 PR을 만듭니다. 0.48은 저장 형식을 바꾸지 않았습니다.
