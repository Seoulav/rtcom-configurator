# 0.60.0 GitHub Pages 배포 기록

- 배포일: 2026-09-27
- 사용자 승인: "배포"
- 소스 병합: PR #40 → `main` 병합 커밋 `1b208011691e121c278ed6896e9411cba891b7ba`(PR head `3f70f8c2aeca509ebf3cb71a954b7c2ffc50727a`)
- 배포 방법: `Deploy RTCOM to GitHub Pages`(`.github/workflows/pages.yml`)를 `main`에서 실행
- GitHub Actions run: `36327469082`(run 36), `completed / success`, head_sha가 병합 커밋과 일치
- 공개 URL: `https://seoulav.github.io/rtcom-configurator/`

## 이번에 공개된 내용(0.60.0)

| 작업 | 내용 |
|---|---|
| 04 제품 사양 표 | 칸 위아래 여백 9px → 6px, 표 높이 약 13~16% 축소(`docs/qa/SPEC_TABLE_FLOW_CLIP_QA_2026-09-27.md`) |
| 03 Signal Flow | 그림 너비에 AUDIO OUT 칩과 "추출" 표시를 포함해 HDS-21U 잘림 수정 |
| 기록 | 분배기 EDID 1·7번은 매뉴얼 기준이 맞다는 사용자 확인(`docs/qa/EDID_ROTARY_EXAMPLES_QA_2026-09-27.md` §5), 0.59.0 배포 기록(다른 세션) |

- 병합 전 검증: 39/39 단위 테스트, 28종 validator, package-site, 110/110 e2e, `git diff --check` 통과.

## 배포 뒤 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 | `CATALOG BASED · 0.60` |
| 공개 파일 대조 | `main`(1b20801)에서 만든 `dist/`와 공개 파일 SHA-256 **192/192 일치**(`.nojekyll` 제외) |
| 비공개 파일 | `CLAUDE.md`·`README.md`·`CHANGELOG.md`·`AGENTS.md`·`docs/qa/…`·`.source-materials/…`·`scripts/…` 모두 HTTP 404 |
| 브랜치 배포(`pages build and deployment`) | 이번 병합 뒤에도 실행 없음 |

## Rollback

병합 커밋 `1b208011691e121c278ed6896e9411cba891b7ba`를 revert하는 PR을 만들어 병합한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행하면 0.59.0 화면으로 돌아갑니다.
