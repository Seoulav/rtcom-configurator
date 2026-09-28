# 0.97.0 배포 기록 (2026-09-28)

- 사용자 요청: "카탈로그를 전부 잘라서 해당 제품 목록에서 해당 제품만 보이게 잘라줄 수 있어?"
- 사용자 결정: 질문 응답 "제품별로 잘라 공개"(공개 PDF 커밋 확인 포함). 병합·배포는 `CLAUDE.md` 규칙(검증된 PR은 Claude가 병합·배포, 사용자 결정 2026-09-28)에 따름
- PR: https://github.com/Seoulav/rtcom-configurator/pull/98 (squash 병합, 병합 커밋 `87b4237`)
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 77 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36413163225), 결과 success

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.97`
- 공개 파일 대조: `87b4237`을 별도 폴더(git worktree)에서 빌드한 `dist/` 273개와 공개 주소 파일을 SHA-256으로 비교해 272개 일치(`.nojekyll`은 GitHub Pages가 공개하지 않는 빈 파일)
- 제품별 카탈로그: `xdm-catalog.pdf`, `hd-13u-catalog.pdf` 200 `application/pdf`. 공개 `data/products/xdm.json`의 카탈로그 파일이 `xdm-catalog.pdf`
- 전체 카탈로그: `rtcom-catalog-2026.pdf` 200 `application/pdf`(제품 목록 버튼용)
- 비공개 파일: `CLAUDE.md`, `AGENTS.md` 404
- 병합 전 검증: `split_catalog_by_product.py --check` 29/29, `node --test` 45/45, `build-product-index --check` 30개, `package-site`, `e2e-smoke` 149/149, `git diff --check` 통과

## 영향

- 29개 제품 상세의 카탈로그 PDF 버튼이 그 제품 쪽만 담은 파일을 열고 내려받음(XDM 4~9쪽, SPX-TX/RX 16쪽, 나머지는 `catalogPages`)
- 공개 PDF 약 6.6MB 증가, 버전 표기 0.96 → 0.97

## 되돌리기

- main에서 `87b4237`을 revert한 뒤 다시 배포합니다. 공개했던 제품별 PDF는 Git 기록에 남습니다.
