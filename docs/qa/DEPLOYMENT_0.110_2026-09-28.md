# 0.110.0 배포 기록 (2026-09-28)

- 요청: "XDM연결되는 전송기들과 obux-1c는 3840x2160@60Hz (4:4:4)통일하면 어떨까?" → "1. `xdm-ctr100`·`xdm-ctr100-pse`·`xdm-ct103-cr103`xdm-ft101-fr101 , 4종 "4K60(4:4:4)" 형식으로 통일합니다 2. 4096은 잘 사용하지 않아서 모든 양식에서 빼자"(2026-09-28)
- PR 1: https://github.com/Seoulav/rtcom-configurator/pull/122 (squash 병합)
  - 병합 커밋: `7b9f51f87d4a8dc5a74d3e4ce5c69899fe50d6f0`
  - 내용: XDM-CTR100·XDM-CTR100 PSE·XDM-CT103/CR103·XDM-FT101/FR101 04 제품 사양 "최대 해상도"를 `4K60Hz`로 통일, FT101/FR101의 4096x2160 표기를 개요·주요 기능·사양에서 삭제
  - 병합 시 origin/main(0.109.0까지)과 merge conflict(`CHANGELOG.md`)가 있어 해소 후 병합
- PR 2: https://github.com/Seoulav/rtcom-configurator/pull/124 (squash 병합)
  - 병합 커밋: `ea8a5f1e05b56c1f9a17bc928908236091503894`
  - 내용: PR #122가 버전 표기 없이 병합된 것을 뒤늦게 확인해, 마이너 버전을 0.110으로 올리고 `index.html`·`README.md`·`CHANGELOG.md`·`CLAUDE.md` 이력 문장을 갱신(0.109.0 QMS-88UX 캡션 수정 항목도 함께 기록)
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 100 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36433377840)
  - 결과: success (14:05:44Z → 14:06:20Z, head `ea8a5f1`)

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.110`
- 공개 파일 대조: `ea8a5f1`과 같은 트리 상태(`0efb4b2`)에서 `node scripts/package-site.cjs`로 만든 `dist/`(275개 파일) 각각의 SHA-256을 공개 주소와 비교했습니다. 274/274 일치했습니다(`.nojekyll` 제외).
- 비공개 파일 5개는 모두 404였습니다: `CLAUDE.md`, `CHANGELOG.md`, `docs/qa/DEPLOYMENT_0.105_2026-09-28.md`, `scripts/build-product-index.cjs`, `.claude/settings.json`
- 병합 전 검증 결과 (PR #122, #124 각각)
  - `node --test tests/*.test.cjs`: 45/45
  - `build-product-index --check`: 30개 통과
  - `package-site`: 통과
  - `e2e-smoke`: PR #122 153/153, PR #124 153/153
  - `git diff --check`: 통과

## 되돌리기

- main에서 `ea8a5f1`과 `7b9f51f`를 순서대로(최신 것부터) revert한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다.
- `7b9f51f`만 되돌리면 04 제품 사양 표기가 원래 값(3840x2160@60Hz / 4096x2160@60Hz+3840x2160@60Hz)으로 복원되고, 버전 표기(0.110)는 그대로 남으므로 `ea8a5f1`도 함께 되돌려야 버전·CHANGELOG까지 일치합니다.
