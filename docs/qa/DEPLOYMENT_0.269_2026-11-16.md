# 0.269.0 배포 기록 (2026-11-16)

- PR: #432 "0.269.0 AV System Builder 연동 삭제"
- 병합: squash, main `9b9c8d0` (`expectedHeadSha` 9c79760 고정, GitHub `RTCOM checks / verify` success)
  - 병합 직전 main은 `f857216` 그대로였고 최신 커밋 `9c79760`의 검사 성공만 병합 근거로 썼습니다.
  - 열린 PR에 다른 세션의 #431(Signal Flow가 있는 모든 제품에 크게 보기, 초안)이 같은 번호 0.269.0을 쓰고 있었습니다. 변경 파일이 크게 겹치지 않고 이 PR이 먼저 검증을 마쳐 먼저 병합했습니다. #431은 병합 전에 main을 합치고 번호를 0.270.0으로 옮겨야 합니다(그 세션의 몫).
  - 직전 배포: #430(0.268.0 배포 기록, 문서만) 병합 뒤 재배포 run 43854942525 success.
- 경위: 사용자가 "AV System Builder연동도 전부 삭제해줘"(2026-11-16)라고 요청했습니다. 0.268(AV Portal 언급 제거)에서 남겨 둔 AV 빌더 연동(0.173 파일 내려받기, 0.174 새 탭으로 바로 열기)을 지웠습니다. 상세는 `docs/implementation/REMOVE_AV_BUILDER_0.269.md`입니다.
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 43856236034, success

## 공개 주소 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 표기 | `CATALOG BASED · 0.269` |
| 공개 `index.html`·`src/app.js`·`src/core.js`·`src/styles.css`·`src/products.js`·`src/control-example.js` | main 파일과 SHA-256 앞 16자리 모두 일치 |
| 공개 주소에서 직접 내려받은 텍스트 파일 54개에서 AV 빌더(`av-builder`·`AV 빌더`·`av-system-builder`·`seoul-visual-tech`·`rt-avb`)·`portal`·`포탈`·`포털` 검색 | 언급이 있는 파일 0개 |
| 공개 `CLAUDE.md` | 404 |
| 공개 `docs/` | 404 |

## 로컬 검증 메모

- 단위 테스트 210개(새 시험 2개 추가, 삭제 1개), `build-product-index --check` 33개, 표기 통일 바뀔 곳 0건, `dark_tokens --check` 최신(CSS를 지운 뒤 도구로 다시 생성), `check-version` 0.268 → 0.269, `git diff --check`를 통과했고 화면 시험(`e2e-smoke`)은 294/294 통과했습니다. 새 화면 시험 2개(03 ② 신호 입력·06 내보내기 화면에 AV 빌더 안내 상자·버튼·문구 없음)가 포함됩니다.
- 공개 사이트를 브라우저로 직접 열어 보는 시험은 이 환경의 프록시 인증서 때문에 하지 못해, 공개 주소에서 파일을 내려받아 해시와 검색으로 확인했습니다. 화면은 같은 코드의 배포본(`dist/`)을 로컬에서 열어 화면 시험으로 확인했습니다.

## 남은 확인 사항

- 공개 제품 데이터의 슬롯 정보(0.208에서 AV Portal·AV System Builder 요청으로 더한 `slots`·`slotType`·`compatibleFrames`·`io`)는 두 도구 이름이 없고 구성기도 같은 값을 써서 그대로 두었습니다. "연동"에 데이터 제공이 포함되는지 사용자 확인이 필요합니다.
- 저장소 내부 문서(`docs/`, `CLAUDE.md`, `CHANGELOG.md`, `scripts/` 주석)의 AV Portal·AV 빌더 언급은 공개 사이트에 올라가지 않아 범위에서 제외했습니다. GitHub 저장소가 경쟁업체에 공개 상태인지 사용자 확인이 필요합니다.
- AV Builder 저장소(`seoul-visual-tech/av-system-builder`) 쪽에 넣었을 수 있는 받기 코드는 이 저장소에서 알 수 없어 건드리지 않았습니다.
