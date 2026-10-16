# 남은 할 일·받을 자료 (2026-10-16 기준)

새 세션은 이 목록을 먼저 확인합니다. 처리한 항목은 지우고, CHANGELOG에 버전과 함께 남깁니다.

## 알티컴에 보낼 질문 모음 (2026-10-13)

아래 항목 중 알티컴에 물을 질문을 한곳에 모아 보낼 수 있게 `docs/RTCOM_MANUFACTURER_DATA_REQUEST.md` §5에 정리했습니다. 답을 받으면 해당 항목을 지우고 §5 표에도 답을 적습니다. 1~6·8~12번과 XDM-288 보드 수는 2026-10-13에 답을 받아 0.210~0.212에 반영했습니다. 7번(SPX-R6 크기·무게·어댑터)은 2026-10-14에 답을 받아 0.216에 반영했습니다.
- [x] 13번 MR-4S 장착 모듈: 2026-10-14 사용자 확인으로 CT104-U/CR104-U·FT101-U/FR101-U 카드를 꽂는 것으로 0.217에 반영했습니다.
- [x] XDM 매트릭스 호환 모듈: 2026-10-16 사용자가 XDM-MR4S 실물 사진을 주고 공개 등록을 요청해 별도 제품 `xdm-mr4s`로 0.223에 추가했습니다. MR-4S 사양에는 XDM 호환 문구를 넣지 않고 관련 제품으로만 잇습니다.
- [ ] XDM-MR4S 사양 자료(0.223): 크기·무게·전원 어댑터 규격, POWER 1·2 전원 이중화 여부, 매뉴얼·카탈로그 PDF. 받으면 `data/products/xdm-mr4s.json` 04 제품 사양과 문서 버튼에 넣습니다.

## 안내서 PDF 2건 공개 — 파일 대기 (2026-10-13, 매뉴얼은 0.215에 공개)

사용자가 공개를 결정했습니다("모든 매뉴얼 PDF 공개합니다"). 원본은 로컬 `.source-materials/`에만 있어 클라우드 작업 환경에서는 볼 수 없습니다.

- **전달 방법(사용자 결정 2026-10-13 "GitHub에 직접 업로드"):** 사용자가 GitHub 웹에서 `output/design/assets/docs/`에 올립니다. 작업 브랜치에 올리면 Claude가 문서 속성의 작성자 정보를 지운 뒤 squash 병합하므로 `main` 기록에는 정리된 파일만 남습니다. `main`에 바로 올리면 원본의 작성자 정보가 `main` 기록에 남습니다(사용자가 알고 선택함).
- **받은 뒤 할 일:** 작성자 정보 지우기 → 본문에 고객·현장 이름이 있는지 확인 → 아래 이름으로 바꾸기 → `documents[].file`·`preview:'pdfjs'` 등록 → `output/design/assets/docs/README.md` 목록 갱신.
- **PSE 제품 안내서 버튼 위치(사용자 결정 2026-10-13 "PSE 상세에만"):** XDM-CTR100 PSE 상세에만 둡니다. XDM-CTR100 상세에는 두지 않습니다.
- [ ] HD-13U 제품 안내서 → `hd-13u-sheet.pdf`
- [ ] XDM-CTR100 PSE 제품 안내서 → `xdm-ctr100-pse-sheet.pdf`(XDM-CTR100 PSE 상세에만)

## 용어 통일 후속(0.189) — 0.218에 결정 완료

검토 40행은 2026-10-14 사용자 결정으로 모두 정리했습니다(`docs/implementation/TERMS_REVIEW_DECISIONS_0.218.md`: 믹스 → 병합, Touch Screen → 터치스크린, 짧은 영문 원문 유지).
- 영문 분류명(1x4 HDMI 18Gbps Splitter 등)과 모델명 축약(CTR100 등)은 사용자 "pass"로 그대로 둡니다. 다시 정할 때 이 항목에서 시작합니다.

## AI 검색 사내 베타(0.142) — 사용자 설정 대기

`docs/implementation/AI_SEARCH_BETA.md` §5 절차를 사용자가 직접 합니다. Claude는 API 키·비밀값을 받지 않습니다.
- [ ] Anthropic Console: Workspace·API 키 발급, 월 지출 한도 설정
- [ ] Cloudflare: 두 Worker 배포, `rtcom-ai-login`에 Access(허용 명단, `@seoulav1.co.kr`) 켜기, 비밀값 7개 넣기
- [ ] 두 Worker 주소(`rtcom-ai-api…workers.dev`, `rtcom-ai-login…workers.dev`)를 Claude에게 알려 주기 → `src/ai-search.js`의 `CONFIG` 채워 배포
- [ ] 첫 실제 질문으로 답 품질·건당 토큰(`cacheWrite`·`cacheRead`) 확인

## 03 카드 슬롯 개선안 B — 보류 (C는 0.219에 반영)

시안은 `docs/qa/card-signal-badge-0.167/mock-B.png`입니다. 2026-10-14 사용자 결정으로 C만 진행했습니다(`docs/implementation/CARD_SLOT_PLAN_C_0.219.md`).
- [ ] B: 후면 왼쪽 세로 카드 트레이(입력·출력 탭, 채널 수·전송기 연동 표시, 블랭크 커버), 트레이에서 눌러서 장착. 0.197 "눌러서 옮기기"로 터치 장착은 이미 가능하므로, 다시 원할 때 이 항목에서 시작합니다.

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
- [ ] RTCOM 로고가 있는 실물 사진이 생기면 평면 그림 대신 사진으로 바꿀 수 있습니다.

## XDM 화면 연출 시뮬레이터(0.224) — 2차 이후

`docs/implementation/LAYOUT_SIM_0.224.md` §5·§8에 근거가 있습니다. 1차는 XDM-WOS100 월 오버레이(자유 창)만 넣었습니다(사용자 결정 2026-10-16 "XDM 자유 창 먼저", 공개 범위 "전부 공개").
- [ ] **알티컴 확인 필요(포트 배치, 제조사 질의서 §5 15번)**: 가이드 46~47쪽 Wall Port Connection 그림은 WOS100 카드 1장의 포트 1~4가 디스플레이 2×2 각각에 연결되는데, 알티컴 확인(0.210)은 "레이어를 쓰면 카드 4포트가 모두 같은 화면"입니다. 오버레이(`OW`) 커맨드를 쓸 때 실제 배치가 어느 쪽인지 확인되면 시뮬레이터 "포트 배치" 기본값을 확정하고 다른 쪽을 뺍니다.
- [x] XDM-HOS100 한 화면 사용자 레이아웃(`OQ … L00`)·PIP(`L09`)·고정 레이아웃 L01~L12 → 0.225에서 반영(`docs/implementation/LAYOUT_SIM_HOS100_0.225.md`)
- [ ] XDM-HOS100 `L13`(1~4번 PIP 사용자 배치): 가이드 25쪽 형식의 좌표 묶음 수가 불분명해 제외(제조사 질의서 §5 16번). 확인되면 추가.
- [ ] XDM-WOS100 LED 월(`S/L` 모드, 출력마다 LED 픽셀 `OxxxRxCx`, 56~64쪽)
- [ ] 03 카드 슬롯의 신호명을 창 이름으로 자동 채우기
- [ ] VDM·SPX 격자 월·쿼드뷰(공개 매뉴얼 커맨드)
- [ ] 현장 메모 커맨드(`IV … M03` HPD Disable, `IE … M18/M19` EDID, Genlock 설정)는 가이드 본문에 없고 0.209 결정(현장 값 비공개)에도 해당되어 넣지 않음. 알티컴이 표준 기능으로 확인해 주면 그때 추가.

## AV 빌더 한 번에 열기(B안) — AV 빌더 쪽 작업 대기

- [x] rtcom 쪽 "AV 빌더에서 바로 열기"(0.174): 새 탭 `?import=rtcom` + 창 사이 메시지, 준비 신호가 없으면 10초 뒤 파일 내려받기.
- [ ] AV 빌더(seoul-visual-tech/av-system-builder)에 받기 코드 넣기: `docs/handoff/AV_BUILDER_RTCOM_IMPORT.md` §2. 그 저장소가 이 작업 세션에 연결되지 않아(권한 없음) 사용자 쪽에서 저장소 접근을 열거나, 그 저장소를 연 세션에서 작업합니다.

## 참고

- 세션마다 자기 작업 브랜치만 씁니다(옛 공유 브랜치 `claude/relaxed-euler-mq1di9`는 쓰지 않음).
- 버전 번호는 병합 직전에 `origin/main`을 합친 뒤 main + 1로 확정하고, `node scripts/check-version.cjs --against origin/main`으로 확인합니다(CLAUDE.md "여러 세션이 동시에 작업할 때", 0.160).
