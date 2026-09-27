# 0.68.0 GitHub Pages 배포 기록

- 배포일: 2026-09-28
- 사용자 승인: "지금까지만 진행하고 전부 다른 세션에 있는 것까지 병합해서 배포해줘"(2026-09-27)
- 소스 병합: PR #51 → `main` 병합 커밋 `11f23fca230addaa0e3eade50cc88b27b7e8fb01`(PR head `29b45f2a34b43fe35198e166ad8ba710e7777f6c`)
- 배포 방법: `Deploy RTCOM to GitHub Pages`(`.github/workflows/pages.yml`)를 `main`에서 실행
- GitHub Actions run: `36356203238`(run 44), `completed / success`, head_sha가 병합 커밋과 일치
- 공개 URL: `https://seoulav.github.io/rtcom-configurator/`

## 이번에 공개된 내용(0.68.0)

| 작업 | 내용 |
|---|---|
| XDM-FT101/FR101 단자 지도 정면 번호 | 매뉴얼 Ver.1.3 전면·후면 합성 사진(`xdm-ft101-fr101-front-rear.webp`)에 4 MODE 로터리·5 S/P 번호 추가(1 HDMI IN·2 AUDIO·RS-232·3 FIBER OUT·6 DC IN) |
| 제품 상세 문체 통일 | HD-D102U 05 주요 기능 6개 항목을 "~ 지원" 명사형으로 전면 재작성, HDS-21U·HDS-42MU "Audio Extraction" → "오디오 추출 기능", HD-210U EDID "Nothing" → "미사용(Nothing)" |
| HDS-21U 딥 스위치 3번 정정 | 사용자 제공 공식 매뉴얼 Ver.1.0 원본 대조로 3번("분배") 절이 존재하지 않고 출력이 1개뿐이라 성립할 수 없는 기능임을 확인, 0.64.0에서 잘못 반영한 3번 행을 삭제하고 "3번 스위치는 기능이 없다" 안내로 정정 |

- 근거·화면: `docs/qa/DISTRIBUTOR_FRONT_PORTMAP_QA_2026-09-27.md` §7, `docs/qa/PRODUCT_COPY_STYLE_FIX_2026-09-28.md`
- 병합 전 검증: 39/39 단위 테스트, 29종 validator, package-site, 133/133 e2e, `git diff --check` 통과.

## 배포 뒤 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 | `CATALOG BASED · 0.68` |
| `CLAUDE.md` 공개 여부 | HTTP 404(비공개 유지) |

## Rollback

병합 커밋 `11f23fca230addaa0e3eade50cc88b27b7e8fb01`을 revert하는 PR을 만들어 병합한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행하면 0.67.0 화면으로 돌아갑니다.
