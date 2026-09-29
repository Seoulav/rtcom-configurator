# 01 제품군 "프레임 선택" 버튼과 → 화살표 (0.127.0)

## 요청 (2026-09-28)

- "이것도 버튼 위로 배치하고 오른쪽 화살표도 보이게" (빨간 표시가 있는 화면 캡처 첨부)
- 캡처 해석: 01 제품군 화면에서 오른쪽 미리보기 아래쪽이 비어 있고, "프레임 선택" 버튼은 맨 아래 바에 멀리 떨어져 있습니다. 02 프레임 선택에서 0.114에 미리보기 안으로 "다음" 버튼을 옮긴 것과 같은 요청("이것도")으로 보고, 캡처에서 원으로 표시한 버튼의 → 화살표가 안 보이는 점도 함께 고쳤습니다.

## 구현

- `src/app.js` `familyView()`: 미리보기 태그 줄(`.rt-cg-chips`) 바로 아래에 `button.rt-primary.rt-cg-preview-next[data-action="preview-next"]`("프레임 선택 →")를 추가했습니다. 02와 같은 동작 이름 `preview-next`를 쓰므로 클릭 처리기는 바꾸지 않았습니다. 아래 바의 `data-action="next"` 버튼은 그대로라서 기존 자동 점검(`page.click('[data-action="next"]')`)에 영향이 없습니다.
- `src/styles.css`(파일 끝): 원인은 `.rt-arrow{color:var(--rt-accent)}`였습니다. 강조색(파랑 #3978ee)이 파란 그라데이션 버튼 배경과 같아 화살표가 보이지 않았습니다. `.rt-button.rt-primary .rt-arrow{color:currentColor;font-size:20px;font-weight:700}`로 버튼 글자색(흰색)을 쓰게 했습니다. 미리보기 안 버튼은 글자·화살표를 가운데 정렬합니다.
- 휴대폰(820px 이하)은 미리보기가 목록 위로 올라오므로 버튼도 위쪽(사진·태그 아래)에 보입니다.

## 검증

- `node --test tests/*.test.cjs` 50/50, `build-product-index --check`, `package-site`, `e2e-smoke` 170/170, `git diff --check`.
- e2e: 01 미리보기 버튼이 태그 줄 아래에 있고, 두 버튼의 → 색이 `rgb(255, 255, 255)`이며, 미리보기 버튼이 02 프레임 선택으로 이동하는지 확인합니다.
- 화면 캡처: `docs/qa/family-preview-next-screens/`(데스크톱 1100px, 휴대폰 390px).

## 되돌리는 방법

- 이 변경을 `git revert` 합니다. 데이터·저장 형식(`rtcom.configuration.v1`, JSON schema 3, `catalogVersion`)은 바뀌지 않았습니다.

## 0.128.0 보완: 버튼 중복 제거 (사용자 지적 2026-09-29 "버튼이 중복이다")

- 0.127.0은 미리보기에 버튼을 **추가**하고 아래 바 버튼을 남겨 "프레임 선택"이 화면에 두 개 보였습니다. "버튼 위로 배치"는 옮기라는 뜻이었습니다.
- `src/app.js` `render()`: `next.hidden=state.step===0;`로 01 제품군에서만 아래 바 다음 버튼을 숨깁니다. 02 이후에는 그대로 나옵니다. 아래 바에는 선택 요약(`XDM 제품군 · 카테고리: 매트릭스`)만 남습니다.
- `src/styles.css`: `.rt-button.rt-primary`가 `display:flex`라서 `hidden` 속성만으로는 숨겨지지 않아 `.rt-button[hidden]{display:none!important}`를 더했습니다.
- `scripts/e2e-smoke.cjs`: 01에서 아래 바 다음 버튼을 누르던 11곳을 미리보기 버튼(`.rt-cg-preview [data-action="preview-next"]`)으로 바꾸고, 01에서 보이는 다음 버튼이 정확히 1개인지와 02 아래 바 화살표 색을 검사합니다.
- 02 프레임 선택은 0.114부터 미리보기와 아래 바에 버튼이 함께 있습니다. 이번에는 요청 범위(01)만 바꾸었고, 같은 방식으로 정리할지는 사용자 결정 사항입니다.
