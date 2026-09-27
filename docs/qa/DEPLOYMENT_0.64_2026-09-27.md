# 0.64.0 GitHub Pages 배포 기록

- 배포일: 2026-09-27
- 사용자 승인: "배포"
- 소스 병합: PR #45 → `main` 병합 커밋 `1901bf21b248327cb622f66dd6ad19251073bb91`(PR head `fa2c35009cc2170f60d28793b8294cbd19c59ba3`)
- 배포 방법: `Deploy RTCOM to GitHub Pages`(`.github/workflows/pages.yml`)를 `main`에서 실행
- GitHub Actions run: `36342729098`(run 40), `completed / success`, head_sha가 병합 커밋과 일치
- 공개 URL: `https://seoulav.github.io/rtcom-configurator/`

## 이번에 공개된 내용(0.64.0)

| 작업 | 내용 |
|---|---|
| SPX-TX/RX 추가 | 29번째 제품(전송기 13종). 매뉴얼 Ver.2.0 근거 사양·TX/RX 단자 지도·SPX-TX 측면 딥 스위치(아래쪽 ON, 3·4번 EDID 조합) |
| SPX 표기 | HDBaseT가 아닌 CATx 전송: 구성기 04 안내 "CATx 카드", SPX 범례 "CATx", SPX-TX/RX 신호 흐름 "CATx" |
| XDM-FT101/FR101 | 매뉴얼 Ver.1.3 근거 06 EDID 설정(MODE 로터리 전체 8칸, Source 0~3 / Analog 8~11), 전원·광 출력·S/P 단자 |
| OBUX-1C | 매뉴얼 Ver.2.2 근거 Tx Mode 딥 스위치(검은 몸체 4핀, 1번 오디오, 2·3·4번 EDID 조합 5가지). 출고 시 모두 OFF, 레버를 아래로 내리면 ON(사용자 확인·매뉴얼 사진) |
| HDS-21U | 딥 스위치 3번(분배)을 HDS-42MU와 같게 추가(사용자 확인) |
| HD-210U | 딥 스위치 3번은 기능 없음 안내(사용자 확인) |
| 05 주요 기능 | 20개 제품 약 90줄 "~한다/~다." → "~ 지원"·명사형 |

- 근거·화면: `docs/qa/SPX_TXRX_FT101_MANUAL_QA_2026-09-27.md`, `docs/qa/HDS_DIP_SWITCH_CARD_QA_2026-09-27.md` §6, `docs/qa/HD13U_AUDIO_HD210U_DIP_QA_2026-09-27.md` §3
- 병합 전 검증: 39/39 단위 테스트, 29종 validator, package-site, 124/124 e2e, `git diff --check` 통과.

## 배포 뒤 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 | `CATALOG BASED · 0.64` |
| 공개 파일 대조 | `main`(1901bf2)에서 만든 `dist/`와 공개 파일 SHA-256 **197/197 일치**(`.nojekyll` 제외) |
| 비공개 파일 | `CLAUDE.md`·`README.md`·`CHANGELOG.md`·`AGENTS.md`·`docs/qa/`·`.source-materials/`·`scripts/package-site.cjs` 모두 HTTP 404 |
| 브랜치 배포(`pages build and deployment`) | 이번 병합 뒤에도 실행 없음 |

## Rollback

병합 커밋 `1901bf21b248327cb622f66dd6ad19251073bb91`를 revert하는 PR을 만들어 병합한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행하면 0.63.0 화면으로 돌아갑니다.
