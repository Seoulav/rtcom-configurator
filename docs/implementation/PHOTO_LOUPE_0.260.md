# 0.260 전 제품 사진 확대 팝업과 원형 돋보기(B안)

## 요청과 결정

- 사용자 요청(2026-10-20): "알티컴 전 제품에 적당한 크기의 돋보기가 있었으면 해. 화면 확대를 눌렀을 때만 돋보기가 나오거나, 확대 버튼을 누른 후 팝업 페이지 상태에서 돋보기가 나오는 것과 뭐가 좋을까?"
- 비교안:
  - A안: 상세 화면의 사진 위에 바로 돋보기를 띄웁니다. 단자 지도의 번호 배지·클릭과 겹치고, 휴대폰에서는 화면을 내리려다 돋보기가 뜨기 쉽습니다.
  - B안(추천): 🔍 버튼으로 사진 확대 팝업을 열고, 팝업 안에서만 원형 돋보기를 씁니다. 기존 화면 동작은 그대로 둡니다.
- 사용자 선택: "B안으로 진행해줘".

## 바뀐 것

- 제품 상세 머리(단일 제품·XDM·SPX·VDM 시리즈 모두)의 "← 제품 목록" 옆에 `🔍 사진 확대` 버튼을 넣었습니다. 33개 제품 모두 실물 사진이나 평면 그림이 있어 모든 제품에 버튼이 보입니다.
- 02 Port Map 사진 칸 오른쪽 위에 `🔍 확대` 버튼을 넣었습니다. 번호 배지와 겹치지 않도록 그림 위 별도 줄에 둡니다. 이 버튼으로 열면 지금 보던 사진(예: 후면) 탭이 먼저 선택됩니다.
- 팝업(`dialog.rt-flow-zoom.rt-photo-zoom`)은 Signal Flow "크게 보기"와 같은 틀입니다.
  - 머리: 🔍 돋보기 켜기·끄기, − / + 확대 단계(100·150·200·300%, 사진 원본의 3배 폭까지만), × 닫기. Esc와 바깥 누르기로도 닫힙니다.
  - 사진이 둘 이상이면 썸네일 탭(정면·후면·대표·사선·기타, 모델이 둘 이상인 송·수신기 제품은 `· 모델명`)을 보여 줍니다. 연결 다이어그램(`Diagram`)과 같은 파일이 두 번 나오는 사진은 뺍니다.
  - 아래에 사진 설명(`alt`)을 적습니다. 사진 바탕은 다크 모드에서도 밝은 `--rt-photo`입니다.
- 원형 돋보기(`PHOTO_LENS`):

  | 입력 | 지름 | 배율 | 위치 |
  | --- | --- | --- | --- |
  | 마우스 | 180px | 2.5배 | 커서를 가운데에 둠 |
  | 터치·펜 | 130px | 2.5배 | 손가락에 가리지 않게 28px 위로 띄움, 위쪽 공간이 모자라면 아래로 띄움 |

  - 배율은 0.49 사진 팝업의 3.1배보다 낮췄습니다. 사진 원본 해상도보다 크게 키우면 글씨가 흐려지기 때문입니다.
  - 휴대폰은 사진을 누른 채 움직이면 돋보기가 따라가고, 손을 떼면 사라집니다. 돋보기를 끄면 손가락으로 확대한 사진을 옮겨 볼 수 있습니다.
  - 휴대폰(560px 이하)에서는 제목이 한 줄을 다 쓰고 버튼은 그 아래 줄로 내려갑니다(낱말 중간에서 줄이 바뀌지 않음).

## 파일

- `src/products.js`: `zoomPhotos`·`photoZoomButton`, `headerBlock`의 `photos` 자리, `portMapBlock` 확대 줄, `currentItem`, `openPhotoZoom`·`renderPhoto`·`photoLensAt`, 클릭 처리(`data-photo-zoom`·`data-photo-tab`·`data-photo-step`·`data-photo-lens`).
- `src/styles.css`: `.rt-pg-photo-zoom-bar`·`.rt-pg-photo-zoom-btn`·`.rt-photo-*`(이미 있는 색 변수만 사용, `dark_tokens.cjs --check` 최신).
- 시험: `tests/site.test.cjs` "0.260: 전 제품 사진 확대 팝업(B안)과 원형 돋보기", `scripts/e2e-smoke.cjs` "사진 확대 팝업(B안)…"(QMS-88UX PC 화면, HD-13U 휴대폰 터치).

## 검증

- `node --test tests/*.test.cjs` 통과(201개)
- `node scripts/build-product-index.cjs --check` 33개 일치
- `node scripts/package-site.cjs` → `node scripts/e2e-smoke.cjs` 291/291 통과
- `node scripts/tools/dark_tokens.cjs --check` 최신, `node scripts/tools/unify_notation.cjs` 바뀔 곳 0건, `git diff --check` 깨끗함
- 화면 확인: QMS-88UX PC 팝업(정면·후면 탭, 돋보기 180px), 휴대폰 390px(제목 한 줄, 돋보기 130px가 위쪽에서 잘리지 않고 손가락 아래로 이동), 가로 스크롤 없음

## 되돌리기

- 이 PR의 squash 커밋을 `git revert`하면 버튼·팝업·스타일·시험이 모두 빠집니다. 제품 데이터와 사진 파일은 바꾸지 않았습니다.
- 돋보기 크기·배율만 바꾸려면 `src/products.js`의 `PHOTO_LENS` 값을 고치고 단위 시험의 같은 값을 맞춥니다.
