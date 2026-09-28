# XDM-PSU "03 Signal Flow" 배치·확대 창 QA (2026-09-28)

## 요청

1. "XDM COS카드 전원 연결을 조금 만 더 길게해줘" — PHX↔COS100 1번 포트를 잇는 빨강·검정 2핀 전원선이 짧고 "2핀 전원선" 이름표에 눌려 답답해 보임(스크린샷).
2. "그리고 확대시 범례가 안보인다 같이 확대되게해줘" — "⤢ 크게 보기"로 연 확대 창에 그림 아래 있던 범례(입력·HDBaseT 신호·전원·출력 색상 키)가 아예 나오지 않음.
3. "XDM-PSU 전원과 PHX가 조금 거리가 멀었으면 해" — XDM-PSU 후면 그림에서 PHX(2핀 모듈 4개)와 AC 입력(퓨즈·플러그 아이콘)이 거의 붙어 있음(스크린샷).

## 원인과 수정

### 1) 2핀 전원선 길이 — `src/products.js` `psuDiagram()`

XDM-PSU 후면 모듈 행(POH·PHX)과 그 아래 XDM-CTR100 Tx/Rx 블록을 30px 아래로 옮겼습니다(매트릭스 프레임은 그대로 위에 고정). PHX 단자(`phx`)와 COS100 1번 포트 피닉스 단자(`cosPin`)는 그대로 두되 둘 사이 세로 간격이 30px 늘어나, 케이블이 꺾이는 지점(y=262, "2핀 전원선" 이름표 위치는 그대로)까지 이어지는 첫 구간이 74px → 104px로 길어졌습니다. 캔버스 높이(`height`)를 680 → 710으로 늘려 아래쪽 여백을 확보했습니다.

### 2) 확대 창 범례 — `src/products.js` `openFlowZoom()`, `src/styles.css`

범례(`<ul class="rt-pg-legend">`)는 `diagramWrap()`에서 `<svg>`와 형제 요소로 그려지는데, 확대 창은 `svg.outerHTML`만 복사해 범례가 통째로 빠졌습니다. `openFlowZoom()`이 같은 `<section>` 안의 `.rt-pg-legend`도 함께 찾아, 확대 창 머리글 아래 고정 줄(`.rt-flow-zoom-legend`)로 넣습니다. 그림 캔버스(`rt-flow-zoom-canvas`)만 100~300%로 커지고 범례 줄은 배율과 무관하게 항상 같은 크기로 보입니다.

### 3) PHX↔AC 입력 간격 — `src/products.js` `psuDiagram()`

AC 입력(퓨즈·플러그 아이콘, "AC 입력" 글자)만 오른쪽으로 40px 옮기고, XDM-PSU 후면 상자 폭을 400 → 440으로 늘려 자리를 만들었습니다. POH·PHX 모듈 위치는 그대로입니다.

## 검증

```
node --test tests/*.test.cjs                    # 45/45 pass
node scripts/build-product-index.cjs --check    # 제품 30개 검증 통과
node scripts/package-site.cjs                   # dist/ 생성 성공
node scripts/e2e-smoke.cjs                       # 151/151 passed
git diff --check                                 # 공백 충돌 없음
```

Playwright로 `#products/xdm-psu` "03 SIGNAL FLOW" 카드와 "⤢ 크게 보기" 확대 창을 각각 스크린샷으로 확인: PHX↔AC 입력 사이 간격이 뚜렷해졌고, 2핀 전원선의 세로 구간이 길어졌으며, 확대 창 머리글 아래에 범례 4개(입력·HDBaseT 신호·전원·출력) 줄이 항상 보입니다.

## 되돌리는 방법

`src/products.js`의 `psuDiagram()`에서 이 커밋의 좌표 변경분(POH·PHX·CTR100 블록 y+30, AC 입력 x+40, `height` 680)과 `openFlowZoom()`의 `legend` 관련 두 줄, `src/styles.css`의 `.rt-flow-zoom-legend` 규칙 두 줄을 되돌리면 이전 배치로 복원됩니다.
