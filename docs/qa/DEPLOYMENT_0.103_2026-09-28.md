# 0.103.0 배포 기록 (2026-09-28)

- 요청: "XDM-CTR100와 동등 사양 제품의 권장 케이블 CAT6A S/FTP 변경해줘 UTP는 절대 안되" (2026-09-28), 이어서 "모든세션 병합 배포해줘"
- PR: https://github.com/Seoulav/rtcom-configurator/pull/110 (squash 병합)
  - 병합 커밋: `9f5271de415331b624b41d78ea9548d6ec30feed`
  - PR head: `617bcce`
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 89 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36421661583)
  - 결과: success (12:24:47Z → 12:25:17Z)

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.103`
- 공개 파일 대조: `9f5271d`에서 `node scripts/package-site.cjs`로 만든 `dist/` 파일과 공개 파일의 SHA-256을 비교했습니다. 272/272 일치했습니다(`.nojekyll` 제외).
- 비공개 파일 4개는 모두 404였습니다: `CLAUDE.md`, `CHANGELOG.md`, `.claude/settings.json`, `docs/qa/DEPLOYMENT_0.102_2026-09-28.md`
- 데이터 확인: 공개된 `data/products/xdm-ct103-cr103.json`의 "권장 케이블" 값이 `CAT6A S/FTP 이상(UTP 사용 불가)`으로 반영됨을 확인했습니다.
- 병합 전 검증 결과
  - `node --test tests/*.test.cjs`: 45/45
  - `build-product-index --check`: 30개 통과
  - `package-site`: 통과
  - `e2e-smoke`: 151/151
  - `git diff --check`: 통과

## 되돌리기

- main에서 `9f5271d`을 revert한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다.
