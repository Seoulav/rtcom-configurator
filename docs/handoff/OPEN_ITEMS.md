# 남은 할 일·받을 자료 (2026-10-14 기준)

새 세션은 이 목록을 먼저 확인합니다. 처리한 항목은 지우고, CHANGELOG에 버전과 함께 남깁니다.

## 알티컴에 보낼 질문 모음 (2026-10-13)

아래 항목 중 알티컴에 물을 질문을 한곳에 모아 보낼 수 있게 `docs/RTCOM_MANUFACTURER_DATA_REQUEST.md` §5에 정리했습니다. 답을 받으면 해당 항목을 지우고 §5 표에도 답을 적습니다. 1~6·8~12번과 XDM-288 보드 수는 2026-10-13에 답을 받아 0.210~0.212에 반영했습니다. 7번(SPX-R6 크기·무게·어댑터)은 2026-10-14에 답을 받아 0.216에 반영했습니다.
- [ ] FT101-U/FR101-U 매뉴얼 정정본 요청: 2026-10-14에 받은 Ver.1.4는 표지만 FT-101-U이고 사양표·앞면 설명이 FT-103-U-H 내용입니다. 사용자 결정("그대로 공개")으로 공개했으며 사이트 사양은 카탈로그 기준입니다. 알티컴에 FT101-U 사양이 들어간 정정본을 요청합니다(질문표 §5 14번). 2026-10-14 사용자 결정("내가 직접보고 메뉴얼 다시줄께"): 사용자가 매뉴얼을 직접 검토한 뒤 다시 제공합니다. 고칠 곳은 4~7·9~12쪽(FT-103-U-H 사양표·앞면 설명·주요 특징·사용 방법·보증서)과 표지 부제 "Wall Plate Extender"입니다. MR-4S·XDM-PSU 매뉴얼은 나중에 필요하면 요청합니다.
- [x] 13번 MR-4S 장착 모듈: 2026-10-14 사용자 확인으로 CT104-U/CR104-U·FT101-U/FR101-U 카드를 꽂는 것으로 0.217에 반영했습니다.
- [ ] XDM 매트릭스 호환 모듈(가칭, 사용자 확인 대기): 제품 출시·사양이 확정되면 MR-4S 사양에 호환 문구를 다시 넣을지 정합니다. 확정 전에는 공개 사이트에 이름과 호환 문구를 적지 않습니다.

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

## AV 빌더 한 번에 열기(B안) — AV 빌더 쪽 작업 대기

- [x] rtcom 쪽 "AV 빌더에서 바로 열기"(0.174): 새 탭 `?import=rtcom` + 창 사이 메시지, 준비 신호가 없으면 10초 뒤 파일 내려받기.
- [ ] AV 빌더(seoul-visual-tech/av-system-builder)에 받기 코드 넣기: `docs/handoff/AV_BUILDER_RTCOM_IMPORT.md` §2. 그 저장소가 이 작업 세션에 연결되지 않아(권한 없음) 사용자 쪽에서 저장소 접근을 열거나, 그 저장소를 연 세션에서 작업합니다.

## 참고

- 세션마다 자기 작업 브랜치만 씁니다(옛 공유 브랜치 `claude/relaxed-euler-mq1di9`는 쓰지 않음).
- 버전 번호는 병합 직전에 `origin/main`을 합친 뒤 main + 1로 확정하고, `node scripts/check-version.cjs --against origin/main`으로 확인합니다(CLAUDE.md "여러 세션이 동시에 작업할 때", 0.160).
