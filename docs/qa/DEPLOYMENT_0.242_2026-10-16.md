# 0.242.0 배포 기록 (2026-10-16)

- PR: #371 "0.242.0: 신호 색 통일(HDMI 빨강 #E5242B·DP 짙은 주황 #C55A11, 구성도 범례 기준)"
- 병합: squash, main `81c57dc` (`expectedHeadSha` 6a84c5d 고정, GitHub `RTCOM checks / verify` success)
- 번호: 작업 중 main이 0.240(#374)·0.241(#375)로 바뀌어 0.239 → 0.240 → 0.242로 다시 정함
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 38981934145, success

## 공개 주소 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 표기 | `CATALOG BASED · 0.242` |
| 공개 `src/styles.css` | `[data-sig="hdmi"]{--rt-sig:#E5242B`, `--pg-sig-dp:#C55A11` |
| 공개 `CLAUDE.md` | 404 |

## 로컬 검증 메모

- `e2e-smoke` 로컬 실행에서 182개 통과 뒤 183번째(VDM 103쪽 매뉴얼 팝업 다시 열기)가 30초 시간 초과로 멈췄습니다. 신호 색과 관계없는 부분이며 GitHub `verify`(같은 e2e 포함)는 통과했습니다.
