# 연결 다이어그램 정확성 수정 QA — A1·A2·B1·B2 (0.30.0)

- 일시: 2026-09-27 · 환경: 로컬 build(`dist/`), 전역 Playwright(`NODE_PATH=/opt/node22/lib/node_modules`), Chromium(`executablePath: /opt/pw-browsers/chromium`)

| 항목 | 결과 |
|---|---|
| `node --test tests/*.test.cjs` | 29/29 통과 |
| `node scripts/build-product-index.cjs --check` | 27개 통과 |
| `node scripts/package-site.cjs` | 정상 빌드 |
| `node scripts/e2e-smoke.cjs`(전역 playwright) | 53/53 통과 |
| `git diff --check` | 통과 |
| 콘솔 JS 오류 | 0건 |

## 화면 확인 (Playwright 스크린샷)

1. **XDM-CTR100 상세, 1100px**: 연결 다이어그램이
   - "조합 1 · XDM-CIS100·COS100 카드에 직결(전원 직접 연결, PSE 사용 불가)" 아래 두 줄로 표시됨: 위 줄 "소스 기기 → XDM-CTR100(TX · 전원 직접 연결) → HDBaseT(CATx) → XDM-CIS100(입력 카드)", 아래 줄 "XDM-COS100(출력 카드) → HDBaseT(CATx) → XDM-CTR100(RX · 전원 직접 연결) → 디스플레이".
   - 두 케이블 구간 모두 "최대 100m / 80m"이 표시됨(케이블별 전송거리 모두 반영).
   - "조합 2 · HDBaseT 카드 없이 연장할 때(XDM HDMI 카드 연장·단독 1:1)" 아래 소스·PSE·CTR100·디스플레이가 한 줄로 이어짐.
   - 하단 안내가 "그 외 신호(RS-232 / Audio)는 위 입출력 표를 확인하세요."로 바뀜(이전: "Female Phoenix connector 5p").
2. **XDM-CTR100 상세, 390px(휴대폰)**: 다이어그램이 가로 스크롤 가능한 영역 안에 들어가고, 오른쪽 끝에 "더 보기" 그러데이션이 정상적으로 나타남(기존 0.28 기능과 함께 동작 확인).
3. **QMS-88UX 상세, 1100px**: 제조사 원본 다이어그램 아래에
   - 회색 캡션 "카탈로그 46쪽판 28쪽 제조사 제공 연결 다이어그램"
   - 주황 배지 "표기 다름" + "제조사 원본 그림은 후면 라벨이 HDMI IN/OUT 1~8·DC+12V로, 실제 제품(출력 10포트[9·10번 쿼드뷰]·100-200 VAC)과 다른 섀시 그림으로 보입니다 — 포트 수·전원 표기는 제품사양 표 기준으로 확인하세요."
   두 줄이 순서대로 표시됨을 확인.
4. **SPX Series 상세, 1100px**: 다이어그램 아래 캡션에 "카탈로그 46쪽판 13쪽 제조사 제공 시스템 구성도(SPX-M810 모델 기준)"이 표시됨(Playwright로 캡션 텍스트를 직접 읽어 확인).
5. **다이어그램 재크롭 8장**: 재생성한 webp 파일을 직접 열어 육안으로 확인했다.
   - HD-13U·HD-18U·HD-210U·HD-D102U·HDS-21U: 바깥 테두리 사각형이 위·아래·좌·우 모두 온전히 보임(HD-D102U는 모니터 받침까지 포함).
   - QMS-44UX·QMS-88UX: 위쪽에 남아 있던 표 경계선 한 줄이 사라지고 테두리부터 시작함.
   - SPX: 제목("제품 구상도 [SPX-M810 모델(HDMI SLOT)]")이 잘리지 않고 온전히 보이며, 아래쪽 여백이 실제 콘텐츠(Zone 4 Video 썸네일) 바로 아래로 줄어듦.

## 회귀 확인

- 전송기(비-CTR100) 다이어그램(예: CT104-U/CR104-U)이 기존과 같은 단일 행 구조로 정상 표시됨(코드 분기 `pseCombo`가 아닌 경로는 로직을 바꾸지 않음).
- 분배기·일체형(splitterDiagram) 쪽은 이번 작업에서 건드리지 않았고 기존 e2e 항목이 그대로 통과함.
- 케이블 4종·MR-4S·VDM/XDM/SPX 시리즈처럼 다이어그램이 없는 제품은 여전히 다이어그램 섹션 자체가 나타나지 않음.

## 남은 위험

- `docs/audit/PRODUCT_DIAGRAM_REVIEW_2026-09-27.md`의 A3(VDM 전송기 4종 RS-232 누락)·B6(쪽 번호 표기 통일)·B7(46쪽판 재검증 기록)은 이번 작업 범위 밖으로, 다음 프롬프트에서 다룬다.
- QMS-88UX·QMS-44UX의 실제 전원 사양(100-200 VAC 대 DC 12V 2A/5A)은 제조사 확인 전까지는 안내 문구로만 표시하고 사양 값 자체는 바꾸지 않았다.
