# HD-13U 정면·후면 사진 고해상도 교체 QA (Unreleased, 2026-09-28)

## 1. 요청

- "HD-13U 고해상도 사진이야 업데이트해줘" + 정면·후면 고해상도 사진 2장(사용자 첨부, 2000×2000px 투명 배경).

## 2. 확인

- 기존 `hd-13u-front.webp`(718×187)·`hd-13u-rear.webp`(716×178)와 같은 구도·각도의 사진으로, 해상도만 낮았습니다(카탈로그 축소본 추정). 사용자가 보낸 사진은 같은 제품·같은 촬영 각도의 고해상도본입니다.
- `data/products/hd-13u.json`의 `portMap`(단자 지도 7개 번호)과 `edidSwitch`(MODE 로터리 강조 링)는 기존 사진의 픽셀 좌표(`resolution` 필드 기준)를 그대로 쓰고 있어, 사진을 바꾸면 좌표도 새 픽셀 크기에 맞춰 다시 구해야 번호표·강조 링이 제자리에 붙습니다(`src/products.js`의 `portMapBlock`·`edidSwitchSection`은 `photo.resolution`을 기준으로 원본 px 좌표를 화면 폭에 맞춰 스케일합니다).

## 3. 처리 방법

1. 사용자가 보낸 2000×2000 투명 배경 사진에서 알파 채널 bbox로 제품 테두리만 잘라내고(여백 10px), 흰 배경에 합성했습니다 → 정면 1045×218, 후면 1147×244.
2. 후면 사진은 밝기 성분 연결요소 분석(파이썬 `PIL`+`scipy.ndimage.label`)으로 HDMI 커넥터 4개(INPUT·OUT1·OUT2·OUT3)·DC 잭 판을 찾고, 오디오 IN/OUT 잭과 SET 버튼은 구간을 확대(3~4배)해 육안으로 좌표를 확인했습니다. 정면 사진은 파란색 MODE 로터리를 색상 마스크(B-R>30 등)로 찾아 사각 영역을 구했습니다.
3. 기존 좌표를 새 사진 폭·높이 비율로 스케일한 값과 위에서 직접 측정한 값이 대부분 ±5px 이내로 일치해 서로 검증했고, 최종적으로 직접 측정값을 사용했습니다.
4. 기존과 같은 합성 방식(정면을 위쪽 y=0, 흰 여백, 후면을 아래쪽에 붙임, 0.66.0 §3)으로 `hd-13u-front-rear.webp`를 새 크기(1147×590, 여백 128px = 기존 80px×확대 배율)로 다시 만들고, 두 사진이 좌우로 다른 폭일 때는 짧은 쪽을 가운데 정렬했습니다(이번에는 후면이 더 넓어 정면을 51px 안쪽으로 정렬).
5. 합성 사진 위에 번호표 위치를 그려 넣은 검증용 오버레이 이미지와 실제 개발 서버 스크린샷(Playwright, `#products/hd-13u`)으로 7개 번호·EDID 강조 링이 모두 제자리에 있는지 확인했습니다.

## 4. 바꾼 파일

- `output/design/assets/products/hd-13u-front.webp`, `hd-13u-rear.webp`, `hd-13u-front-rear.webp`: 고해상도로 교체(내용·각도는 동일, `hd-13u-diagram.webp`는 변경 없음).
- `data/products/hd-13u.json`: `images[].resolution`(Front·Rear·Other) 3곳, `portMap.items[]`의 좌표 7개, `edidSwitch`의 `x1·y1·x2·y2`를 새 사진 픽셀 기준으로 갱신. 텍스트(라벨·설명·번호·순서)는 바꾸지 않았습니다.

## 5. 검증

- `node --test tests/*.test.cjs`: 39/39 통과.
- `node scripts/build-product-index.cjs --check`: 제품 29개 검증 통과(좌표가 사진 폭·높이 안에 있는지 등 validator 규칙 포함).
- `node scripts/package-site.cjs`: 통과.
- `node scripts/e2e-smoke.cjs`(전역 설치 playwright 사용): 139/139 통과 — HD-13U 관련 검사(단자 지도 7개 번호·정면 MODE·SET 포함·전원 마지막, EDID 코드표, 오디오 설정 카드) 모두 통과.
- `git diff --check`: 통과.
- 개발 서버(`node scripts/serve.cjs` → `http://127.0.0.1:4173/#products/hd-13u`) Playwright 스크린샷으로 02 Port Map(번호 7개가 커넥터 위에 정확히 붙음)과 06 EDID 설정(로터리 강조 링)을 육안 확인했습니다.

## 6. 되돌리기

해당 커밋을 `git revert`합니다(사진 3장 교체와 `data/products/hd-13u.json`의 `resolution`·`portMap`·`edidSwitch` 좌표가 함께 이전 값으로 돌아갑니다). `hd-13u-diagram.webp`는 이번 작업에서 건드리지 않았습니다.
