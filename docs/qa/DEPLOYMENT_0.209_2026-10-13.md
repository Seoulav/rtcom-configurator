# 0.209.0 배포 기록 (2026-10-13)

## 대상

- PR #315 `0.209.0: XDM 커맨드 가이드 공개, 알티컴 회신 제품 사실과 커맨드 근거 특장점 반영`
- 병합 커밋: `4bea14d` (squash, expectedHeadSha `8058d50`)
- PR 검사 `RTCOM checks / verify`: 성공 (run 38361427270)

## 배포

- `Deploy RTCOM to GitHub Pages` (`pages.yml`, workflow_dispatch, main `4bea14d`): run 38361701084 성공

## 공개 주소 확인 (curl)

| 항목 | 결과 |
|---|---|
| `https://seoulav.github.io/rtcom-configurator/` 버전 표기 | `CATALOG BASED · 0.209` |
| `/CLAUDE.md` | 404 |
| `output/design/assets/docs/xdm-command-guide.pdf` | 200, `application/pdf`, 1,021,148바이트, main 파일과 sha256 일치 |
| `data/products/xdm.json` · `index.json`, `src/app.js` · `card-specs.js` · `styles.css` | main 파일과 sha256 일치 |

## 참고

- 로컬 `dist/` e2e는 237/237입니다. 문서 버튼 2개(매뉴얼·커맨드 가이드), WOS100 포트 칩·가이드 44쪽 링크·LED 상자, HOS100 커맨드 표 11행·가이드 25쪽 링크를 확인합니다.
- 남은 확인 항목(레이어 3개 포트 조건, 입력 무신호 응답 형식, 입력 변화 알림 기능, 회신 EDID 번호)은 `docs/handoff/OPEN_ITEMS.md`에 있습니다.
