# 0.111.0 배포 기록 (2026-09-28)

- 요청: "XDM-PSU랙 만든것처럼 현재 VDM프레임 중 고해상도 사진이 없는건 전면/후면 모든 제품 만들어줘", "다끝나면 병합하고 배포해줘" (2026-09-28)
- PR: https://github.com/Seoulav/rtcom-configurator/pull/127 (squash 병합)
  - 병합 커밋: `91fe85d7a457151e77a74ab29e56696b4b08f90c`
  - PR head: `0ae02b8a`
  - 작업 중 다른 세션이 main에 0.109.0·0.110.0을 먼저 병합해 이 묶음은 0.111.0으로 번호를 조정했습니다.
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 102 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36434386028)
  - 결과: success (14:13:44Z → 14:14:48Z)

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.111`
- 공개 파일 대조: `91fe85d`에서 `node scripts/package-site.cjs`로 만든 `dist/` 파일과 공개 파일의 SHA-256을 비교했습니다. 289/289 일치했습니다(`.nojekyll` 제외). `hd-13u-manual.pdf` 한 파일은 첫 대조에서 다르게 나왔으나 배포 직후 CDN 캐시 때문이었고, 다시 받아 같은 크기(1,344,616바이트)·같은 SHA-256임을 확인했습니다.
- 비공개 파일 5개는 모두 404였습니다: `CLAUDE.md`, `AGENTS.md`, `docs/qa/VDM_FRAME_ART_QA_2026-09-28.md`, `scripts/tools/draw_vdm_frames.cjs`, `input_doc/README.md`
- 병합 전 검증 결과
  - `node --test tests/*.test.cjs`: 45/45
  - `build-product-index --check`: 30개 통과
  - `package-site`: 통과
  - `e2e-smoke`: 154/154
  - `git diff --check`: 통과

## 되돌리기

- main에서 `91fe85d`를 revert한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다(원래 매뉴얼 도면 파일은 남아 있어 그대로 돌아갑니다).
