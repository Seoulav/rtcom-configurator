# 0.164.0 터치 화면 카드 빼기 × · GitHub 자동 검사(RTCOM checks)

사용자 결정·요청 2026-09-29:
- "터치 화면에서는 × 버튼을 항상 보이게"
- "GitHub 필수 검사 설정 검토: 병합 전에 테스트와 버전 점검이 자동으로 돌도록 설정하면 규칙을 놓쳐도 잘못된 병합을 막을 수 있습니다."

## 1. 터치 화면 카드 빼기 ×

- 0.147부터 구성기 03 카드 슬롯의 × 는 `@media(hover:hover)`에서 마우스를 올렸을 때만 보였습니다. 태블릿·휴대폰에서는 나타나지 않아, 카드를 빼려면 슬롯을 눌러 팝업을 열고 "슬롯 비우기"를 눌러야 했습니다.
- `src/styles.css`에 `@media(hover:none),(pointer:coarse)` 규칙을 더했습니다. 카드가 꽂힌 슬롯(블랭크 커버 포함)은 × 를 늘 보여 주고, 최소 크기를 20px로 키웠습니다(가로 슬롯은 오른쪽 가운데, 세로 슬롯은 맨 위 가운데, 0.145 배치 그대로). 빈 슬롯에는 × 가 없습니다.
- 누르는 동작은 0.147과 같습니다(`src/app.js`의 capture 클릭 처리 → `removeSlotCard`, 실행 취소 가능, 팝업 열리지 않음).
- 마우스와 터치를 함께 쓰는 노트북은 브라우저가 알려 주는 주 입력 장치에 따라 정해집니다. 대부분 마우스 방식(올렸을 때만 표시)입니다.
- e2e: `isMobile·hasTouch` 브라우저(820×1180)에서 × 가 늘 보이고 20px 이상이며 빈 슬롯에는 없고, 누르면 카드가 빠지고 팝업이 열리지 않는지 확인합니다. 기존 마우스 검사(올렸을 때만 표시)도 그대로 통과합니다.
- 화면: `docs/qa/touch-slot-x/tablet-xdm12.png`(가로 슬롯), `tablet-xdm72.png`(세로 슬롯), `phone-xdm12.png`(휴대폰 390px)

## 2. GitHub 자동 검사 `.github/workflows/checks.yml`

PR을 main으로 올리면 GitHub 서버가 아래를 차례로 실행합니다. 워크플로 이름은 `RTCOM checks`, 작업 이름은 `verify`입니다.

1. 단위 테스트 `node --test tests/*.test.cjs`
2. 제품 데이터 검사 `node scripts/build-product-index.cjs --check`
3. 공개 사이트 빌드 `node scripts/package-site.cjs`
4. 버전 점검 `node scripts/check-version.cjs --against origin/main`
5. 공백 오류 검사 `git diff --check origin/main HEAD`
6. 브라우저 설치 후 화면 자동 검사 `node scripts/e2e-smoke.cjs`

PR 검사는 "PR을 main에 합친 결과"를 대상으로 합니다. 다른 세션이 먼저 병합해 번호가 겹치면 4번이 실패하고, 합칠 때 충돌이 나면 검사가 시작되지 않습니다.

### 필수 검사로 켜는 순서 (사용자 작업)

지금은 검사가 돌기만 하고 병합을 막지는 않습니다. 아래 설정을 켜면 검사를 통과하지 못한 PR은 병합 버튼이 막힙니다. GitHub 화면 이름은 시기에 따라 조금 다를 수 있습니다.

1. 브라우저에서 https://github.com/Seoulav/rtcom-configurator 에 들어갑니다.
2. 위쪽 메뉴에서 **Settings**(톱니바퀴)를 누릅니다. 저장소 관리자 권한이 있어야 보입니다.
3. 왼쪽 메뉴의 **Code and automation** 아래에서 **Rules** → **Rulesets**를 누릅니다.
4. **New ruleset** → **New branch ruleset**을 누릅니다.
5. **Ruleset Name**에 `main 보호`처럼 알아보기 쉬운 이름을 적고, **Enforcement status**를 **Active**로 바꿉니다.
6. **Target branches**에서 **Add target** → **Include default branch**를 누릅니다(`main`).
7. **Branch rules**에서 **Require status checks to pass**에 체크합니다.
   - 나타나는 **Add checks** 칸에 `verify`를 입력하고, 목록에 뜨는 **verify (GitHub Actions)**를 고릅니다. 목록에 없으면 이 PR의 검사가 한 번 끝난 뒤 다시 시도합니다.
   - **Require branches to be up to date before merging**도 체크하면, main이 바뀐 PR은 main을 다시 합쳐야 병합됩니다. 버전 번호 겹침을 막는 데 도움이 됩니다.
8. **Bypass list**(예외 목록)는 비워 둡니다. 관리자를 넣으면 관리자 계정으로 하는 병합(Claude의 병합 포함)은 검사를 건너뛸 수 있습니다.
9. 맨 아래 **Create**를 누릅니다.

되돌리기: 같은 화면에서 만든 ruleset을 열어 **Enforcement status**를 **Disabled**로 바꾸거나 삭제합니다.

### 켠 뒤 달라지는 점

- Claude가 PR을 올리면 검사(약 수 분)가 끝날 때까지 병합을 기다립니다. 실패하면 원인을 고쳐 다시 올립니다.
- 사람이 GitHub에서 직접 파일을 올리는 경우(예: 매뉴얼 PDF)에도 PR을 거치면 같은 검사가 돕니다. main에 바로 올리는 방식은 ruleset이 막을 수 있으므로, 그때는 PR을 만들어 올립니다.

## 검증

단위 테스트, `build-product-index --check`, `package-site`, e2e(터치 검사 1건 추가), `check-version.cjs --against origin/main`, `git diff --check`. 이 PR 자체가 `RTCOM checks`의 첫 실행이며, 결과는 PR에서 확인합니다.

## 되돌리기

병합 커밋을 되돌리면 터치 규칙과 워크플로가 함께 빠집니다. 필수 검사 설정을 켰다면 먼저 위 "되돌리기"로 ruleset을 끕니다(끄지 않으면 사라진 검사를 계속 기다립니다).
