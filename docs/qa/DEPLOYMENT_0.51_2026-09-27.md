# 0.51.0 GitHub Pages 배포 기록

- 배포일: 2026-09-27
- 사용자 요청: "일단 돋보기는 활성화해줘"(2026-09-27). QMS-88UX 부설·LAN 삭제 요청과 함께 받았습니다.
- 소스 병합: PR #31 → `main` 병합 커밋 `b2257a761ed7fde1df0e2a23bc76722e4c71143d`
- 배포 방법: `Deploy RTCOM to GitHub Pages`(`.github/workflows/pages.yml`)를 `main`에서 실행
- GitHub Actions run: `36314494884`(실행 번호 28), `completed / success`
- 공개 URL: `https://seoulav.github.io/rtcom-configurator/`

## 이번에 공개된 버전

| 버전 | 내용 | 병합 |
|---|---|---|
| 0.49.0 | HDS-21U·HDS-42MU 오디오 설정 카드, 오디오 카드 간결화, 제품 사진 팝업·원형 돋보기 | PR #30 |
| 0.50.0 | QMS-88UX 멀티뷰 출력 분기, 오디오 QD1·QD2(다른 세션) | PR #30 |
| 0.51.0 | QMS-88UX 제품 사양 부설 삭제, LAN(Telnet & Web Browser) 표기 삭제 | PR #31 |

- PR #30은 사용자 계정에서 병합됐습니다. 병합 직전에 다른 세션이 같은 브랜치에 0.50.0(`04e64e5`)을 올렸고, 함께 들어갔습니다.
- 병합된 main을 이 세션에서 다시 검증했습니다: 37/37, 28종, e2e 88/88.
- run 27(`36314386188`, 11:01, `647a8ae`)은 0.50을 배포한 실행입니다. 다른 세션이 실행했고, 기록은 `docs/qa/DEPLOYMENT_0.50_2026-09-27.md`에 있습니다.

## 병합 전 검증(`7a6767b`)

- `node --test tests/*.test.cjs`: 37/37
- `node scripts/build-product-index.cjs --check`: 28종
- `node scripts/package-site.cjs`: 통과
- `node scripts/e2e-smoke.cjs`: 88/88
- `git diff --check`: 통과

## 배포 뒤 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 | `CATALOG BASED · 0.51` |
| 배포 파일 일치 | 190/190 같음(`.nojekyll` 제외) |
| 배포하지 않을 파일 | `CLAUDE.md`, `README.md`, 카탈로그 PDF, QA 문서, `.source-materials`(HDS 매뉴얼) 모두 404 |
| 브랜치 배포 | 이번에도 돌지 않았습니다(0.47부터 네 번 연속). |

## Rollback

직전 배포 커밋 `647a8ae`(0.50.0)나 `bab1bbb`(0.48.0)에 태그를 만들고, 그 태그로 배포 작업을 다시 실행합니다. `main`까지 되돌리려면 병합 커밋을 revert하는 PR을 만듭니다.
