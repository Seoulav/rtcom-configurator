# 남은 할 일·받을 자료 (2026-09-28 기준)

새 세션은 이 목록을 먼저 확인합니다. 처리한 항목은 지우고, CHANGELOG에 버전과 함께 남깁니다.

## AI 검색 사내 베타(0.142) — 사용자 설정 대기

`docs/implementation/AI_SEARCH_BETA.md` §5 절차를 사용자가 직접 합니다. Claude는 API 키·비밀값을 받지 않습니다.
- [ ] Anthropic Console: Workspace·API 키 발급, 월 지출 한도 설정
- [ ] Cloudflare: 두 Worker 배포, `rtcom-ai-login`에 Access(허용 명단, `@seoulav1.co.kr`) 켜기, 비밀값 7개 넣기
- [ ] 두 Worker 주소(`rtcom-ai-api…workers.dev`, `rtcom-ai-login…workers.dev`)를 Claude에게 알려 주기 → `src/ai-search.js`의 `CONFIG` 채워 배포
- [ ] 첫 실제 질문으로 답 품질·건당 토큰(`cacheWrite`·`cacheRead`) 확인

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

## 사용자(장비·제조사)에게 확인할 사양

- [ ] QMS-88UX 비디오 월에 출력 10번(M2)도 들어가는지: 매뉴얼 KV.04 19쪽은 "9번 포트로 설정 시 Wall 모드 설정에 맞춰 구성"만 적었고, 35쪽 RS-232 예시는 출력 5~10번으로 3×2 월을 만듭니다. 확인되면 06 WALL 요약에 적습니다(0.152, `docs/implementation/QMS88UX_WALL_DUAL_0.152.md`).

## SPX-R6(0.156) — 확인할 사항

`docs/implementation/SPX_R6_0.156.md` §4에 근거가 있습니다.
- [ ] 크기·무게·전원 어댑터 전압: 사양서에 없어 04 제품 사양에 적지 않았습니다. 자료를 받으면 추가합니다.
- [ ] 사양서 연결도의 SPX-RX "IR Blaster": SPX-TX/RX 매뉴얼 Ver.2.0의 SPX-RX에는 IR 단자가 없어 Signal Flow에 그리지 않았습니다. 사양서 그림의 수신기가 다른 판인지 확인이 필요합니다.
- [ ] 모듈 종류: 사양서는 "SPX-Extender 모듈"이라고만 적고, 연결도는 모든 칸이 HDMI IN·CAT OUT(송신)입니다. 수신 모듈을 꽂을 수 있는지 확인이 필요합니다.
- [ ] RTCOM 로고가 있는 실물 사진이 생기면 평면 그림 대신 사진으로 바꿀 수 있습니다.

## 공개 여부를 사용자에게 물어볼 PDF

`.source-materials/`에 있고 아직 제품 상세 버튼이 없는 자료입니다. 공개하려면 목록을 보여 주고 확인을 받습니다(CLAUDE.md 규칙).
- CT-CR-103-U 매뉴얼 KV01 → CT103-U-H / CR103-U
- FT-FR-103-U-H 매뉴얼 Ver1.4 → FT103-U-H / FR103-U
- HD-13U 제품 안내서, XDM-CTR100 PSE 제품 안내서
- `XDM-POE2U_030_ASSY.pdf`는 내부 조립 도면으로 보여 후보에서 뺐습니다.

## 참고

- 여러 세션이 같은 작업 브랜치(`claude/relaxed-euler-mq1di9`)에 동시에 올리는 일이 잦습니다.
- 버전 번호가 겹치지 않도록, 병합 직전에 `origin/main`과 원격 브랜치를 다시 받아 합치고 버전을 정합니다.
