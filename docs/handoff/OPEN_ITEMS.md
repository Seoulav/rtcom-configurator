# 남은 할 일·받을 자료 (2026-10-13 기준)

새 세션은 이 목록을 먼저 확인합니다. 처리한 항목은 지우고, CHANGELOG에 버전과 함께 남깁니다.

## XDM 커맨드·입력 감지 — 알티컴 확인 대기 (0.209)

0.209에서 XDM 시리즈 Command Guide(1013판)를 공개하고 알티컴 기술 회신의 제품 사실만 반영했습니다(`docs/implementation/XDM_COMMAND_GUIDE_0.209.md`). AMX 통합 제어 분석에서 가이드로 답할 수 없던 항목을 알티컴에 묻습니다.
- [ ] 입력 신호가 없을 때 `*255?IFI000!`(입력 정보 조회)·`*255?VO000!`(출력 해상도 조회)가 돌려주는 응답 문자열 형식
- [ ] 입력 신호가 들어오거나 끊길 때 XDM이 RS-232·LAN으로 먼저 알림을 보내는 기능이 있는지(가이드에는 조회 커맨드만 있음). 없으면 AMX에서 주기적으로 조회하는 방식으로 안내합니다.
- [ ] 알티컴 회신 메일에 나온 EDID 번호가 가이드 EDID 표에 없는 현장 전용 번호인지, 표준 펌웨어에도 들어 있는지. 표준이면 카드 사양 EDID 행에 더할지 검토합니다(현장 명령 값은 공개 저장소에 적지 않음).

## 모듈형 장비 슬롯·카드 데이터 미확인 항목 — RT컴 확인 대기 (0.208)

AV Portal·AV System Builder용으로 공개 JSON에 넣은 슬롯·카드 단자 중 문서로 확인하지 못한 항목입니다(`docs/handoff/AV_PORTAL_MODULAR_SLOTS.md` §4). 확인되면 해당 `io` 행의 값과 `verification`을 고치고 AV Portal 담당에게 알립니다.
- [ ] XDM-COS100: XDM-PHX 전원을 포트마다 받는지, 1번 포트 피닉스 단자 하나로 받는지(지금은 Power 행 수량을 비움)
- [ ] XDM-WOS100: 오디오 단자 유무(카탈로그 9쪽은 HDMI 4포트만)
- [ ] SPX-HIS8: 오디오 출력 8포트의 커넥터 형태(사진상 3.5mm 잭)
- [ ] VDM SIS4-U: 매뉴얼 KV07의 VDM-SIS4와 같은 카드인지, 오디오 잭 규격
- [ ] VDM SOS4: 오디오 단자 유무(매뉴얼 42쪽 4포트, 카탈로그 20쪽 사양·사진에는 없음)
- [ ] VDM HOS4S-UW: USB 2포트의 용도·위치(매뉴얼 44쪽, 사진에 안 보임)
- [ ] VDM-288X: 입출력 보드 수(카탈로그·매뉴얼 모두 없음, 구성기도 제외)

## XDM-WOS100 레이어 3개일 때 포트 조건 — 알티컴 확인 대기 (0.209)

0.209에서 사용자 확인("불가 (HOS100과 같음)")대로 레이어 2개(1·2번, 3·4번 짝)와 4개(2~4번 포트 사용 불가) 조건을 WOS100 팝업 포트 칩·비교표·카드 사양에 반영했습니다(`docs/implementation/XDM_COMMAND_GUIDE_0.209.md`).
- [ ] 레이어 3개일 때 어떤 포트를 쓸 수 없는지 확인합니다. 지금 팝업에는 "레이어 3개일 때의 포트 조건은 아직 확인되지 않았습니다."라고 적혀 있습니다. 레이아웃 예시 6종은 레이어 4개 5종·2개 1종이라 3개 예시는 그리지 않았습니다. 확인되면 3개 예시와 포트 칩을 더할지 검토합니다.

## 용어 통일 후속(0.189) — 사용자 결정 대기

`docs/audit/TERMS_REVIEW_2026-10-01_decisions.md`의 검토 40행은 자동 적용하지 않았습니다(`docs/implementation/TERMS_UNIFICATION_0.189.md` §3).
- [ ] 검토 행 판단: HD-13U·HD-210U 오디오 문구(믹스 표현 병존), QMS-88UX 쿼드 명칭(최대 8분할 설명 병존), SPX "Touch Screen" → 터치 패널/터치스크린, 짧은 영문 사양 값(Fiber Optical Input 등) 원문 여부
- [ ] 영문 분류명(1x4 HDMI 18Gbps Splitter 등)과 모델명 축약(CTR100 등)은 사용자 "pass"로 그대로 둠. 다시 정할 때 이 항목에서 시작

## AI 검색 사내 베타(0.142) — 사용자 설정 대기

`docs/implementation/AI_SEARCH_BETA.md` §5 절차를 사용자가 직접 합니다. Claude는 API 키·비밀값을 받지 않습니다.
- [ ] Anthropic Console: Workspace·API 키 발급, 월 지출 한도 설정
- [ ] Cloudflare: 두 Worker 배포, `rtcom-ai-login`에 Access(허용 명단, `@seoulav1.co.kr`) 켜기, 비밀값 7개 넣기
- [ ] 두 Worker 주소(`rtcom-ai-api…workers.dev`, `rtcom-ai-login…workers.dev`)를 Claude에게 알려 주기 → `src/ai-search.js`의 `CONFIG` 채워 배포
- [ ] 첫 실제 질문으로 답 품질·건당 토큰(`cacheWrite`·`cacheRead`) 확인

## 03 카드 슬롯 개선안 B·C — 사용자 결정 대기 (0.167)

시안은 `docs/qa/card-signal-badge-0.167/mock-B.png`·`mock-C.png`, 설명은 `docs/implementation/CARD_SIGNAL_BADGE_0.167.md` "남은 일"에 있습니다. 시안 A는 0.167.0에 반영했습니다.
- [ ] B: 후면 왼쪽 세로 카드 트레이(입력·출력 탭, 채널 수·전송기 연동 표시, 블랭크 커버), 트레이에서 눌러서 장착(휴대폰 지원). 후면 그림이 조금 작아짐
- [ ] C: 슬롯 채널 번호(CH 1–4 등), 신호 색 슬롯 완성도 막대, 내 구성 "자동 연동 전송기" 묶음

## 사용자(RT컴)에게 받을 사진

받으면 `input_doc/`에 넣거나 zip으로 올립니다. 처리는 `.claude/skills/input-doc/SKILL.md`의 사진 교체 절차를 따릅니다.
- 형식: 투명 배경 PNG, 긴 변 3000px 이상
- 이름: `모델명.png`는 윗면, `(F)`는 앞면, `(B)`는 뒷면

| 순위 | 제품 | 필요한 면 | 지금 상태 |
|---|---|---|---|
| 1 | XDM-FT101 / XDM-FR101 | 앞면(MODE 로터리·S/P) | 매뉴얼 사진(691px) |
| 1 | XDM-CR103 | 앞면·뒷면 | 매뉴얼 사진, 구성기 썸네일 66px |
| 1 | XDM-CT103 | 뒷면 | 매뉴얼 사진 |
| 1 | XDM-CTR100 PSE | 윗면 고해상도 원본 | 제품 부분 611px(목록 카드 448px) |
| 2 | CT104-U / CR104-U | 윗면·앞면·뒷면(송·수신기) | 480px |
| 2 | FT101-U / FR101-U | 윗면·앞면·뒷면(송·수신기) | 480px |
| 2 | CT103-U-H / CR103-U | 전체, CR103-U 앞면·뒷면 | 383px, 매뉴얼 사진 |
| 2 | FT103-U-H / FR103-U | 송·수신기 앞면·뒷면 | 매뉴얼 사진(수신기 386px) |
| 3 | SPX-TX/RX, HD-D102U 비스듬한 사진, VDM 프레임, AHOC·LHOC·UMC | 대표 사진 | 600~700px |

## SPX-R6(0.157) — 확인할 사항

`docs/implementation/SPX_R6_0.157.md` §4에 근거가 있습니다.
- [ ] 크기·무게·전원 어댑터 전압: 사양서에 없어 04 제품 사양에 적지 않았습니다. 자료를 받으면 추가합니다.
- [ ] RTCOM 로고가 있는 실물 사진이 생기면 평면 그림 대신 사진으로 바꿀 수 있습니다.

## AV 빌더 한 번에 열기(B안) — AV 빌더 쪽 작업 대기

- [x] rtcom 쪽 "AV 빌더에서 바로 열기"(0.174): 새 탭 `?import=rtcom` + 창 사이 메시지, 준비 신호가 없으면 10초 뒤 파일 내려받기.
- [ ] AV 빌더(seoul-visual-tech/av-system-builder)에 받기 코드 넣기: `docs/handoff/AV_BUILDER_RTCOM_IMPORT.md` §2. 그 저장소가 이 작업 세션에 연결되지 않아(권한 없음) 사용자 쪽에서 저장소 접근을 열거나, 그 저장소를 연 세션에서 작업합니다.

## 공개 여부를 사용자에게 물어볼 PDF

`.source-materials/`에 있고 아직 제품 상세 버튼이 없는 자료입니다. 공개하려면 목록을 보여 주고 확인을 받습니다(CLAUDE.md 규칙).
- CT-CR-103-U 매뉴얼 KV01 → CT103-U-H / CR103-U
- FT-FR-103-U-H 매뉴얼 Ver1.4 → FT103-U-H / FR103-U
- HD-13U 제품 안내서, XDM-CTR100 PSE 제품 안내서
- `XDM-POE2U_030_ASSY.pdf`는 내부 조립 도면으로 보여 후보에서 뺐습니다.

## 참고

- 세션마다 자기 작업 브랜치만 씁니다(옛 공유 브랜치 `claude/relaxed-euler-mq1di9`는 쓰지 않음).
- 버전 번호는 병합 직전에 `origin/main`을 합친 뒤 main + 1로 확정하고, `node scripts/check-version.cjs --against origin/main`으로 확인합니다(CLAUDE.md "여러 세션이 동시에 작업할 때", 0.160).
