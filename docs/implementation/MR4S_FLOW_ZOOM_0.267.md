# 0.267 XDM-MR4S 03 Signal Flow "크게 보기"

## 요청

- 사용자 요청(2026-11-16): "XDM-MR4S Singal Flow도 크게 보기 넣어줘"
- 0.265에서 XDM-PSU·XDM-CTR100 PSE의 "크게 보기" 창을 CAD처럼 바꿨습니다. XDM-MR4S 03 Signal Flow(0.227)에는 이 창이 없었습니다.

## 바뀐 것

- `src/products.js`의 `mr4sDiagram`이 XDM-PSU·PSE 그림과 같은 방식으로 그림을 돌려줍니다.
  - 그림 위에 `⤢ 크게 보기` 버튼 줄(`rt-flow-zoom-bar`)을 둡니다.
  - 그림 본문을 `<g class="rt-psu-anim">`으로 묶습니다. 이 표시가 있으면 그림 위 커서가 확대 모양이 되고, 그림을 눌러도 창이 열립니다(기존 클릭 처리 그대로).
- 확대 창은 0.265 그대로입니다: 끌어서 이동, 휠로 마우스 위치 기준 확대(100~600%), 두 번 누르면 맞춤, 휴대폰 두 손가락 확대, `+`·`−`·`0` 키, 범례 함께 표시.
- 그림 내용·제품 데이터·인쇄 화면(버튼 줄은 인쇄에서 숨김)은 바뀌지 않았습니다.

## 시험

- `tests/site.test.cjs` "0.267: XDM-MR4S 03 Signal Flow도 크게 보기…": 버튼 줄과 `rt-psu-anim` 묶음을 확인합니다.
- `scripts/e2e-smoke.cjs` "XDM-MR4S 03 Signal Flow에 '크게 보기' 버튼이 있고…": 그림을 누르면 창이 100%로 열리고 카드 이름이 보이며, `+` 한 번에 125%, Esc로 닫히는지 확인합니다. 기존 XDM-CTR100 "확대 버튼 없음" 검사는 그대로 통과합니다.

## 되돌리기

- 이 PR의 squash 커밋을 `git revert`하면 됩니다. 버튼만 빼려면 `mr4sDiagram`의 반환 줄을 `return diagramWrap(body,width,height,captions,{…})`로 되돌립니다.
