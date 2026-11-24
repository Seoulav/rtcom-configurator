# 0.271.0 배포 기록 (2026-11-18)

- PR: #438 "0.271.0 HD-108U·HD-104U 제품명 표기 순서 변경"
- 병합: squash, main `3debac7` (`expectedHeadSha` bc0a3ee 고정, GitHub `RTCOM checks / verify` success, e2e 단계 포함)
  - 첫 커밋(`b5ab6df`)의 검사는 N1 안내문을 고친 두 번째 커밋 푸시로 자동 취소되었고(오류 아님), 최신 커밋 `bc0a3ee`의 검사가 통과한 것만 병합 근거로 썼습니다.
  - 병합 직전 main은 `6426b8a` 그대로였고 열린 PR은 다른 세션의 #431(0.269.0 번호 사용, 초안)뿐이었습니다. #431은 병합 전에 main을 합치고 번호를 0.272.0 이상으로 옮겨야 합니다(그 세션의 몫).
- 경위: 사용자가 "HD-108(18U) 병행기입해서 HD-18U(108U) 이런식으로 앞 뒤를 변경해줘"(2026-11-17)라고 요청했고, 같은 사정인 HD-104U도 함께 바꿨습니다. 이어 "다음 단계 1번 할 거 없어 그냥 지금 바꿔"(2026-11-18)로 N1 안내문의 "변경 예정"을 "변경됨"으로 고쳤습니다. 상세는 `docs/implementation/HD_NAME_ORDER_0.271.md`입니다.
- Pages 배포: `Deploy RTCOM to GitHub Pages` main `3debac7` 기준 success

## 공개 주소 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 표기 | `CATALOG BASED · 0.271` |
| 공개 `data/products/hd-108u.json`·`hd-104u.json`·`index.json`·`index.html` | main 파일과 SHA-256 앞 16자리 일치 |
| 공개 제품명 | `HD-18U(108U)`, `HD-14U(104U)` |
| 공개 `CLAUDE.md` | 404 |
| 공개 `docs/implementation/HD_NAME_ORDER_0.271.md`·`docs/handoff/OPEN_ITEMS.md` | 404 |

## 로컬 검증 메모

- 단위 테스트 211개(새 시험 1개), 화면 시험 294/294(제품명 변경 시점), `build-product-index --check` 33개, 표기 통일 바뀔 곳 0건, `check-version` 0.270 → 0.271, 사이트 빌드, `git diff --check` 통과.
- 사이트를 로컬에서 열어 상세 제목·목록 카드 표시, `HD-108U`(모델명)·`HD-18U`(별칭) 검색, 옛 주소 `#products/hd-18u` → `#products/hd-108u` 이동을 확인했습니다(캡처 `docs/qa/hd-name-order-0.271/`).

## 남은 확인 사항

- 비공개 AV Portal이 공개 데이터의 `productName`을 화면에 쓰면 표기가 바뀝니다. 모델명 비교는 `model`을 쓰도록 `docs/handoff/AV_PORTAL_RTCOM_PRODUCT_DATA.md`에 적었습니다.
- 공개 데이터 `slots`·`slotType`·`compatibleFrames`·`io` 필드의 유지·삭제는 사용자 결정 대기입니다(지금은 유지).
