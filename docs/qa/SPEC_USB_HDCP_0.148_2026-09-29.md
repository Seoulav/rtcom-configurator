# 0.148.0 04 제품 사양 Mini USB 삭제·HDCP 표기 통일 (2026-09-29)

## 요청
- "모든 제품 04 제품사양에 mini USB 있다면 모두 삭제해줘"
- "HDCP표기는 HDCP Compliant v2.2 지원 ==> HDCP X(특정버전)지원"

## 조사
`data/products/*.json`의 `specifications` 전체에서 `USB`·`HDCP`를 찾았습니다.

| 제품 | 이전 | 이후 |
|---|---|---|
| QMS-44UX 기타 | 미니 USB 포트 사용 (RS232C 사용가능) | 행 삭제 |
| QMS-88UX 연결 단자 | …LAN(RJ45), Mini USB-serial, 3.5mm… | Mini USB-serial 삭제 |
| QMS-88UX HDCP | HDCP Compliant v2.2 지원 | HDCP 2.2 지원 |
| XDM-CTR100·CTR100 PSE·CT103/CR103·FT101/FR101 | HDCP 2.2 support | HDCP 2.2 지원 |
| SPX·SPX-TX/RX | HDCP 2.2 / HDCP v2.2 | HDCP 2.2 지원 |
| VDM 전송기 5종(CT101·CT103·CT104·FT101·FT103) | HDCP 1.X | HDCP 1.x 지원 |
| OBUX-1C | HDCP v1.x, v2.2 지원 | HDCP 1.x, 2.2 지원 |
| OBHD-2C | 지원 | HDCP 지원 (매뉴얼 Ver.2.1 4쪽에 버전 표기 없음) |
| QMS-44UX | HDCP 2.2 지원 | 변경 없음 |

VDM 카드(AHOC·HOC-UX·LHOC)의 "HDMI2.0b, HDCP 2.2, EDID, HDMI-CEC 지원" 행은 여러 기능을 묶은 문장이라 그대로 뒀습니다.

## 범위 밖(그대로 둠)
- 03 Port Map·제조사 자료 입출력 단자 표의 Mini USB 단자 표시: 실제 단자라 유지.
- 제품 화면 03 Signal Flow의 HDCP 문구는 `src/products.js`가 버전만 뽑아 "HDCP 2.2"로 표시하므로 새 값에서도 같게 나옵니다.

## 되돌리기
이 PR을 revert하면 됩니다(데이터만 바뀜, 스키마·키 변경 없음).
