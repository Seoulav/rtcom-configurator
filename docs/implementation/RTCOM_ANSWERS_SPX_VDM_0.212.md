# 0.212 알티컴 질문 6~11번·XDM-288 보드 수: 사용자 답변 반영

## 요청

사용자 요청(2026-10-13): "알티컴 질문할것을 나에게 한 단계 한 단계씩 물어봐줘"

질문표(`docs/RTCOM_MANUFACTURER_DATA_REQUEST.md` §5)의 남은 질문을 하나씩 물었고, 답은 아래와 같습니다. 출처는 "서울영상테크 SI사업본부 확인(사용자 답변)"으로 기록했습니다(`xdm.json` `U7`, `vdm.json` `U2`, `spx.json` `U3`).

| 단계 | 질문 | 답 |
|---|---|---|
| 1/7 | SPX-HIS8 오디오 출력 커넥터 | 3.5mm 스테레오 잭 |
| 2/7 | SPX-R6 크기·무게·어댑터 | 모름(알티컴에 질문) |
| 3/7 | SIS4-U = 매뉴얼 KV07 VDM-SIS4인지 | 같은 카드 |
| 4/7 | SOS4 오디오 단자 | 있음(매뉴얼대로 4포트) |
| 5/7 | HOS4S-UW USB 2포트 용도 | 사용하지 않음(표기 빼기) |
| 6/7 | VDM-288X 판매 여부 | 주문 생산 |
| 7/7 | XDM-288 입출력 보드 수 | "4채널 단위를 의미해 288을 나누어서 보면 되" |
| 추가 1/2 | VDM-288X도 같은 규칙(288 ÷ 4 = 72)인지 | 같은 규칙(72·72) |
| 추가 2/2 | 두 288 모델을 구성기에도 넣을지 | 공개 데이터만 |

## 반영

| 대상 | 공개 JSON | 화면(카드 사양 `src/card-specs.js`) |
|---|---|---|
| SPX-HIS8 | Audio 행 VERIFIED, 출처 U3 | "커넥터: HDMI, 3.5mm 스테레오 잭" 행 추가 |
| SIS4-U | 영상 행 근거에 매뉴얼 KV07 28쪽 VDM-SIS4를 더함. Audio IN 4·OUT 4 행을 매뉴얼 28쪽 값("4 Stereo In/Out ports", 3.5mm stereo jack, Audio In 병합·Out 추출)으로 VERIFIED | "커넥터: BNC, 3.5mm 스테레오 잭" 행 추가 |
| SOS4 | Audio `BIDIR` 4 행 VERIFIED(카탈로그에는 없으나 매뉴얼대로 있음) | "커넥터: BNC, 3.5mm 스테레오 잭" 행 추가 |
| HOS4S-UW | Control USB 행 삭제 | "커넥터"를 "HDMI, USB 2포트"에서 "HDMI"로 |
| XDM-288 | 요약 "288×288 · 주문 생산 모델", `slots` 72·72(출처 U7), XDM 카드 12종 `compatibleFrames`에 추가 | 구성기 변경 없음 |
| VDM-288X | 요약에 "주문 생산 모델" 추가, `slots` 72·72(출처 U2), VDM 카드 10종 `compatibleFrames`에 추가 | 구성기 변경 없음 |

- **결과:** XDM·SPX·VDM·SPX-R6 공개 JSON의 카드 단자에 `REVIEW REQUIRED`가 0건입니다.
- **커넥터 표기:** 매뉴얼 원문 "Female 3.5mm stereo jack"은 0.191 표기 규칙(암수 표기 쓰지 않음)에 따라 "3.5mm stereo jack"으로 적었습니다.
- **288 모델 슬롯 수:** 0.208은 AV Portal 요청서 원칙(채널 ÷ 포트로 계산하지 않음)에 따라 288 모델의 슬롯 수를 넣지 않았습니다. 이번 값은 계산한 값이 아니라 사용자가 확인한 규칙(카드 1장 = 4채널)입니다. 다른 프레임도 모두 같은 규칙입니다(XDM-216 54장, VDM-256X 64장, VDM-180X 45장).
- **구성기:** 두 288 모델은 후면 사진·도면이 없고 사용자 결정("공개 데이터만")에 따라 구성기 프레임 목록에 넣지 않았습니다. 0.29 결정(XDM-288 구성기 제외)과 호환성 계약(구성기 프레임 수)은 그대로입니다.

## 남은 일

- **알티컴 질문 7번:** SPX-R6 크기·무게·전원 어댑터 규격(`docs/handoff/OPEN_ITEMS.md`)
- **결정 대기:** 매뉴얼이 없는 제품의 공개용 매뉴얼을 알티컴에 요청할지는 사용자 결정 대기입니다(2026-10-13 보고 결정 ④).

## 검증

| 명령 | 결과 |
|---|---|
| `node --test tests/*.test.cjs` | 97개 통과. `modular-slots.test.cjs`의 기대값을 바꿨습니다. 288 프레임은 72·72이고 출처는 U 계열이며, 구성기에 없는 프레임은 두 288 모델뿐이고, 미확인 단자는 0건입니다. 검증 스크립트 테스트의 "슬롯 없는 프레임" 예는 XDM-288 슬롯을 0으로 바꿔 확인합니다. |
| `node scripts/build-product-index.cjs --check` | 제품 32개 검증 통과 |
| `node scripts/package-site.cjs` | `dist/` 생성 |
| `node scripts/e2e-smoke.cjs` | 238/238 통과 |
| `node scripts/tools/unify_notation.cjs` | 바뀔 곳 0건 |
| `node scripts/check-version.cjs --against origin/main` | 0.212(main 0.211 + 1) |
| `git diff --check` | 문제 없음 |

## 되돌리기

이 PR의 병합 커밋을 `git revert`하면 0.211로 돌아갑니다.
