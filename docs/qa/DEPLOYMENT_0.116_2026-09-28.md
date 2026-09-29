# 0.116.0 배포 기록 (2026-09-28)

- 요청: "프레임을 선택할 때 제품 정면과 후면이 동시에 나오게 해 주고 만약에 XDM 144처럼 굉장히 큰 제품 같은 경우는 그때만 정면 후면 형태로 … 모든 매트릭스 SPX VDM도" (2026-09-28)
- PR: https://github.com/Seoulav/rtcom-configurator/pull/137 (squash 병합)
  - 병합 커밋: `b30286f8533cd71be6a04db886c4b18d4b8eee86`
  - PR head: `d476c09e`
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 112 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36486233942)
  - 결과: success (21:27:38Z → 21:28:08Z), 배포 커밋 `b30286f`

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.116`
- 공개 파일 대조: `b30286f`에서 `node scripts/package-site.cjs`로 만든 `dist/` 파일과 공개 파일의 SHA-256을 비교했습니다. 303/303 일치했습니다(`.nojekyll` 제외).
- 비공개 파일 5개는 모두 404였습니다: `CLAUDE.md`, `AGENTS.md`, `CHANGELOG.md`, `docs/qa/frame-duo-preview-screens/1280-xdm-12.png`, `input_doc/README.md`
- 병합 전 검증 결과
  - `node --test tests/*.test.cjs`: 46/46
  - `build-product-index --check`: 30개 통과
  - `package-site`: 통과
  - `e2e-smoke`: 161/161
  - `git diff --check`: 통과

## 배치 기준(참고)

| 배치 | 기준(후면 세로/가로) | 대상 |
|---|---|---|
| 위아래 | 1.1 이하 | XDM-12·20·36, SPX 5종, VDM-8X·16X·32X |
| 좌우 | 2.0 이하 | XDM-72, VDM-48X·64X·256X |
| 정면/후면 버튼 | 2.0 초과 | XDM-144·216, VDM-80X·128X·180X |

## 되돌리기

- main에서 `b30286f`를 revert한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다.
