# 제품정보 04 카드 라인업 상세 팝업 (0.143.0)

사용자 요청(2026-09-29): 카드 정보를 누르면 카드 상세 정보가 나오게 하고, CIS·COS 카드의 "CTR100 연동" 같은 표기는 빼고 HDBaseT 카드라고만 표기. VDM·SPX도 동일하게.

- `src/products.js` `cardRow`: 행을 `<button data-pg-card>`로 바꿔 누르면 `openProductCardInfo`가 팝업을 엽니다. 행 설명에서 `CARD_EXTENDER_LABEL` 기반 "↔ 전송기" 문구를 뺐습니다(XDM·SPX·VDM 공통 코드라 세 제품군이 함께 바뀜).
- 팝업 내용: 카드 사진, 구분·신호·채널, `src/card-specs.js` 사양, 용도 설명(`RtCardTips`, `src/app.js`에서 노출), 카탈로그 쪽. 연동 전송기 행은 넣지 않습니다(구성기 카드 팝업의 연동 전송기 선택은 그대로).
- 스타일: `src/styles.css` 끝의 0.143 규칙(버튼 기본 모양 제거·호버 강조), 팝업은 구성기 카드 정보 팝업 클래스(`rt-card-info-modal`)를 재사용.
- 검증: e2e에 XDM·SPX·VDM 세 제품군 행 클릭·팝업 확인·연동 표기 없음 검사 추가. 화면: `docs/qa/product-card-info-screens/`.
- Rollback: 병합 커밋을 되돌립니다.
