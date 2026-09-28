# XDM 전송기 RT컴 고해상도 사진 반영 QA (2026-09-28)

## 받은 자료

사용자가 "RT컴에서 받은 사진 자료"라며 압축 파일 하나를 보냈습니다(`XDM____.zip`, 8장). 설명은 "리어는 R, 정면은 F로 표시"였지만, 실제 파일 이름에는 뒷면이 **(B)**로 적혀 있었습니다. 표시가 없는 파일은 **윗면(상판 라벨)** 사진이었습니다.

| 파일 | 제품 | 면 | 제품 크기(px) | 반영 |
|---|---|---|---|---|
| XDM-CT103(F).png | XDM-CT103 | 정면 | 721×1715 | 반영 (기존 342×747) |
| XDM-CTR100.png | XDM-CTR100 | 윗면 | 1845×1130 | 반영 (기존 800×509, 목록 카드 210×129) |
| XDM-CTR100(B).png | XDM-CTR100 | 뒷면 | 2979×862 | 반영 (기존 카탈로그 합성 563×350) |
| XDM-CTR100 PSE.png | XDM-CTR100 PSE | 윗면 | 611×374 | **반영 안 함.** 기존 사진(659×423)보다 작음 |
| XDM-FT101.png | XDM-FT101 | 윗면 | 1804×1392 | 반영 (기존 783×615, 목록 카드 194×150) |
| XDM-FT101(B).png | XDM-FT101 | 뒷면 | 1756×462 | 반영 (기존 매뉴얼 합성 안의 작은 사진) |
| XDM-FR101.png | XDM-FR101 | 윗면 | 1994×1599 | 반영 (기존 861×700) |
| XDM-FR101(B).png | XDM-FR101 | 뒷면 | 1908×489 | 반영, **수신기 단자 지도 새로 추가** |

- 원본은 모두 4912×4912 투명 배경 PNG입니다(PSE만 1626×1626 흰 배경).
- 투명 영역을 기준으로 제품만 잘라 3% 여백을 두고, 흰 배경에 붙여 WebP(품질 88)로 저장했습니다.
- 원본 PNG는 저장소에 넣지 않았습니다.

## 반영 내용

### 제품 사진 (같은 장면, 해상도만 올림)
- `xdm-ctr100-front.webp` 1400×888, `xdm-ctr100-main.webp` 800×507 (제품 목록 카드)
- `xdm-ft101-fr101-main.webp` 800×628 (목록 카드, 송신기), `xdm-ft101-fr101-perspective.webp` 800×650 (수신기)
- `xdm-ft101-perspective-front.webp` 1400×1098, `xdm-ft101-perspective-rear.webp` 1600×487
- `xdm-fr101-front.webp` 1400×1138, `xdm-fr101-rear.webp` 1600×477
- `xdm-ct103-front.webp` 823×1817

### 다른 저해상도 사본 (같은 사진으로 교체, 사용자 요청 "저해상도 이미지 교체")
- 구성기 04 전송기 썸네일(`output/design/assets/extenders/`): `xdm-ctr100.webp` 480→960px, `xdm-ft101.webp` 480→960px, `xdm-fr101.webp` 480→960px, `xdm-ct103.webp` 220→440px. 화면에는 36~132px로 작게 보이지만, 고해상도 화면(레티나)에서 흐리던 문제가 없어집니다. 구성기 04 화면 레이아웃은 그대로입니다(`docs/qa/xdm-rtcom-photo-screens/configurator-04-extenders-1280.png`).
- `xdm-ft101-fr101-rear.webp`(카탈로그 12쪽 뒷면, 515×191) → RT컴 뒷면 사진 1600×487
- 남은 저해상도 사본: `extenders/xdm-cr103.webp`(66×154)·`extenders/xdm-ctr100-pse.webp`는 이번 자료에 해당 사진이 없어 그대로입니다.

### 03 단자 지도
- **XDM-CTR100:** `xdm-ctr100-rear.webp`(1000×668)를 새 합성본으로 바꾸고 번호 7개를 다시 쟀습니다.
  - 위: 앞면(상태 LED·TX/RX 딥 스위치)은 이번 자료에 없어 기존 카탈로그 10쪽 사진을 그대로 씁니다.
  - 아래: 뒷면은 RT컴 사진입니다.
- **XDM-FT101/FR101:**
  - 송신기 합성본 `xdm-ft101-fr101-front-rear.webp`(920×916)의 아래 뒷면을 RT컴 사진으로 바꾸고 번호 6개를 다시 쟀습니다. 위의 앞면(MODE 로터리·S/P)은 기존 매뉴얼 6쪽 사진입니다.
  - 제목을 다른 제품과 같은 형식인 "송신기 XDM-FT101 · 위 앞면, 아래 뒷면"으로 바꿨습니다.
  - 새로 "수신기 XDM-FR101 · 뒷면" 지도를 추가했습니다(`xdm-fr101-rear.webp`, 번호 4개). 번호 순서는 1 HDMI OUT, 2 AUDIO·RS-232, 3 FIBER IN, 4 DC IN(전원 마지막)입니다. 이전에는 수신기 단자 지도가 없었습니다.
- **XDM-CT103:** 새 합성본 `xdm-ct103-front-rear.webp`(832×900)를 만들고 번호 6개를 다시 쟀습니다.
  - 왼쪽: 앞면은 RT컴 사진입니다.
  - 오른쪽: 뒷면은 매뉴얼 Ver.1.4 5쪽 사진입니다.
  - 수신기 CR103 지도는 이미지 선택만 `file`로 고정하고 내용은 그대로 뒀습니다.

## 자료가 더 있으면 좋은 것

이번 자료에는 아래 앞면 사진이 없어, 단자 지도 윗부분은 카탈로그·매뉴얼 사진을 그대로 씁니다. RT컴에 추가로 요청하면 모두 선명하게 바꿀 수 있습니다.
- XDM-CTR100, XDM-CTR100 PSE: 앞면(상태 LED·딥 스위치 쪽)
- XDM-FT101, XDM-FR101: 앞면(MODE 로터리·S/P·Signal/Link LED 쪽)
- XDM-CR103: 앞면·뒷면
- XDM-CT103: 뒷면
- XDM-CTR100 PSE: 윗면 고해상도 원본(이번 파일은 1626px 캔버스라 기존보다 작음)

## 검증

- 스크린샷: `docs/qa/xdm-rtcom-photo-screens/` (3개 제품 × 1280·390px). 번호 위치가 모두 해당 단자에 맞고, 페이지 가로 넘침과 깨진 이미지가 없습니다.
- `node --test tests/*.test.cjs`: 43/43
- `node scripts/build-product-index.cjs --check`: 30개 통과
- `node scripts/package-site.cjs`: 통과
- `node scripts/e2e-smoke.cjs`: 147/147
  - FT101 검사는 첫 번째(송신기) 지도만 세도록 고쳤습니다.
  - 새 검사 3개를 추가했습니다: FR101 수신기 지도 번호 4개, CTR100·CT103 합성본 사용 여부.
- `git diff --check`: 통과

## 되돌리기

- 이 커밋을 `git revert`하면 사진과 단자 지도가 이전 상태로 돌아갑니다.

## 0.89.0 추가 반영: CTR100·PSE 공통 합성 (사용자 확인 2026-09-28)

- 사용자 확인: "ctr100과 pse는 단자는 동일해", "zip파일안에 다 있어". zip 안의 파일은 처음 목록 그대로 8장입니다. 따라서 PSE 뒷면은 CTR100(B) 사진으로 보면 됩니다.
- 앞면 사진 비교
  - CTR100 카탈로그 10쪽 앞면: 약 445px이고 LED 글씨를 읽을 수 없습니다.
  - PSE 제품 안내서 1쪽 앞면: 약 400px이고 "Rx Signal·Tx Signal·Tx/Rx·Link"와 딥 스위치 번호가 읽힙니다.
  - 그래서 PSE 안내서 사진을 두 제품 공통 앞면으로 씁니다.
- 합성 사진 1000×621을 `xdm-ctr100-rear.webp`, `xdm-ctr100-pse-rear.webp` 두 파일에 같게 넣었습니다.
  - 앞면: 폭을 뒷면 몸체 폭(약 865px)에 맞춰 901px로 줄이고 가운데 정렬했습니다.
  - 뒷면: 1000px입니다.
- 번호 좌표(두 제품 공통)
  - 앞면: 6 상태 LED 100~220, 5 딥 스위치 245~348(top 20)
  - 뒷면: 4 HDBaseT 118~252, 1 HDMI IN 287~412, 2 HDMI OUT 472~597, 3 AUDIO·RS-232 632~785, 7 DC IN 793~888(bottom 580)
- 스크린샷: `docs/qa/xdm-rtcom-photo-screens/xdm-ctr100-portmap-*.png`, `xdm-ctr100-pse-portmap-*.png`
