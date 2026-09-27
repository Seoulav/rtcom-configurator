# XDM-288 삭제 및 VDM 출력 카드 문구 QA (0.29.0)

- 일시: 2026-09-27 · 환경: 로컬 build(`dist/`), 전역 Playwright(`NODE_PATH=/opt/node22/lib/node_modules`), Chromium(`executablePath: /opt/pw-browsers/chromium`), 1280×1000

| 항목 | 결과 |
|---|---|
| `node --test tests/*.test.cjs` | 29/29 통과 (섀시 합계 21로 갱신, XDM-288 legacy 복원 테스트 2건 포함) |
| `node scripts/build-product-index.cjs --check` | 27개 통과 |
| `node scripts/package-site.cjs` | 정상 빌드 |
| `node scripts/e2e-smoke.cjs`(전역 playwright) | 53/53 통과("XDM 프레임 카드 6종 표시"로 갱신) |
| `git diff --check` | 통과 |
| 콘솔 JS 오류 | 0건 |

## 화면 확인

1. **섀시 선택 화면**: XDM 카드가 XDM-12·20·36·72·144·216 6개만 보이고 XDM-288은 없음(Playwright로 `.rt-chassis-card` 텍스트 6개 확인).
2. **VDM 카드 슬롯 화면**: VDM-16X 출력 슬롯 1 카드 선택 모달에서
   - `HOS4-U` 카드 설명이 "HDMI · 일반 스위칭 · 4채널"로 표시됨.
   - `HOS4S-UW` 카드 설명이 "HDMI · 심리스 스위칭 / 스케일링 / 월 · 4채널"로 표시됨.
   (스크린샷으로 직접 확인)
3. **XDM-288 저장 구성 복원**: `RtCore.document()`로 정상 구성을 만든 뒤 `state.model`을 `'XDM-288'`로, `placements`·`links`를 예전 방식(논리 슬롯 `in-a`)으로 바꿔치기해 예전 저장 파일을 흉내 낸 뒤 `localStorage`에 넣고 새로고침했다.
   - 화면 상단 안내: "XDM-288은 구성기에서 제외되었습니다. 섀시를 다시 선택하세요."
   - 제품군은 XDM으로 유지, 01단계(제품군)에 머물러 섀시를 다시 고를 수 있는 상태로 진입함(오류 화면 없음, 콘솔 오류 없음).
   - JSON 파일 "불러오기"로 같은 문서를 올렸을 때도 같은 안내 문구가 뜨는 것을 코드 경로로 확인(`RtCore.parse()`가 반환하는 `notice`를 `announce()`가 그대로 사용).

## 회귀 확인

- XDM-12 등 기존 모델의 섀시 선택·카드 장착·전송기 연동은 기존 e2e 항목이 그대로 통과해 영향이 없음을 확인했다.
- `tests/core.test.cjs`에 추가한 `'XDM-288 saved configs restore safely as an unselected XDM chassis with a notice'`와 `'a normal restore never carries a notice'` 두 테스트로, XDM-288 예외 처리가 다른 정상 복원 경로에 `notice`를 섞어 넣지 않는다는 것도 함께 검증했다.

## 남은 위험

- `data/products/xdm.json`의 `lineup`에는 여전히 XDM-288 항목(사양 미수록)이 남아 있다 — 이번 작업 범위에서 제외했다(사용자 지시).
- VDM R1~R5(HOS4-U/HOS4S-UW 외 다른 VDM 표기 불일치)는 이번 결정과 무관해 그대로 REVIEW REQUIRED로 남아 있다.
