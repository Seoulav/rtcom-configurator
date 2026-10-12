# 남은 할 일·받을 자료 (2026-10-01 기준)

새 세션은 이 목록을 먼저 확인합니다. 처리한 항목은 지우고, CHANGELOG에 버전과 함께 남깁니다.

## XDM WOS·HOS 커맨드 자료 보기·다운로드 — 사용자 자료 대기 (2026-10-12)

사용자 요청 "XDM WOS, HOS 커맨드 자료야 이거 참고하고 XDM에서 이거 뷰,다운로드 기능 추가해줘"에 대해 사용자가 보류를 결정했습니다("일단 이거 보류하고 내일 업체에서 최신 자료 받으면 내가 PDF로 올려줄께").
- 받은 자료: `XDM_WALL____COMMAND-V1.00_1.docx`. 이 파일은 2024-07 판이고 5쪽이며, Output Quad Wall Mode Setting Command 1(`*255OWO…Q…P…`, VX·VY·VW·VH·CX·CY·CW·CH)과 Command 2(`A…`, X·Y·W·H)의 예시 10개를 담고 있습니다. 저장소에는 넣지 않았습니다.
- 공개 방식: 사용자 답변에 따라 원본 docx를 함께 공개할 때는 파일 속성의 작성자·수정자 이름을 지운 사본으로 올립니다. PDF도 속성에 이름이 있으면 같은 방식으로 지웁니다.
- [ ] 사용자가 업체 최신판 PDF를 올리면 다음 순서로 처리합니다.
  - 공개 목록을 보여 주고 확인을 받습니다(공개 폴더 커밋은 되돌리기 어려움).
  - `output/design/assets/docs/`에 올리고, XDM 제품 상세 문서 버튼에 PDF.js 팝업 보기와 다운로드를 붙입니다(`docs/implementation/PRODUCT_DOCUMENT_DOWNLOADS.md`).
- [ ] 같은 자료를 다음 위치에서도 연결합니다.
  - WOS100 레이어 팝업의 "레이어 겹침 설정은 커맨드 전용(별도 커맨드 매뉴얼)"
  - WOS100 카드 note "중첩 기능 커맨드는 별도 커맨드 매뉴얼"
  - HOS100 멀티뷰 팝업의 "User config mode는 커맨드"
- [ ] 자료 내용을 참고해 WOS100 팝업에 다음 커맨드 요지를 한두 줄로 적을지 검토합니다.
  - 출력 포트별 표시 영역(VX·VY·VW·VH)
  - 입력 잘라내기(CX·CY·CW·CH)
  - 겹침 우선순위(`P1234`)
  - 월 타이밍(`Q00` 끄기, `Q14` 3840x2160@60 등)
  - 최신판 PDF와 대조한 뒤 반영합니다.

## XDM-WOS100 레이어 사용 시 포트 조건 — 사용자 확인 대기 (0.207)

0.207에서 WOS100 레이어 구성도를 "출력 1개(OUT 1)에 4K/60 소스 4개" 그림으로 바꿨습니다(`docs/implementation/XDM_WOS100_ONE_OUTPUT_LAYERS_0.207.md`).
- [ ] 레이어 4개를 쓸 때 나머지 2~4번 포트를 계속 쓸 수 있는지 확인합니다. HOS100처럼 포트 자원을 함께 쓰는지가 관건입니다. 지금 팝업·비교표에는 "확인 중"으로 적혀 있습니다.
- [ ] 확인되면 다음 두 곳에 반영합니다.
  - WOS100 팝업에 포트 상태 표시(HOS100 팝업의 포트 칩 방식)
  - 카드 사양 "레이어" 행

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
