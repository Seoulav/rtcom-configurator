# HDMI 카드 PSE 쌍 연장 QA (0.10.0)

- 실행일: 2026-09-26
- 환경: Linux 클라우드 컨테이너, Node 22, Chromium(Playwright)

| 명령 | 결과 |
|---|---|
| `node --test tests/*.test.cjs` | 24/24 통과 (HDMI 카드 선택지, 자동 연결 없음, HDBaseT 카드에 PSE 불가, BOM 6쌍·직결 3대, 전원 경고 수, PSE 쌍만 있을 때 전원 장비·경고 없음, JSON 저장·복원) |
| `node scripts/package-site.cjs` | 성공 |
| `node scripts/e2e-smoke.cjs` | 22/22 통과 (HDMI 카드 PSE 쌍 선택과 전원 경고 수 항목 추가) |
| `git diff --check` | 통과 |

## 브라우저 수동 확인 (1280px, 390px)

| 시나리오 | 결과 |
|---|---|
| XDM-12: HI100(입력 1), CIS100(입력 2), HOS100(출력 1) | CIS100만 CTR100 TX 자동 연결, HDMI 카드는 연결 없음 |
| 입력 1에 PSE 쌍 2채널, 출력 1에 PSE 쌍 4채널 선택 | 저장값 반영 |
| 전원 안내 | "XDM-CTR100 4대에 전원 직접 연결"(직결분만) |
| 구성 검토 BOM | CTR100 PSE 6, CTR100(PSE 급전, 전원 불필요) 6, XDM-CTR100 4, 전원 공급 장비 1 |
| 390px | 가로 넘침 0px, JS 오류 0 |
