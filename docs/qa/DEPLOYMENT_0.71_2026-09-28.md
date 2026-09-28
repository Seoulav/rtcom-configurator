# 0.71.0 GitHub Pages 배포 기록

- 배포일: 2026-09-28
- 사용자 승인: "배포"
- 소스 병합: PR #57 → `main` 병합 커밋 `92fd31a987eab126c9c6b7dd91465c3c326c2b4c`(PR head `a8155173da0548541c01312f0fe78921f8fe9ea7`)
- 배포 방법: `Deploy RTCOM to GitHub Pages`(`.github/workflows/pages.yml`)를 `main`에서 실행
- GitHub Actions run: `36361265089`(run 47), `completed / success`, head_sha가 병합 커밋과 일치
- 공개 URL: `https://seoulav.github.io/rtcom-configurator/`

## 이번에 공개된 내용(0.71.0)

| 작업 | 내용 |
|---|---|
| OBHD-2C 04 제품 사양 | 사용자 결정 "매뉴얼대로 HDMI 1.3": 크기 128×89×25mm, 무게 0.36kg(0.79lbs), 규격 HDMI 1.3 행 추가(매뉴얼 Ver.2.1 4~5쪽) |

- 근거·화면: `docs/qa/OBHD2C_EDID_ROTARY_QA_2026-09-27.md` §7, `docs/qa/obhd-edid-screens/obhd2-spec-1280.png`
- 병합 전 검증: 39/39 단위 테스트, 29종 validator, package-site, 139/139 e2e, `git diff --check` 통과.

## 배포 뒤 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 | `CATALOG BASED · 0.71` |
| 공개 파일 대조 | `main`(92fd31a)에서 만든 `dist/`와 공개 파일 SHA-256 **205/205 일치**(`.nojekyll` 제외) |
| 비공개 파일 | `CLAUDE.md`·`README.md`·`CHANGELOG.md`·`AGENTS.md`·`docs/qa/`·`.source-materials/`·`scripts/package-site.cjs` 모두 HTTP 404 |
| 브랜치 배포(`pages build and deployment`) | 이번 병합 뒤에도 실행 없음 |

## Rollback

병합 커밋 `92fd31a987eab126c9c6b7dd91465c3c326c2b4c`를 revert하는 PR을 만들어 병합한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행하면 0.70.0 화면으로 돌아갑니다.
