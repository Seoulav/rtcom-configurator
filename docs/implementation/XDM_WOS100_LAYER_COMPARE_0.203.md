# XDM-WOS100 레이어 구성도 · 비디오 프로세서 레이어 비교 팝업 (0.203.0)

## 요청

사용자 요청 2026-10-12:
- "알티컴 XDM-Wos카드를 이런식으로 표현해주고 비디오프로세서들도 2k,4k레이어가 몇개 되는지 표로 정리해주면 좋겠어" (Analog Way Aquilon RS4 데이터시트의 응용 구성도를 예시로 제공)
- "비디오 프로세서 레이어 비교는 vp제품 군 프레임선택 하는항목한쪽에 이 페이지를 볼 수 있게해줘 디자인을 너가해줘"

## 화면

구성기 02 프레임 선택에서 제품군이 XDM일 때, 기존 "EDID · LED 활용 팁" 카드 옆에 "XDM-WOS100 · 레이어" 카드가 나란히 놓입니다(`.rt-xdm-feature-row`, 720px 이하에서는 세로로 쌓임). 카드의 "레이어 구성도 · 비교표 보기" 버튼(`data-action="layer-compare"`)을 누르면 `openLayerCompare()`가 카드 상세 팝업과 같은 `<dialog>`를 엽니다. 팝업은 화면 상태일 뿐이며 저장·실행 취소·JSON 형식에는 영향이 없습니다.

팝업 내용:
1. **구성도(SVG)**: 입력 슬롯 소스(PC·CAM·미디어 서버) → XDM 메인프레임 → XDM-WOS100 HDMI 4포트 → 2×2 비디오 월(OUT 1~4) 위에 4레이어 중첩. 제어·커맨드 경로와 출력 슬롯 Multiview 기본 레이아웃(매뉴얼 KV08 32~34쪽) 참고 박스를 함께 그렸습니다. Analog Way 데이터시트의 "LED wall + PIP" 그림 방식을 따랐습니다.
2. **비교표**: 제조사 · 모델 · 4K60p 입력 · 4K60p 출력 · 4K 레이어 · 2K/DL 레이어 · 레이어 정의·비고 · 근거.

## 표 값과 근거

| 모델 | 4K 레이어 | 2K/DL 레이어 | 근거 |
|---|---|---|---|
| Aquilon RS4 | 12 | 24 (분할 시 ×2) | 사용자 제공 데이터시트 AQL-RS4-EN-20260401 |
| Aquilon RS2 / RS1 | 8 / 4 | 16 / 8 | AV Portal 상세(제조사 데이터시트) |
| Zenith 200 / 100 | 4 믹싱 (8 분할) / 3 믹싱 (6 분할) | 미명시 | AV Portal 상세 |
| Pulse 4K · Eikos 4K | 2 믹싱 (4 분할) | 미명시 | AV Portal 상세 |
| NovaStar H5 / H2 | 출력 카드당 4 | 출력 카드당 16 (섀시 상한 48 / 32) | AV Portal 상세(사용자 확정 자료) |
| Colorlight X100 Pro 7U / 4U·2U | 64 / 32 (해상도 구분 없음) | | AV Portal 상세 |
| Magnimage LED-780H | — | 출력당 4 | AV Portal 상세(매뉴얼) |
| RTCOM XDM-WOS100 | 4레이어(해상도 구분 없음) | | 알티컴 카탈로그 2026 9쪽 · 구성기 카드 설명 |

- XDM-WOS100의 "4레이어"는 구성기 카드 설명(`cardTips`, 카드 배지)과 같은 값입니다. 알티컴 카탈로그 9쪽과 매뉴얼 KV08에는 레이어 수가 적혀 있지 않아, 제조사 확인 요청(`docs/RTCOM_MANUFACTURER_DATA_REQUEST.md` Q6)이 열려 있다는 점을 팝업 설명에 밝혔습니다. 제조사 회신이 오면 `layerCompareRows` 마지막 행과 설명문을 고칩니다.
- 제조사마다 레이어 정의가 다릅니다. Aquilon은 4K 1 = 2K 2이고 분할 레이어는 2배, NovaStar H는 출력 카드 1매당 자원이며 섀시 상한과 비교해 작은 쪽이 한도, Colorlight는 해상도 구분이 없습니다. 비고 열과 팝업 하단 설명에 적었습니다.

## 바뀐 파일

- `src/app.js`: `chassisViewV2()`의 XDM 활용 팁을 `.rt-xdm-feature-row`로 감싸고 레이어 카드 추가, `layerCompareRows`·`layerCompareSvg()`·`openLayerCompare()` 추가, 클릭 처리에 `layer-compare` 추가.
- `src/styles.css`: `.rt-xdm-feature-row`, `.rt-layer-note`, `.rt-layer-open`, `.rt-layer-modal`, `.rt-layer-figure`, `.rt-layer-table` 등 추가.
- `index.html`·`README.md`·`CHANGELOG.md`·`CLAUDE.md`: 0.203.0.

## 영향 범위

구성기 카탈로그(제품군·섀시·카드 3/21/26), `rtcom.configuration.v1`, JSON schema 3, 슬롯 ID, 주소는 바뀌지 않습니다. 새 파일을 배포 목록에 더하지 않았으므로 `scripts/package-site.cjs`는 그대로입니다.

## 되돌리기

`git revert <0.203 커밋>`으로 되돌립니다. 데이터 이전은 없습니다.
