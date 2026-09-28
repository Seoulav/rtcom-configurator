# SPX-M810 프레임 정면·후면 사진 고해상도 교체 QA (Unreleased, 2026-09-28)

## 1. 요청

- "SPX-M810고해상도 사진이야" + 정면·후면 고해상도 사진 2장(사용자 첨부, 2000×2000px 투명 배경).

## 2. 확인

- 기존 `spx-m810-front.webp`(715×161)·`spx-m810-rear.webp`(715×169)와 같은 구도·각도의 사진으로, 해상도만 낮았습니다. 새 사진에서는 저해상도에서 뭉개져 보이지 않던 입력단(HDMI 8포트 사이 3.5mm 오디오 잭 7개)까지 선명하게 보입니다.
- SPX-M810의 후면 사진은 제품정보 화면(`data/products/*.json`)이 아니라 **구성기 자체**(`src/app.js`의 `rearPhotos['SPX-M810']`)에서 씁니다. `size`(사진 픽셀 크기)와 `input`/`output`(입력 1슬롯·출력 1슬롯 영역의 사진 픽셀 좌표 `[x0,y0,x1,y1]`)을 기준으로 실제 카드 슬롯 버튼과 장착한 카드 사진(SPX-HIS8·SPX-HOS10 등)을 사진 위에 겹쳐 그립니다. 사진을 바꾸면 이 좌표도 같이 바꿔야 슬롯이 커넥터 자리에 정확히 겹칩니다. `tests/site.test.cjs`의 "rear photo slot zones stay inside each photo and match the card faceplate ratio" 테스트가 좌표가 사진 안에 있는지·슬롯 가로세로 비율이 SPX 판넬 비율(13.8:1, ±15%)에 맞는지를 검사합니다.

## 3. 처리 방법

1. 사용자가 보낸 2000×2000 투명 배경 사진에서 알파 채널 bbox로 제품 테두리만 잘라내고(여백 8px) 흰 배경에 합성했습니다 → 정면 1636×368, 후면 1706×385.
2. 후면 사진에서 밝기 성분 연결요소 분석(`PIL`+`scipy.ndimage.label`)으로 카드 고정 나사(원형, 밝은 회색) 4개와 HDMI 커넥터 18개(입력 8 + 출력 10)·제어단자(그린 터미널) 2개의 좌표를 찾았습니다.
   - 입력 카드(SPX-HIS8, 8포트, 매뉴얼 근거 카탈로그 `SPX:{input:[['SPX-HIS8','HDMI',8,'HDMI']]}`)는 위쪽 줄, 출력 카드(SPX-HOS10/12·SPX-COS12)는 아래쪽 줄입니다(0.34 주석 "M810·M1620·M3236은 가로 카드 입력 위·출력 아래"와 일치).
   - 나사 중심 x좌표(왼쪽 ≈214, 오른쪽 ≈1499)를 슬롯 영역의 좌우 경계로, 각 줄의 커넥터·나사를 넉넉히 감싸는 높이(95px)를 상하 경계로 잡아 `input:[210,60,1500,155]`·`output:[210,155,1500,250]`을 얻었습니다. 가로:세로 비 ≈13.6:1로 SPX 판넬 비율(13.8:1) 안에 들어옵니다.
3. 구성기 실제 화면(Playwright, `#matrix-configurator` → SPX → SPX-M810 → 03 카드 슬롯)에서 슬롯 버튼과, 입력에 SPX-HIS8·출력에 SPX-HOS10을 장착했을 때 카드 사진이 실제 커넥터 줄 위에 정확히 겹치는지 육안으로 확인했습니다. 02 프레임 선택의 정면·후면 미리보기 사진도 확인했습니다.

## 4. 바꾼 파일

- `output/design/assets/frames/spx-m810-front.webp`, `spx-m810-rear.webp`: 고해상도로 교체(구도·각도는 동일).
- `src/app.js`: `rearPhotos['SPX-M810']`의 `size`·`input`·`output`을 새 사진 픽셀 기준으로 갱신. `page`·`manual` 등 다른 필드는 바꾸지 않았습니다.

## 5. 검증

- `node --test tests/*.test.cjs`: 39/39 통과(슬롯 영역·비율 검사 포함).
- `node scripts/build-product-index.cjs --check`: 제품 29개 검증 통과.
- `node scripts/package-site.cjs`: 통과.
- `node scripts/e2e-smoke.cjs`: 139/139 통과.
- `git diff --check`: 통과.
- 개발 서버(`node scripts/serve.cjs`) + Playwright로 구성기 02(정면·후면 토글)·03(카드 슬롯, 카드 장착 후 사진 겹침)을 스크린샷으로 확인했습니다.

## 6. 되돌리기

해당 커밋을 `git revert`합니다(사진 2장 교체와 `src/app.js`의 `rearPhotos['SPX-M810']` 좌표가 함께 이전 값으로 돌아갑니다).
