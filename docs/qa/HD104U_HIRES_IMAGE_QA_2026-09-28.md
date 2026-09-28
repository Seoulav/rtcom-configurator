# HD-104U 전면·후면 고해상도 사진 교체 QA (2026-09-28)

## 배경

- 사용자가 HD-104U 후면·전면 고해상도 사진 2장(각 2000×1251px, 알파 채널 포함)을 대화창에 업로드하고 "HD-104U 사진이야"라고 확인.
- `docs/RTCOM_HIRES_IMAGE_REQUEST.md` 1순위(긴 변 250px 이하) 목록에 HD-104U(기존 판넬 313×75)가 있었고, 이번에 받은 사진이 그 요청에 해당함을 확인.
- 기존 이미지: `hd-104u-front.webp`(688×164), `hd-104u-rear.webp`(693×169), 합성본 `hd-104u-front-rear.webp`(693×413).

## 변경 내용

### 1. 이미지 교체

업로드된 원본(2000×1251, 알파 채널)에서 실제 제품 영역만 알파 채널 기준으로 잘라내 흰 배경에 합성했습니다.

- `hd-104u-front.webp`: 1245×258 (기존 688×164)
- `hd-104u-rear.webp`: 1275×262 (기존 693×169)
- `hd-104u-front-rear.webp`: 1275×580, 정면을 위(오프셋 x=15, y=0)·후면을 아래(오프셋 x=0, y=318, 정면과 60px 간격)로 흰 배경에 합성(기존 693×413과 같은 "위 앞면, 아래 뒷면" 구성)

`data/products/hd-104u.json`의 `images[].resolution`을 새 크기로 갱신하고, `source`를 `C`(카탈로그)에서 새로 추가한 `P1`(사용자 제공 고해상도 사진)로 바꿨습니다.

### 2. 단자 지도(portMap)·EDID 로터리 좌표 재측정

기존 좌표는 옛 저해상도 이미지 기준이라 그대로 쓸 수 없어, 새 이미지에서 픽셀 단위로 다시 측정했습니다.

- 후면 HDMI 커넥터 5개: 밝기 임계값(다이오드 금속 테두리는 밝고 검정 판넬은 어두움)으로 열 단위 스캔해 각 커넥터의 좌우 경계를 검출(`x1`~`x2`). HDMI IN 134–260, OUT1 328–454, OUT2 522–648, OUT3 716–841, OUT4 909–1034. portMap의 "HDMI OUT 1–4" 괄호는 OUT1 왼쪽 끝(328)부터 OUT4 오른쪽 끝(1034)까지로 지정.
- DC 5V 잭: 사각 하우징 테두리를 확대·격자 오버레이로 육안 확인 후 x1=1103, x2=1198로 지정.
- 전면 EDID 로터리 스위치: 파란색 색상(청색 채널이 적색 채널보다 25 이상 높은 픽셀) 마스크로 자동 검출한 바운딩 박스(x 900–977, y 78–155)를 사각형으로 그려 원본 사진과 대조해 일치 확인.
- 합성 이미지 오프셋(정면 x=15,y=0 / 후면 x=0,y=318)을 반영해 `portMap.items`의 좌표(후면 기준 항목은 y=318, 전면 기준 EDID 항목은 x+15·y=0)와 `edidSwitch`(전면 이미지 단독 좌표라 오프셋 없이 그대로)를 갱신.

### 3. 문서 정리

- `docs/RTCOM_HIRES_IMAGE_REQUEST.md` 1순위 표에서 HD-104U 행을 지우고 "완료" 절에 이동 기록.
- `data/products/hd-104u.json`의 `sources`에 `P1`(HD-104U 고해상도 제품 사진) 추가, `issues`에 `N2`(전면·후면 사진 고해상도 교체) 추가.
- 사선(3/4 뷰) 사진은 아직 받지 못해 `docs/RTCOM_HIRES_IMAGE_REQUEST.md` 완료 기록에 그대로 남김(다음 수령 시 반영 필요).

## 검증

```
node --test tests/*.test.cjs
node scripts/build-product-index.cjs --check
node scripts/package-site.cjs
node scripts/e2e-smoke.cjs
git diff --check
```

`portMapBlock()`(`src/products.js`)이 `photo.resolution`(JSON에 적은 값)을 기준으로 좌표를 스케일하므로, 실제 webp 파일 픽셀 크기와 JSON의 `resolution` 문자열이 반드시 일치해야 합니다. 아래로 실제 파일 크기와 JSON 값이 같은지 확인했습니다.

```python
from PIL import Image
for f in ['hd-104u-front.webp','hd-104u-rear.webp','hd-104u-front-rear.webp']:
    print(f, Image.open('output/design/assets/products/'+f).size)
# (1245, 258) / (1275, 262) / (1275, 580) — JSON 기록과 일치
```

## 롤백 방법

이 커밋만 되돌리면 이전 저해상도 이미지·좌표로 복원됩니다(`git revert <commit>`). 스키마·호환성 계약 변경 없음(이미지 파일과 `images`·`portMap`·`edidSwitch`·`sources`·`issues` 값만 수정).
