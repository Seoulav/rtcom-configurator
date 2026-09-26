# 전송기 자동 연동 QA (0.9.0)

- 실행일: 2026-09-26
- 환경: Linux 클라우드 컨테이너, Node 22, Chromium(Playwright)

| 명령 | 결과 |
|---|---|
| `node --test tests/*.test.cjs` | 22/22 통과 (`defaultLink` 기본 연동·BOM 반영 검사, 전송기 사진 존재·배포본 포함 검사 추가) |
| `node scripts/package-site.cjs` | 성공 |
| `node scripts/e2e-smoke.cjs` | 21/21 통과 (CIS100 장착 시 CTR100 TX 4채널 자동 연결, 라인업 6종 사진 로드 추가) |
| `git diff --check` | 통과 |

## 브라우저 수동 확인 (1280px, 390px)

| 시나리오 | 결과 |
|---|---|
| XDM-12에 HDMI 카드만 장착 → 전송기 단계 | 안내, "카드 슬롯으로 돌아가기", 라인업 6종 표시 |
| CIS100·FIS100·COS100·FOS100 장착 | 저장값: CTR100 TX / FT101 / CTR100 RX / FR101, 각 4채널 |
| 출력 슬롯 1을 CR103으로 변경 | 저장값·BOM에 즉시 반영, 선택 타일로 포커스 유지 |
| 구성 검토 단계 BOM | XDM-CTR100 4, XDM-FT101 4, XDM-CR103 4, XDM-FR101 4, CTR100 전원 경고 |
| 390px | 타일 1열, 라인업 2열, 가로 넘침 없음, JS 오류 0 |
