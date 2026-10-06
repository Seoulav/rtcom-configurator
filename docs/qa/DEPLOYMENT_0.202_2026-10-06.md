# 0.202.0 배포 기록 (2026-10-06)

## 대상

- PR #302 `0.202.0: XDM-COS100 카드 판넬 사진을 매뉴얼 KV08 18쪽 사진(피닉스 5핀)으로 교체`
- 병합 커밋: `5f9d76c` (squash, expectedHeadSha `45c7b2b`)
- PR 검사 `RTCOM checks / verify`: 성공 (run 37393783370)

## 배포

- `Deploy RTCOM to GitHub Pages` (`pages.yml`, workflow_dispatch, main `5f9d76c`): run 37394002869 성공

## 공개 주소 확인 (curl)

| 항목 | 결과 |
|---|---|
| `https://seoulav.github.io/rtcom-configurator/` 버전 표기 | `CATALOG BASED · 0.202` |
| `/CLAUDE.md` | 404 |
| `/output/design/assets/cards/XDM-COS100.webp` | main 파일과 sha256 일치(`5c31bb81…`) |

## 참고

- 사이트 화면 확인은 로컬 `dist/` e2e(231/231)로 했습니다. 이 환경의 Playwright는 프록시 인증서 문제로 공개 주소를 열지 못해 공개 주소는 curl로만 확인했습니다.
- 브라우저 캐시 때문에 예전 COS100 사진이 잠시 보이면 새로 고침(Ctrl+F5)하면 됩니다.
