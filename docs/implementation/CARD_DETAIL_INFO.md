# 매트릭스 카드 상세 정보 (0.79.0)

## 요청

- 사용자 요청(2026-09-28): "입력 출력카드 버튼을 만들어 해당 카드 상세정보가 나와야해. XDM, VDM, SPX 카드 정보 등록해줘. 필요한 자료 요청해줘."

## 구현

- `src/card-specs.js`: `globalThis.RtCardSpecs`에 카드 ID별 `title`(카탈로그 영문 이름), `page`(46쪽판 쪽 번호), `specs`([항목, 값] 목록), 선택 항목 `note`, `missing`을 둡니다. `index.html`에서 `catalog.js` 다음에 읽고, `scripts/package-site.cjs`가 `dist/`에 복사합니다.
- `src/app.js`
  - `cardInfoBar()`: 03 카드 슬롯의 범례 아래에 제품군의 입력·출력 카드를 버튼(`data-card-info`)으로 나열합니다.
  - `configurationSummary()`: "내 구성"의 카드 행을 `button.rt-summary-card`로 바꿨습니다.
  - `cardChoiceModal()`: 카드 선택창의 카드마다 아래 줄 왼쪽에 "상세 보기"(`button.rt-card-choice-info`) 버튼을 두었습니다(사용자 요청 2026-09-28 "카드 선택창에도 상세보기 추가해"). 상세 창은 선택창 위에 겹쳐 뜨고, Esc·닫기를 누르면 상세 창만 닫혀 선택창과 초점이 그대로 남습니다.
  - `openCardInfo(id)`: `rtConfirm`과 같은 방식으로 대화상자를 직접 만들어 띄웁니다. 화면을 다시 그리지 않으므로 구성 상태·실행 취소 기록·LocalStorage에 영향이 없습니다. 표에는 구분·신호·채널(catalog.js)과 카탈로그 사양, 연동 전송기(`RtCore.choices`)를 함께 보여 줍니다.
- `src/styles.css`: `.rt-card-info-*`, `.rt-summary-card` 스타일을 파일 끝에 추가했습니다(휴대폰 720px 이하 한 열 배치).

## 데이터 근거

| 제품군 | 카드 | 근거 |
|---|---|---|
| XDM | HIS100·HI100·DPI100 / FIS100·SIS100·CIS100 / HOS100·DPOS100·COS100 / FOS100·SOS100·WOS100 | 카탈로그 46쪽판 6·7·8·9쪽 |
| SPX | HIS8·HOS10·HOS12·COS12 | 16쪽 |
| VDM | HIS4-U·CIS4-U·FIS4-U·SIS4-U / COS4-U·FOS4-U·SOS4·HOS4S-UW·QOS4S-U | 19·20쪽 |
| VDM | HOS4-U | VDM 국문 매뉴얼 KV07 30쪽(2.4 Output Boards Specifications) — 2026-09-28 사용자 제공 사양서 캡처(`input_doc/RTCOM/sheet/RTcom_ProductSheet_VDM-HOS4-U_KV07-p30.png`)와 매뉴얼 원본 대조 |
| VDM | CIS4-U·COS4-U·QOS4S-U (보완) | 카탈로그 값에 KV07 22·34·43쪽 값(지원 케이블, 최대 전송거리, HDCP, 규격, 무게)을 더함. 카드 정보 창 아래 출처 줄에 카탈로그 쪽과 매뉴얼 쪽을 함께 표시 |

## 자료 요청 (사용자·제조사 확인 필요)

1. ~~VDM HOS4-U 사양서~~ → 2026-09-28 받음(KV07 30쪽). 반영 완료.
2. ~~VDM 카드 매뉴얼~~ → 2026-09-28 받음(KV07). CIS4-U·COS4-U·QOS4S-U 반영 완료. **남은 확인**: HOS4S-UW 최대 해상도가 카탈로그 20쪽(3840×2160@30Hz)과 매뉴얼 44쪽(1920×1080@60Hz, 표 제목은 VDM-HOS4SW)이 달라 카탈로그 값을 유지하고 사용자 확인을 기다립니다. 매뉴얼 44쪽의 HOS4S-UW 커넥터는 HDMI 4포트와 USB 2포트이며 오디오 단자는 적혀 있지 않습니다.
3. **SPX 카드 커넥터 정보**: HIS8 오디오 출력 단자 형태(피닉스 핀 수), COS12의 권장 케이블·최대 전송거리(SPX-RX 매뉴얼 Ver.2.0 기준 값과 같은지).
4. **XDM 카드 전원·소비전력, 카드 무게**(선택): 랙 전원 설계에 쓰려면 카드별 소비전력이 필요합니다.
5. **카드 단품 고해상도 사진**(선택): 현재 판넬 사진은 구성기용 저해상도 이미지입니다.

## 검증

- `node --test tests/*.test.cjs`: 40개 통과(카드 사양 검사 1개 추가).
- `node scripts/build-product-index.cjs --check`, `node scripts/package-site.cjs`, `node scripts/e2e-smoke.cjs`(141/141), `git diff --check` 통과.
- 카드 선택창 상세 보기: 데스크톱 XDM-12(XDM-COS100), 휴대폰 VDM-16X(HOS4-U)에서 상세 창 열기 → Esc로 상세 창만 닫힘 → 선택창에서 장착 정상 동작을 확인했습니다.
- 데스크톱 1400px·휴대폰 390px에서 SPX-M810 구성으로 카드 정보 버튼·내 구성 카드 행 → 대화상자 열기·Esc 닫기를 확인했습니다(페이지 오류 없음).

## 되돌리는 방법

- 이 커밋을 `git revert` 하면 됩니다. 저장 형식(`rtcom.configuration.v1`, JSON schema 3, `catalogVersion`)은 바꾸지 않았습니다.
