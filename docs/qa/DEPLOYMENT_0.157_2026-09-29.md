# 0.157.0 배포 기록 (2026-09-29)

- 병합: PR #212 → main `59032b5` (squash)
- 배포: `Deploy RTCOM to GitHub Pages` run 36552181076(run 184), 성공
- 공개 확인 (https://seoulav.github.io/rtcom-configurator/)
  - 버전 표기 `CATALOG BASED · 0.157`, `CLAUDE.md` 404, `input_doc/README.md`·`docs/implementation/SPX_R6_0.157.md` 404
  - `data/products/index.json` 제품 32개, `data/products/spx-r6.json` 200, `spx.json`에 `483×443.7×365mm` 2곳
  - 새 공개 PDF 3개 200: `spx-r6-catalog.pdf`, `spx-manual.pdf`(sha256 앞 16자리 `39e7c005648e6f20`, 원본과 같음), `spx-rx-tx-manual.pdf`
  - 그림 200: `spx-r6-front-art.webp`, `spx-r6-rear-art.webp`, `spx-r6-catalog-p1.webp`
  - 공개 `src/products.js` sha256 앞 16자리 `bf5dfe0d0675f77f`로 main과 같음
