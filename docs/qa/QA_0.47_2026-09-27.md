# 0.47.0 QA 기록 (2026-09-27)

사용자 요청 "모든 작업결과 병합해서 올려줘"를 처리하면서, 작업 중에 받은 요청 세 가지를 함께 반영했습니다.

| 순서 | 사용자 요청 | 반영 |
|---|---|---|
| 1 | 옛 PR #22에만 있던 결정을 함께 올리기 | XDM-CTR100과 XDM-CTR100 PSE 분리, QMS-88UX 쿼드 뷰 사용법, 모델명 줄바꿈 방지 |
| 2 | "입력된 hdmi mux/demux 선택해서 되는거야", HD-13U 매뉴얼·제품 안내서 제공, "좀더 쉽게 이해하기 쉽게 표현해주면 좋겠어" | HD-13U 오디오 병합·추출을 "하나를 골라 쓴다"로 정정하고, 07 오디오 설정 카드 추가 |
| 3 | "hdmi 입력 1번 2번은 출력 3번은 오디오 전원은 마지막 이런순으로 모든 제품을 동일하게" | 단자 지도 번호 규칙을 모든 제품에 적용하고 validator로 고정 |

## 1. PR #22 결정 옮기기

PR #22(`claude/rtcom-configurator-dev-3q2npl`)는 0.28 기준 브랜치라 그대로 병합할 수 없습니다. main에 없는 사용자 결정만 현재 main 기준으로 다시 넣었습니다.

- **XDM-CTR100 / XDM-CTR100 PSE 분리**(사용자 요청 "ctr100과 ctr100 pse는 별도 모델이라 나누어줘")
  - `xdm-ctr100`: 모델명 XDM-CTR100. PSE 전용 크기·무게·전원·KC 행, PSE 기능 문구, PSE 사진을 뺐습니다.
  - `xdm-ctr100-pse`(새 제품): 제품 안내서 사진 2장, 단자 지도 7개, PSE 크기·전원·KC, 신호 흐름에 PSE 조합 한 줄
  - PSE 무게는 사용자가 **제조사 제품 안내서 값 0.34kg**을 골랐습니다. 이전 실사용 확인값 0.28kg은 조건 칸에 참고로 남겼습니다.
  - 제품 수가 27종에서 28종, 전송기 분류가 11종에서 12종이 되어 단위 테스트·e2e 기대값을 바꿨습니다.
  - AV Portal 연동 문서(`docs/handoff/AV_PORTAL_RTCOM_PRODUCT_DATA.md`)에 `model` 키 변경을 적었습니다.
- **QMS-88UX 쿼드 뷰**(사용자 확인): 출력 9번에 입력 8개를 8분할로 보내거나, 출력 9번에 입력 1~4번·출력 10번에 입력 5~8번을 4분할로 보냅니다.
- **모델명 줄바꿈 방지**: 긴 모델명이 하이픈 뒤에서 끊기지 않고 " / " 앞뒤에서만 줄이 바뀝니다(상세 제목, 목록 카드, 관련 제품 링크).

## 2. HD-13U 오디오 병합·추출

### 근거

- 사용자 확인: "입력된 hdmi mux/demux 선택해서 되는거야"(출처 U)
- 사용자 제공 매뉴얼 Ver.1.2 7쪽(출처 M1): 로터리 스위치 '0' + SET 버튼으로 Stereo Audio/HDMI Audio 선택, Stereo Audio는 Output 1번으로 믹스, 선택 시 Output 1번 LED 깜빡임, Stereo 입력 오디오는 Stereo 출력으로 나오지 않음
- 사용자 제공 제품 안내서 1·2쪽(출처 S1, 새로 추가): 입력 단자 HDMI 1 + 3.5mm 오디오 입력, 출력 단자 HDMI 3 + 3.5mm 오디오 출력, "병합된 오디오는 출력 1번에 연결된 모니터에서 출력", KC 인증
- 두 PDF는 `.source-materials/`(Git 제외, 배포 제외)에 보관했습니다.

### 판단

매뉴얼 7쪽은 추출을 선택 항목과 따로 적어, 0.40에서는 "병합과 추출을 동시에 쓸 수 있다"고 읽었습니다. 사용자 확인에 따라 **병합(MUX, Stereo Audio)과 추출(DEMUX, HDMI Audio) 중 하나를 골라 쓰는 방식**으로 바로잡았습니다. 추출 모드의 LED 상태("깜빡이지 않는다")는 매뉴얼의 병합 모드 설명을 뒤집어 적은 것입니다.

### 화면 변경

- 새 선택 필드 `audioMux`(`mode: "select"`, `howTo`, `modes[2]`, `note`)를 만들고 validator에 규칙을 넣었습니다.
- "07 오디오 설정" 카드: 매뉴얼 문장을 병합·추출 두 칸으로 나누고, 칸마다 "이럴 때·연결·소리가 나오는 곳·확인 방법"으로 풀었습니다. 휴대폰에서는 두 칸이 위아래로 쌓입니다.
- "02 신호 흐름" 문구: "오디오 병합 · 오디오 추출" → "오디오 병합(OUT 1) 또는 추출 중 선택"
- "05 주요 기능": 긴 설명 한 줄을 선택 방식 한 줄과 요약 한 줄로 줄이고, 자세한 표는 07 카드로 안내합니다.
- 입출력 표·단자 지도 설명에 "MUX 선택 시 OUT 1번", "DEMUX 선택 시"를 붙였습니다. 사양 표에 KC 인증을 추가했습니다.
- HDS-21U·HDS-42MU도 오디오 병합·추출이 있지만, 이번 확인은 HD-13U 기준이라 바꾸지 않았습니다.

## 3. 단자 지도 번호 규칙

모든 제품의 단자 지도를 같은 순서로 번호 매겼습니다.

1. HDMI 입력
2. HDMI 출력
3. 오디오(입력 → 출력)
4. 전송(HDBaseT·CATx·광·모듈 슬롯)
5. 제어(RS-232·LAN·USB·FIRMWARE)
6. 표시·조작(LED·버튼·스위치)
7. 전원(DC·AC·전원 스위치), 항상 마지막

같은 종류가 여럿이면 한 번호로 묶습니다. HDS-21U의 IN 1·IN 2를 HD-210U처럼 "IN 1·2" 한 번호로 합쳤습니다. 송신기·수신기를 한 사진에 담은 OBHD-2C는 기기마다 이 순서를 따릅니다.

| 제품 | 이전 | 이후 |
|---|---|---|
| HD-13U | HDMI IN · AUDIO IN · HDMI OUT · AUDIO OUT · DC | HDMI IN · HDMI OUT · AUDIO IN · AUDIO OUT · DC |
| HD-210U | HDMI IN · AUDIO IN · HDMI OUT · DC | HDMI IN · HDMI OUT · AUDIO IN · DC |
| HD-D102U | … DC · STD/TV 스위치 | … STD/TV 스위치 · DC |
| HDS-21U | IN 1 · IN 2 · OUT · … (7개) | IN 1·2 · OUT · … (6개) |
| CT101-U/CR101-U, FT101-U/FR101-U | DC가 1번 | HDMI · AUDIO · CATx/광 · RS-232 · FIRMWARE · DC · 전원 스위치 |
| CT104-U/CR104-U | DC가 1번 | HDMI · CATx · RS-232 · DC |
| OBUX-1C | +12V가 1번 | HDMI · Audio · Fiber · +12V |
| OBHD-2C | 기기마다 DC가 먼저 | 기기마다 HDMI · OPTICAL · DC |
| MR-4S | DC · 모듈 슬롯 | 모듈 슬롯 · DC |
| CT103-U-H/CR103-U, FT103-U-H/FR103-U | LED가 2번 | HDMI · AUDIO · RS-232 · LED · 조작부 |
| XDM-CT103/CR103 | LED가 3번, DC가 딥 스위치 앞 | HDMI · AUDIO · HDBaseT · LED · (딥 스위치) · DC |
| XDM-CTR100, XDM-CTR100 PSE | HDBaseT가 1번 | HDMI IN · HDMI OUT · AUDIO·RS-232 · HDBaseT · DIP · LED · DC |

HD-104U, HD-108U, HDS-42MU, QMS-44UX, QMS-88UX, XDM-FT101/FR101은 이미 이 순서였습니다.

**0.46 규칙과의 관계**: 0.46에서는 송신기에만 있는 조작부를 맨 뒤로 보내 송신기·수신기의 공통 번호를 맞췄습니다. 이번 요청으로 전원이 맨 뒤가 되어, XDM-CT103(6번)과 XDM-CR103(5번)처럼 송신기에 조작부가 더 있는 짝은 전원 번호가 한 칸 다릅니다. 1번 HDMI부터 공통 단자의 순서는 같습니다.

**고정 장치**: validator가 번호가 1부터 빈칸 없이 이어지는지, 전원 단자가 맨 뒤인지 검사합니다. 일부러 HD-104U 번호를 바꿔 두 규칙이 모두 실패를 내는 것을 확인하고 되돌렸습니다. 설명 카드는 번호 순으로 정렬해 그립니다.

## 4. 검증

- `node --test tests/*.test.cjs`: 37/37
- `node scripts/build-product-index.cjs --check`: 28개 통과
- `node scripts/package-site.cjs`: 통과
- `node scripts/e2e-smoke.cjs`: 85/85(HD-13U 오디오 설정 카드·신호 흐름 문구·번호 순서 검사 추가)
- `git diff --check`: 통과
- 1280px·390px 캡처: HD-13U 07 카드·02 신호 흐름, HD-13U·HDS-21U·XDM-CTR100 단자 지도 번호표 위치, 페이지 가로 넘침 없음

## 5. 되돌리는 방법

- 번호 규칙만 되돌리려면 `data/products/*.json`의 `portMap` 번호와 `scripts/build-product-index.cjs`의 번호 규칙 블록을 되돌립니다. 화면 코드는 번호 순으로 정렬만 하므로 그대로 두어도 됩니다.
- 오디오 설정 카드를 빼려면 `hd-13u.json`의 `audioMux`를 지웁니다. 카드와 "선택" 문구가 함께 사라집니다.
- CTR100/PSE 분리를 되돌리려면 이 커밋을 revert합니다. `xdm-ctr100-pse` 제품과 사진 2장이 빠지고 27종으로 돌아갑니다.
