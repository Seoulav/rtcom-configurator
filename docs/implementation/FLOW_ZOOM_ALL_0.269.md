# 0.269 모든 제품 03 Signal Flow "크게 보기"

## 요청

- 사용자 요청(2026-11-16): "다음 단계 모두 진행해줘"
  - 0.267 보고의 다음 단계 제안은 두 가지였습니다.
    1. #428(공개 사이트 AV Portal 언급 제거)을 번호를 옮겨 병합하기: 다른 세션이 0.268로 병합·배포했습니다(#428, 배포 기록 #430).
    2. 다른 제품 Signal Flow에도 "크게 보기" 넣기: 이 문서의 작업입니다.

## 바뀐 것

- `src/products.js`
  - 단일 제품 상세의 03 Signal Flow 칸이 `withFlowZoom(diagram)`으로 그림 앞에 `⤢ 크게 보기` 버튼 줄(`FLOW_ZOOM_BAR`)을 붙입니다.
    - 그림 함수가 이미 버튼을 넣은 XDM-PSU·XDM-CTR100 PSE·XDM-MR4S는 한 번만 둡니다. 이 세 제품은 그림을 눌러도 열립니다(`rt-psu-anim`).
    - 나머지 제품은 버튼으로만 엽니다. 휴대폰에서 가로로 넘겨 보는 그림을 누를 때 창이 뜨면 불편하기 때문입니다.
    - SVG 그림(`rt-pg-svg-wrap`)이 없는 그림에는 붙이지 않습니다.
  - `openFlowZoom`이 숨긴(`hidden`) 쪽을 건너뛰고 지금 보이는 그림과 범례를 복사합니다. SPX-R6의 TX 구성·RX 구성 전환에서 RX를 보고 있으면 RX 그림이 확대됩니다.
- 확대 창 동작(0.265 CAD식)은 그대로입니다.

## 적용 범위(전수 확인)

| 구분 | 제품 | 결과 |
| --- | --- | --- |
| 버튼 1개, 창 100%·그림·범례 | QMS-44UX·QMS-88UX, HD-D102U, HD-13U·HD-104U·HD-108U·HD-210U, HDS-21U·HDS-42MU, CT101-U/CR101-U·CT103-U-H/CR103-U·CT104-U/CR104-U·FT101-U/FR101-U·FT103-U-H/FR103-U, OBHD-2C·OBUX-1C, SPX-R6·SPX-TX/RX, XDM-CT103/CR103·XDM-CTR100·XDM-CTR100 PSE·XDM-FT101/FR101·XDM-MR4S·XDM-PSU, AHOC·HOC-UX·LHOC·UMC | 29종 모두 통과 |
| Signal Flow 없음(변화 없음) | XDM·SPX·VDM 시리즈 페이지, HD-D102U Rack마운트, MR-4S | 버튼 없음 |

- 시리즈 페이지의 "02 신호 구성" 그림은 WOS100·HOS100 칸을 눌러 카드 기능 팝업을 여는 그림이라 이번 범위에서 뺐습니다.

## 시험

- `tests/site.test.cjs` "0.269: Signal Flow가 있는 모든 단일 제품에 크게 보기…"
- `scripts/e2e-smoke.cjs`
  - 새 검사: QMS-88UX 버튼 1개로 100% 창(그림·범례), SPX-R6 RX 구성으로 바꾼 뒤 열면 RX 그림이 확대되는지 확인합니다.
  - 기존 "XDM-CTR100에는 확대 버튼 없음" 검사를 "XDM-CTR100에도 확대 버튼 1개"로 바꿨습니다.
- 화면 전수 확인(로컬, 1366px): 제품 33종을 열어 위 표와 같은 결과를 확인했습니다.

## 되돌리기

- 이 PR의 squash 커밋을 `git revert`합니다.
- 버튼만 다시 PSU·PSE·MR4S로 줄이려면 03 Signal Flow 칸의 `withFlowZoom(diagram)`을 `diagram`으로 되돌립니다.
