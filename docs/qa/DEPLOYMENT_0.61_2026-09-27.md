# 0.61.0 GitHub Pages 배포 기록

- 배포일: 2026-09-27
- 사용자 승인: "배포"
- 소스 병합: PR #41 → `main` 병합 커밋 `9b4cbc188b016a26803ff9e65fe2e90203a49402`(PR head `5cebc5e2f6e2fcd53eff2115e9691ac981cc2a6a`)
- 배포 방법: `Deploy RTCOM to GitHub Pages`(`.github/workflows/pages.yml`)를 `main`에서 실행
- GitHub Actions run: `36329047155`(run 37), `completed / success`, head_sha가 병합 커밋과 일치
- 공개 URL: `https://seoulav.github.io/rtcom-configurator/`

## 이번에 공개된 내용(0.61.0)

| 작업 | 내용 |
|---|---|
| HD-13U 07 오디오 설정 | 06 EDID 다음 전체 폭으로 옮겨 추출 칸 잘림·07 → 06 번호 뒤집힘 수정. EDID 대표 설정과 같은 칸 4개(MODE 로터리 0번 → SET 누름 → 병합 OUT 1 깜빡임·추출 깜빡이지 않음) |
| HD-210U 07 딥 스위치 설정 | 매뉴얼 Ver.1.2 7쪽: 1번 오디오 병합(OFF HDMI Audio / ON 3.5mm 믹스), 2번 DDC(OFF Buffer / ON Level Shifter), "병합만 되고 추출은 없다" 안내 |
| 기록 | 0.60.0 배포 기록 |

- 근거·화면: `docs/qa/HD13U_AUDIO_HD210U_DIP_QA_2026-09-27.md`
- 병합 전 검증: 39/39 단위 테스트, 28종 validator, package-site, 113/113 e2e, `git diff --check` 통과.

## 배포 뒤 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 | `CATALOG BASED · 0.61` |
| 공개 파일 대조 | `main`(9b4cbc1)에서 만든 `dist/`와 공개 파일 SHA-256 **192/192 일치**(`.nojekyll` 제외) |
| 비공개 파일 | `CLAUDE.md`·`README.md`·`CHANGELOG.md`·`AGENTS.md`·`docs/qa/…`·`.source-materials/…`·`scripts/…` 모두 HTTP 404 |
| 브랜치 배포(`pages build and deployment`) | 이번 병합 뒤에도 실행 없음 |

## Rollback

병합 커밋 `9b4cbc188b016a26803ff9e65fe2e90203a49402`를 revert하는 PR을 만들어 병합한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행하면 0.60.0 화면으로 돌아갑니다.
