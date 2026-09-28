# 0.125.0 배포 기록 (2026-09-28)

- 요청: "제품정보 XDM이 처음으로 나오게해" (2026-09-28)
- PR: https://github.com/Seoulav/rtcom-configurator/pull/155 (squash 병합)
  - 병합 커밋: `1352924cf89a085186a21510a881c996bc0e262a`
  - PR head: `742b0486`
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 131 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36499662073)
  - 결과: success (23:45:28Z → 23:45:55Z), 배포 커밋 `1352924`

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.125`
- 공개 `data/products/index.json` 앞 3개: `xdm`, `spx`, `vdm`
- 공개 파일 대조: `1352924`에서 `node scripts/package-site.cjs`로 만든 `dist/` 파일과 공개 파일의 SHA-256을 비교했습니다. 349/349 일치했습니다(`.nojekyll` 제외).
- 비공개 파일 5개는 모두 404였습니다: `CLAUDE.md`, `AGENTS.md`, `CHANGELOG.md`, `docs/qa/DEPLOYMENT_0.124_2026-09-28.md`, `input_doc/README.md`
- 병합 전 검증 결과
  - `node --test tests/*.test.cjs`: 49/49
  - `build-product-index --check`: 31개 통과
  - `package-site`: 통과
  - `e2e-smoke`: 169/169
  - `git diff --check`: 통과

## 되돌리기

- main에서 `1352924`를 revert한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다.
