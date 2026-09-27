# 0.39.0 GitHub Pages 배포 기록

- 배포일: 2026-09-27
- 사용자 승인: "병합 배포해줘"(2026-09-27)
- 소스 병합: PR #24 → `main` 병합 커밋 `5ceeb27bf214973ef062b4737f6e2dd077ccf9c2`(0.39.0)
- 배포 방법: `Deploy RTCOM to GitHub Pages`(`.github/workflows/pages.yml`)를 `main`에서 직접 실행했습니다.
- GitHub Actions run: `36305653692`(실행 번호 21)
- 결과: `completed / success`
- 공개 URL: `https://seoulav.github.io/rtcom-configurator/`
- 직전 배포: run `36303395870`, `6bf1f94`(0.38.0)

## 0.39.0에 들어간 변경

- 제품 사진 돋보기(단일 제품 상세 01 위 사진 띠, 라이트박스 확대)
- 화면에 보이는 "up to" 표기를 "최대"로 통일(20곳)
- 제품정보 "확인 사항" 118건 → 2건(`docs/audit/PRODUCT_ISSUES_ARCHIVE_2026-09-27.md`), HD-210U 크기 355mm 정정, XDM-CTR100 전원 연결 규칙 추가
- 정식 공개 주소 정리, 0.38.0 배포 기록, e2e 회귀 검사 3개

## 병합 전 검수·검증(`9555398`)

- Opus 검수: 다른 세션이 올린 0.39 작업(`da59a07`, `eb2d74f`)의 코드와 데이터 변경을 읽었습니다. 원문 인용("원문: …")과 검색용 영문 요약은 바뀌지 않았고, 확인 사항 정리 결과(2건, HD-210U 355mm, CTR100 전원 규칙)도 그대로였습니다. 돋보기 창에 `role="dialog"`, `aria-modal`, `aria-label`을 추가했습니다.
- `node --test tests/*.test.cjs`: 37/37
- `node scripts/build-product-index.cjs --check`: 27종
- `node scripts/package-site.cjs`: 통과
- `node scripts/e2e-smoke.cjs`(전역 playwright): 82/82
- `git diff --check`: 통과

## 배포 뒤 확인

| 항목 | 방법 | 결과 |
|---|---|---|
| 화면 버전 | 공개 주소의 `index.html` | `CATALOG BASED · 0.39` |
| 배포 파일 일치 | `main`과 같은 내용으로 만든 `dist/` 파일 182개를 공개 주소에서 받아 SHA-256 비교 | 182/182 같음 |
| 배포하지 않을 파일 | 카탈로그 PDF, 시안, `CLAUDE.md`, 확인 사항 원문 기록 | 모두 404 |

공개 주소를 브라우저로 직접 여는 검사는 작업 환경의 프록시 인증서 문제로 하지 못했고, 파일 일치 비교로 대신했습니다(0.38.0 기록과 같음).

## Rollback

`6bf1f94`(0.38.0)에 태그를 만들고 그 태그로 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다. `main`까지 되돌려야 하면 병합 커밋 `5ceeb27`를 revert하는 PR을 만듭니다. 0.39.0은 저장 형식을 바꾸지 않아 사용자 구성 파일에는 영향이 없습니다.
