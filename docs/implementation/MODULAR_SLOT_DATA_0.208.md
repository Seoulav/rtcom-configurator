# 0.208 모듈형 장비 슬롯·카드 데이터 (AV Portal·AV System Builder 요청)

## 요청

- AV Portal / AV System Builder 담당의 요청서(2026-10-13)를 사용자가 전달했습니다. 원문은 `docs/handoff/AV_PORTAL_MODULAR_SLOTS_REQUEST_2026-10-13.md`입니다.
- 목적: AV System Builder에서 XDM·SPX·VDM 프레임에 슬롯 번호별로 카드를 장착하고, 장착한 카드의 단자로 결선하는 것입니다.
- 요청 내용: 공개 시리즈 JSON에 다음 필드를 추가하는 것입니다.
  - 메인프레임 `slots`
  - 카드 `slotType`·`compatibleFrames`·`io`
  - SPX-R6 `slots`

## 변경

- **데이터:** `data/products/xdm.json`·`spx.json`·`vdm.json`·`spx-r6.json`에 새 키만 더했습니다.
  - 각 파일 `sources[]`에 매뉴얼 출처 코드를 추가했습니다(`M`·`M2`·`U3`).
  - 기존 키·값·순서가 원본과 같은지 기계로 대조했습니다(새 키를 걷어 내면 원본 JSON과 같음).
  - 화면(제품정보·구성기)은 새 키를 읽지 않아 바뀌지 않습니다. `index.json`도 그대로입니다.
- **검증:** `scripts/build-product-index.cjs`에 새 필드 형식 검사를 더했습니다.
- **테스트:** `tests/modular-slots.test.cjs`(5개)를 추가했습니다.
- **인계 문서:** `docs/handoff/AV_PORTAL_MODULAR_SLOTS.md`에 다음을 정리했습니다.
  - 값 표와 근거 쪽
  - 확인하지 못한 항목
  - 요청서 예시와 다른 점(SPX-HOS10 호환 프레임)
  - AV Portal 담당에게 남기는 형식 메모

## 근거

| 자료 | 쓴 곳 |
|---|---|
| XDM 국문 매뉴얼 KV08(`xdm-manual.pdf`) 7–17쪽 | 프레임 6종 보드 수, 카드 11종 단자 |
| 알티컴 종합 카탈로그 2026 9쪽 | XDM-WOS100 단자(매뉴얼에 없음) |
| SPX 국문 매뉴얼(250805, `spx-manual.pdf`) 3–4·7–12쪽 | 프레임 5종 보드 수, 프레임별 장착 가능 카드, 카드 4종 단자, CAT 슬롯 PoC |
| VDM 국문 매뉴얼 KV07(`vdm-manual.pdf`) 4·11–44쪽 | 프레임 9종 보드 수, 카드 9종 단자 |
| 카탈로그 19·20쪽 사양·사진, 저장소 카드 판넬 사진 | VDM SIS4-U 커넥터, VDM 4K 카드 오디오 잭 수(포트마다 ▲·▼ 2개), SOS4 오디오 단자 없음 |
| SPX-R6 제품 사양서, 사용자 확인 2026-09-29 | SPX-R6 모듈 칸 6개, TX·RX 선택 |
| 사용자 확인 2026-09-28("COS PHNIX픽에 전원연결") | XDM-COS100 PoE 전원 입력 행 |

## 미확인 항목

`docs/handoff/AV_PORTAL_MODULAR_SLOTS.md` §4에 있으며, `docs/handoff/OPEN_ITEMS.md`에도 옮겼습니다.
- XDM-COS100: 전원을 받는 포트
- XDM-WOS100: 오디오 단자
- SPX-HIS8: 오디오 커넥터 형태
- VDM SIS4-U: 이름(매뉴얼에는 VDM-SIS4만 있음)
- VDM SOS4: 오디오 단자 유무
- VDM HOS4S-UW: USB 용도
- XDM-288·VDM-288X: 슬롯 수

## 검증

- `node --test tests/*.test.cjs`: 97 pass(새 테스트 5개 포함)
- `node scripts/build-product-index.cjs --check`: 제품 32개 통과
- `node scripts/package-site.cjs`: 통과. `dist/data/products/xdm.json`에 `slots`가 들어 있음
- `node scripts/e2e-smoke.cjs`: 236/236(화면 변화 없음)
- `node scripts/tools/unify_notation.cjs`: 바뀔 곳 0건

## 되돌리기

이 PR의 squash 커밋을 revert하면 됩니다. 새 키만 더했으므로 되돌려도 기존 화면·AV Portal 상세에는 영향이 없습니다. AV Portal Builder가 이 필드를 읽기 시작한 뒤라면, 되돌리기 전에 AV Portal 담당에게 알립니다.
