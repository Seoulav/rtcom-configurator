# 04 사양 "공통" 표기 삭제 · XDM-PSU Signal Flow (0.93.0)

## 요청 (2026-09-28)

1. "XDM-FT101 / XDM-FR101 04 제품 사양에 · XDM-FT101·XDM-FR101 공통이라는 말은 삭제 다른 제품들도 이런게 있다면 일괄 삭제"
2. "xdm-psu제품에도 signal flow개념을 그려줘"

## 1. "모델A·모델B 공통" 삭제

- 대상: `data/products/*.json`의 `specifications[].condition`을 `" · "`로 나눈 조각 가운데 `모델A·모델B 공통` 형태(정규식 `^\S+·\S+ 공통$`)인 조각.
- 결과: 9개 제품, 55곳. XDM-FT101/FR101 5, XDM-CT103/CR103 8, CT101-U/CR101-U 4, CT103-U-H/CR103-U 7, CT104-U/CR104-U 8, FT101-U/FR101-U 6, FT103-U-H/FR103-U 10, SPX-TX/RX 6, OBUX-1C("OBUX-1C Tx·Rx 공통") 1.
- 같은 조건 칸의 다른 조각(해상도·케이블·"CR103-U 소비전력 최대 15W" 등)은 남겼습니다. 조각이 하나뿐이면 조건 칸이 비어 화면에 조건 줄이 나오지 않습니다.
- 제외: `spx.json`의 "I/O 보드 공통 기능"(3곳). 두 모델 공통 표기가 아니라 기능 설명입니다.
- `spx-rx-tx.json`의 `seriesNote`("카탈로그에는 두 제품이 공통 사양 한 표로 실려 있다")는 04 제품 사양이 아니라서 바꾸지 않았습니다.
- 재발 방지: `tests/site.test.cjs` 0.92 검사.

## 2. XDM-PSU "03 Signal Flow"

- 원인: XDM-PSU는 `group: "extender"`지만 HDMI 입출력(io)이 없어 `extenderDiagram`이 `null`을 돌려주고, 03 카드가 나오지 않았습니다.
- 구현: `src/products.js`의 `connectionDiagram`에서 `item.id==='xdm-psu'`이면 `psuDiagram(item)`을 그립니다.
  - 입력 경로(XDM-POH): 소스 → XDM-CTR100(TX) → CAT(신호+전원) → XDM-PSU·POH → CAT(신호) → XDM-CIS100. POH → CTR100 방향으로 주황 점선 "전원 공급".
  - 출력 경로(XDM-PHX): XDM-PSU·PHX → 2핀 전원선(주황) → XDM-COS100 → CAT(신호+전원) → XDM-CTR100(RX) → 디스플레이.
  - 하단 안내: PSU 1대 = 모듈 16칸(POH·PHX 혼합), 본체 전원(사양 `전원` 값), CIS100·COS100 구성에서는 CTR100 PSE 사용 불가.
  - 범례: 입력 · HDBaseT(CATx) · 전원(`#FF9500`, 새 색) · 출력.
- 근거: `xdm-psu.json`의 overview·io·specifications(D1 제조사 자료, U 사용자 확인 2026-09-28). 새 사실은 만들지 않았습니다.

## 검증

- `node --test tests/*.test.cjs` 44/44, `build-product-index --check`, `package-site`, `e2e-smoke` 148/148, `git diff --check` 통과.
- 데스크톱 1400px·휴대폰 390px: XDM-PSU 상세에 03 Signal Flow 1개 표시, XDM-FT101/FR101 페이지에 "XDM-FT101·XDM-FR101 공통" 문자열 없음, 페이지 오류 없음.

## 되돌리는 방법

- 해당 커밋을 `git revert` 합니다. 저장 형식(`rtcom.configuration.v1`, JSON schema 3, `catalogVersion`)과 제품 수(30)는 바꾸지 않았습니다.
