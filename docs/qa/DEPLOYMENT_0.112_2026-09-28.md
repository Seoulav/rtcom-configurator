# 0.112.0 배포 기록 (2026-09-28)

## 배포 대상

- PR: [#129](https://github.com/Seoulav/rtcom-configurator/pull/129) "HD-13U 카탈로그 팝업을 PDF.js로 표시 (0.112.0)" → `main` squash 병합 (`d016e45`)
- 배포 워크플로: `Deploy RTCOM to GitHub Pages` run 104 (`workflow_dispatch`, head `d016e45`) — `success`

## 확인

- 공개 주소 `CATALOG BASED · 0.112`, `CLAUDE.md` 404.
- `src/vendor/pdfjs/pdf.min.mjs`·`pdf.worker.min.mjs`가 200, `content-type: text/javascript`로 응답(모듈 불러오기 조건 충족).
- `index.html`, `src/products.js`, `src/styles.css`, PDF.js 파일 2개, `hd-13u-catalog.pdf`의 SHA-256이 로컬 빌드(`dist/`, e2e 154/154 통과본)와 같음.
- 이 작업 환경의 프록시가 공개 주소 브라우저 요청 일부를 `ERR_TOO_MANY_RETRIES`로 막아, 공개 주소에서 직접 브라우저 화면 확인은 하지 못했습니다. 파일이 같으므로 로컬 브라우저 검증 결과가 그대로 적용됩니다.

## 미해결 위험

없음. 사용자 휴대폰에서 HD-13U 카탈로그 팝업이 다운로드 없이 보이는지 한 번 확인해 주시면 좋습니다.
