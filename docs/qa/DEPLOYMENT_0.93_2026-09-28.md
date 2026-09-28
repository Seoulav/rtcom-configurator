# 0.93.0 배포 기록 (2026-09-28)

- 사용자 요청: "XDM-FT101 / XDM-FR101 04 제품 사양에 · XDM-FT101·XDM-FR101 공통이라는 말은 삭제 다른 제품들도 이런게 있다면 일괄 삭제", "xdm-psu제품에도 signal flow개념을 그려줘"
- 사용자 승인: 병합("병합"), 배포(질문 응답 "0.93.0 공개 사이트 배포")
- PR: https://github.com/Seoulav/rtcom-configurator/pull/92 (squash 병합, 병합 커밋 `3d8a823`)
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 70 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36409425653), 결과 success

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.93`
- 공개 파일 대조: `3d8a823`을 별도 폴더(git worktree)에 꺼내 `node scripts/package-site.cjs`로 빌드한 `dist/` 243개와 공개 주소 파일을 SHA-256으로 비교했습니다. 242개가 일치했습니다. 나머지 1개 `.nojekyll`은 GitHub Pages가 공개하지 않는 빈 설정 파일입니다(0.90 기록과 같은 결과).
- 비공개 파일: `CLAUDE.md`, `AGENTS.md`는 404입니다.
- 변경 내용: 공개 `src/products.js`에 `psuDiagram`이 있고, 공개 `data/products/xdm-ft101-fr101.json`에 "공통"이 없습니다.
- 병합 전 검증: `node --test` 44/44, `build-product-index --check` 30개, `package-site`, `e2e-smoke` 148/148, `git diff --check` 통과.
- 공개 주소 브라우저 확인은 작업 환경의 프록시 인증서를 Chromium이 인식하지 못해(`ERR_CERT_AUTHORITY_INVALID`) 하지 못했습니다. 같은 커밋의 로컬 빌드로 브라우저 확인(PSU Signal Flow 1개 표시, FT101 "공통" 없음)은 마쳤습니다.

## 영향

- 전송기 9종 04 제품 사양 조건 칸에서 "모델A·모델B 공통" 표기 55곳이 사라짐
- XDM-PSU 상세에 03 Signal Flow(POH 입력 경로·PHX 출력 경로, 주황 전원 선)가 생김
- 버전 표기 0.92 → 0.93

## 주의

- 이 배포 직후 `main`에 0.94.0(`1de0c98`, XDM-CTR100·CTR100 PSE 최대 전송거리 사양 통합)과 0.95.0(`33de71d`, 전체 카탈로그 공유)이 병합되었습니다.
- 사용자 승인("병합 배포 승인")을 받고 이 세션이 run 72를 실행했으나, 다른 세션의 0.95.0 배포(run 71)와 겹쳐 취소되었습니다(`pages.yml`의 `cancel-in-progress`). 마지막 run 73(`0d37aa0`, 0.95.0 + 문서)이 success로 끝나 0.94.0·0.95.0이 공개되었습니다. 0.95.0 배포 기록은 `docs/qa/DEPLOYMENT_0.95_2026-09-28.md`에 있습니다.
- 이 세션도 `33de71d` 빌드 244개와 공개 파일을 대조해 243개 일치(`.nojekyll` 제외)를 확인했습니다.

## 되돌리기

- main에서 `3d8a823`을 revert한 뒤 다시 배포합니다.
