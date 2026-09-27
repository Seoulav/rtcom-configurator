# 0.47.0 GitHub Pages 배포 기록

- 배포일: 2026-09-27
- 사용자 승인: "모든 작업결과 병합해서 올려줘"(2026-09-27)
- 소스 병합: PR #28 → `main` 병합 커밋 `442c4f550aaf59fcc2592ae4fd8be6d1a9468c2d`(0.46 배포 기록 + 0.47.0)
- 배포 방법: `Deploy RTCOM to GitHub Pages`(`.github/workflows/pages.yml`)를 `main`에서 실행
- GitHub Actions run: `36311773249`(실행 번호 25), `completed / success`
- 공개 URL: `https://seoulav.github.io/rtcom-configurator/`

## 병합 전 검증(`a32891f`)

- `node --test tests/*.test.cjs`: 37/37
- `node scripts/build-product-index.cjs --check`: 28종
- `node scripts/package-site.cjs`: 통과
- `node scripts/e2e-smoke.cjs`: 85/85
- `git diff --check`: 통과

## 브랜치 배포

이번 병합 뒤에는 GitHub 기본 브랜치 배포(`pages build and deployment`)가 돌지 않았습니다. 7분 동안 기다려도 새 실행이 없었고, 공개 주소의 `CLAUDE.md`도 계속 404였습니다. Pages Source가 "GitHub Actions"로 바뀐 것으로 보입니다. 이 세션의 도구로는 설정 화면을 볼 수 없어 확정하지는 못했습니다. 다음 병합 때도 브랜치 배포가 없으면 `CLAUDE.md` 저장소 역할 항목의 "기다렸다가 배포" 절차를 줄일 수 있습니다.

## 배포 뒤 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 | `CATALOG BASED · 0.47` |
| 배포 파일 일치 | 190/190 같음(`dist/` 191개 중 `.nojekyll`은 GitHub Pages가 제공하지 않는 빈 표지 파일이라 비교에서 뺌. 이전 배포 기록의 개수도 같은 기준) |
| 배포하지 않을 파일 | `CLAUDE.md`, `README.md`, 카탈로그 PDF, QA 문서, `.source-materials`(HD-13U 매뉴얼) 모두 404 |

## 함께 정리한 PR

- PR #22(옛 `claude/rtcom-configurator-dev-3q2npl`): 남은 사용자 결정을 0.47.0으로 옮긴 뒤, 대체 사유 댓글을 달고 닫았습니다.

## Rollback

직전 배포 커밋 `3903cc5`(0.46.0)에 태그를 만들고, 그 태그로 배포 작업을 다시 실행합니다. `main`까지 되돌리려면 병합 커밋 `442c4f5`를 revert하는 PR을 만듭니다. 0.47은 저장 형식을 바꾸지 않았습니다.
