# 0.38.0 GitHub Pages 배포 기록

- 배포일: 2026-09-27
- 사용자 승인: "병합 맞아, 사이트에도 올려줘"(2026-09-27)
- 소스 병합: PR #23 → `main` 병합 커밋 `6bf1f94be93dc667f731143614251cb25f0caa74`(0.29~0.38)
- 배포 방법: 원본 저장소 `Seoulav/rtcom-configurator`의 `Deploy RTCOM to GitHub Pages`(`.github/workflows/pages.yml`)를 `main`에서 직접 실행했습니다.
- GitHub Actions run: `36303395870`(실행 번호 20)
- 결과: `completed / success`
- 공개 URL: `https://seoulav.github.io/rtcom-configurator/`
- 직전 배포: run `36285748902`, `f0f76f5`(0.28.0)

## 병합 전 검증(`4fb67a5`, 병합 커밋과 파일 내용이 같음)

- `node --test tests/*.test.cjs`: 37/37
- `node scripts/build-product-index.cjs --check`: 27종
- `node scripts/package-site.cjs`: 통과
- `node scripts/e2e-smoke.cjs`(전역 playwright): 76/76
- `git diff --check`: 통과
- 최종 리뷰: `docs/audit/PR23_FINAL_REVIEW_2026-09-27.md`

## 배포 뒤 확인

| 항목 | 방법 | 결과 |
|---|---|---|
| 화면 버전 | 공개 주소의 `index.html`을 받아 확인했습니다. | `CATALOG BASED · 0.38` |
| 배포 파일 일치 | 로컬 `dist/`의 파일 182개를 공개 주소에서 하나씩 받아 SHA-256을 비교했습니다. | 182/182 같음. 로컬에서 e2e 76/76을 통과한 배포본과 같습니다. |
| 배포하지 않을 파일 | 카탈로그 PDF(`docs/RTcom_catalogue_2026_46p.pdf`), 시안(`docs/mockups/`), `CLAUDE.md`를 공개 주소로 요청했습니다. | 모두 404 |

공개 주소를 브라우저로 직접 여는 검사는 하지 못했습니다. 작업 환경의 프록시 인증서를 Chromium이 받아들이지 않았기 때문입니다(`ERR_CERT_AUTHORITY_INVALID`). TLS 검사를 끄지 않고, 위의 파일 일치 비교로 대신했습니다.

## 확인된 운영 문제(후속 결정 필요)

- `https://hkkim0454.github.io/rtcom-av-design/`는 GitHub Pages "Site not found"(404)입니다. 이 세션에서는 `hkkim0454/rtcom-av-design` 저장소에 접근할 수 없어 이 사이트에는 배포하지 않았습니다.
- `README.md`의 공개 사이트 링크와 `CLAUDE.md`의 "공개 배포: hkkim0454/rtcom-av-design"이 실제 운영과 다릅니다. `docs/audit/SITE_SCOPE_REVIEW.md` §4·§7-3의 "공개 Pages 위치 정리"와 같은 문제입니다. 어느 쪽을 정식 공개 주소로 둘지 사용자 결정 뒤에 문서를 고칩니다.

## Rollback

공개 사이트에 문제가 있으면 직전 정상 커밋 `f0f76f5`(0.28.0)에 태그를 만들고, 그 태그를 대상으로 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다(이 작업은 커밋 번호로는 실행되지 않고 브랜치나 태그 이름이 필요합니다). 원본 `main`까지 되돌려야 하면 병합 커밋 `6bf1f94`를 revert하는 PR을 만듭니다. 0.37 이후 블랭크 커버를 넣어 저장한 파일은 0.28에서 열리지 않으므로, 되돌리기 전에 블랭크를 흰 칸으로 바꿔 저장해야 합니다. LocalStorage 키(`rtcom.configuration.v1`)는 같아서, 브라우저에 자동 저장된 구성도 같은 주의가 필요합니다.
