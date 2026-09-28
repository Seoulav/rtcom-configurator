# 0.118.0 배포 기록 (2026-09-28)

- 요청: "전송기 부분도 수량을 선택할 수 있게 해 줘. 그리고 그게 물량 산출서가 나올 수도 있도록" (2026-09-28)
- PR: https://github.com/Seoulav/rtcom-configurator/pull/141 (squash 병합)
  - 병합 커밋: `43fc211a1bfdeb9e952b7417ec3b6aadd9e71753`
  - PR head: `48590d24`
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 117 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36487941038)
  - 결과: success (21:43:02Z → 21:43:32Z), 배포 커밋 `43fc211`

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.118`
- 공개 파일 대조: `43fc211`에서 `node scripts/package-site.cjs`로 만든 `dist/` 파일과 공개 파일의 SHA-256을 비교했습니다. 303/303 일치했습니다(`.nojekyll` 제외).
- 비공개 파일 5개는 모두 404였습니다: `CLAUDE.md`, `AGENTS.md`, `CHANGELOG.md`, `docs/qa/extender-qty-bom-screens/export-bom.png`, `input_doc/README.md`
- 병합 전 검증 결과
  - `node --test tests/*.test.cjs`: 46/46
  - `build-product-index --check`: 30개 통과
  - `package-site`: 통과
  - `e2e-smoke`: 164/164
  - `git diff --check`: 통과
- 물량 산출서 확인(로컬, XDM-36 · CIS100 1장 CTR100 TX 3대 · HOS100 1장 PSE 한 쌍 2쌍): BOM에 XDM-CTR100 3, XDM-CTR100 PSE 2, XDM-CTR100(PSE 급전) 2, XDM-PSU 1, XDM-POH 3이 나옵니다(`docs/qa/extender-qty-bom-screens/export-bom.png`).

## 되돌리기

- main에서 `43fc211`을 revert한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다.
