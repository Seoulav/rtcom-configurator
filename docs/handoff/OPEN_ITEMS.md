# 남은 할 일·받을 자료 (2026-09-28 기준)

새 세션은 이 목록을 먼저 확인합니다. 처리한 항목은 지우고, CHANGELOG에 버전과 함께 남깁니다.

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

## GitHub 설정 — 사용자 작업 대기

- [ ] `main` 브랜치에 필수 검사 `RTCOM checks / verify`를 켜기(0.165, 순서: `docs/implementation/TOUCH_SLOT_X_AND_CI_0.165.md` §2). 켜기 전에도 검사는 PR마다 돌고, Claude는 통과를 확인한 뒤 병합합니다.

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
