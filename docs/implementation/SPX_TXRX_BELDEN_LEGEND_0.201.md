# SPX-TX/RX 신호 흐름 범례에 Belden 케이블 조건 표시 (0.201.0)

## 요청

사용자 요청 2026-10-04(휴대폰 화면 캡처, "03 Signal Flow" 범례의 `4K/60 실효 전송 거리: UTP CAT6 50m · S/FTP CAT6A 70m`에 표시): "벨덴 케이블 7814a와 10gxe02사용 조건이야 수정해".

## 원인

0.166에서 04 제품 사양의 "4K/60 실효 전송 거리" 값(`UTP CAT6 50m (Belden 7814A 케이블 기준)` / `S/FTP CAT6A 70m (Belden 10GXE02 케이블 기준)`)을 범례 한 줄로 만들 때 `cableLabelFor`가 괄호 설명을 모두 지웠습니다. 그래서 실측 거리의 사용 조건인 케이블 모델이 범례와 펼치는 그림 설명에서 빠졌습니다.

## 변경

- `src/products.js` `cableLabelFor`: 여러 줄 값의 괄호 중 `Belden <모델>`이 있으면 `(Belden 7814A)`처럼 모델만 남기고, 그 밖의 괄호 설명은 지금처럼 지웁니다.
- 결과: `4K/60 실효 전송 거리: UTP CAT6 50m (Belden 7814A) · S/FTP CAT6A 70m (Belden 10GXE02)`(범례·그림 설명 같음).
- 영향 범위: 여러 줄 거리 값을 가진 제품 8종 중 괄호에 Belden이 있는 제품은 SPX-TX/RX뿐이라 다른 제품 범례는 바뀌지 않습니다. 04 제품 사양 표는 0.166대로 줄마다 값과 괄호 설명을 그대로 보여 줍니다.

## 검증

- 단위 테스트 `0.201: SPX-TX/RX 03 Signal Flow 범례의 실효 전송 거리에 Belden 케이블 조건…`
- e2e: SPX-TX/RX 범례에 `UTP CAT6 50m (Belden 7814A)`·`S/FTP CAT6A 70m (Belden 10GXE02)`이 보이는지 확인
- 화면: `docs/qa/spx-txrx-belden-0.201/`

## 되돌리기

`cableLabelFor`의 여러 줄 처리에서 괄호 치환 함수를 `''`로 바꾸면 0.166 표기로 돌아갑니다.
