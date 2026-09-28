# 0.119.0 배포 기록 (2026-09-28)

- 요청: "VDM 16 프레임 후면을 보면은 제품 이미지가 들어갔는데 그게 아니라 그래픽 디자인이 들어가겠죠. 혹시 다른 게 또 이런 게 있는지 한번 체크해 줘. 다 끝나면은 요 구성 상태로 모든 걸 병합하고 깃허브에 올려줘." (2026-09-28)
- PR: https://github.com/Seoulav/rtcom-configurator/pull/143 (squash 병합)
  - 병합 커밋: `d5b703086eb2be40825ac15669b8a57b40f38ae2`
  - PR head: `74851d76`
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 119 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36489061072)
  - 결과: success (21:53:41Z → 21:54:13Z), 배포 커밋 `d5b7030`

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.119`
- 공개 파일 대조: `d5b7030`에서 `node scripts/package-site.cjs`로 만든 `dist/` 파일과 공개 파일의 SHA-256을 비교했습니다. 304/304 일치했습니다(`.nojekyll` 제외, 새 그림 1장 추가로 303 → 304).
- 비공개 파일 5개는 모두 404였습니다: `CLAUDE.md`, `AGENTS.md`, `CHANGELOG.md`, `docs/qa/vdm16x-rear-art-screens/03-cards.png`, `input_doc/README.md`
- 병합 전 검증 결과
  - `node --test tests/*.test.cjs`: 46/46
  - `build-product-index --check`: 30개 통과
  - `package-site`: 통과
  - `e2e-smoke`: 164/164(번호표 숨김 검사 안정화 후 3회 연속 통과)
  - `git diff --check`: 통과

## 전수 점검(프레임 이미지)

| 화면 | 그림 | 실물 사진 |
|---|---|---|
| 03 카드 슬롯 후면(20종) | 20종 전부(0.119에 VDM-16X 추가) | 없음 |
| 02 프레임 선택 전면(19종) | VDM 7종(8X·32X·64X·80X·128X·180X·256X) | XDM 6종, SPX 5종, VDM-16X·48X(카드 없는 제품 정면) |

## 되돌리기

- main에서 `d5b7030`을 revert한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다.
