# 0.213 사용자 결정 4건: 288 카드 호환·PSE 안내서 버튼·PDF 전달·매뉴얼 요청

## 요청

사용자 요청(2026-10-13): "질문창보여줘 결정해줄레"

남아 있던 결정 4건을 질문 창으로 물었고, 답은 아래와 같습니다. 4번 답은 음성 입력으로 문장이 끊겨 있어서, 이해한 내용을 다시 물어 확인했습니다.

| 번호 | 질문 | 답 |
|---|---|---|
| 1 | XDM-288·VDM-288X에도 기존 4포트 카드를 그대로 꽂는지 | "VDM카드 VDM에 XDM은 XDM에" |
| 2 | XDM-CTR100 PSE 제품 안내서 PDF 버튼 위치 | PSE 상세에만 |
| 3 | PDF 원본 전달 방법 | GitHub에 직접 업로드 |
| 4 | 매뉴얼이 없는 제품의 공개용 매뉴얼을 알티컴에 요청할지 | "mr4s, xsm-psu 단순 파워서플라이라서 …나중에 필요하면…". 다시 물은 답은 "나머지 전송기·분배기만 요청" |

## 반영

### 1. 288 프레임 카드 호환(공개 데이터)

0.212는 XDM 카드 12종의 `compatibleFrames`에 XDM-288을, VDM 카드 10종에 VDM-288X를 넣었습니다. 이 값은 "같은 4포트 카드를 쓴다"는 추정이었습니다. 사용자 답이 이 값과 같으므로 값은 바꾸지 않고 근거만 남겼습니다.

- **출처 설명:** `xdm.json` `U7`, `vdm.json` `U2`의 `scope`에 사용자 확인 문구를 더했습니다.
- **테스트:** `tests/modular-slots.test.cjs`에 "XDM 카드는 XDM-288에만, VDM 카드는 VDM-288X에만" 검사를 더했습니다. 나중에 호환 목록이 바뀌어 다른 시리즈 288 프레임이 들어가면 실패합니다.
- **AV Portal 안내:** `docs/handoff/AV_PORTAL_MODULAR_SLOTS.md` §2 "호환 프레임"에 확인 사실을 적었습니다.

### 2. PSE 제품 안내서 버튼 위치

`xdm-ctr100-pse-sheet.pdf`는 XDM-CTR100 PSE 상세에만 둡니다. XDM-CTR100 상세에는 두지 않습니다. 파일을 받으면 이대로 등록합니다(`docs/handoff/OPEN_ITEMS.md`).

### 3. PDF 전달 방법

사용자가 GitHub 웹에서 `output/design/assets/docs/`에 직접 올립니다.

- **작업 브랜치에 올리는 경우:** Claude가 문서 속성의 작성자 정보를 지운 뒤 squash 병합합니다. 그래서 `main` 기록에는 정리된 파일만 남습니다.
- **`main`에 바로 올리는 경우:** 원본의 작성자 정보가 `main` 기록에 남습니다. 질문 창에서 이 점을 알리고 사용자가 선택했습니다.
- **받은 뒤 할 일:** 작성자 정보 지우기 → 본문의 고객·현장 이름 확인 → 공개 파일 이름으로 바꾸기 → `documents[].file`·`preview:'pdfjs'` 등록 → `output/design/assets/docs/README.md` 목록 갱신.

### 4. 매뉴얼 요청

`docs/RTCOM_MANUFACTURER_DATA_REQUEST.md` §5에 "매뉴얼 요청" 표를 더했습니다.

- **요청:** CT101-U/CR101-U, CT104-U/CR104-U, FT101-U/FR101-U, HD-D102U 사용자 매뉴얼 4건
- **지금은 요청하지 않음:** MR-4S·XDM-PSU(단순 파워서플라이, 나중에 필요하면 요청), 케이블 4종 사양서
- **SPX-R6:** 크기·무게·어댑터는 기존 7번 질문으로 묻습니다.

## 화면 영향

화면에 보이는 문구는 바뀌지 않습니다. 공개 JSON `xdm.json`·`vdm.json`의 출처 설명(`sources[].scope`) 두 줄만 바뀝니다.

## 검증

| 명령 | 결과 |
|---|---|
| `node --test tests/*.test.cjs` | 98개 통과(288 카드 호환 검사 1개 추가) |
| `node scripts/build-product-index.cjs --check` | 제품 32개 검증 통과 |
| `node scripts/package-site.cjs` | `dist/` 생성 |
| `node scripts/e2e-smoke.cjs` | 238/238 통과 |
| `node scripts/tools/unify_notation.cjs` | 바뀔 곳 0건 |
| `node scripts/check-version.cjs --against origin/main` | 0.213(main 0.212 + 1) |
| `git diff --check` | 문제 없음 |

## 되돌리기

이 PR의 병합 커밋을 `git revert`하면 0.212로 돌아갑니다. 공개 데이터 값은 0.212와 같고 출처 설명만 달라집니다.
