# 0.59.0 GitHub Pages 배포 기록

- 배포일: 2026-09-27
- 사용자 요청: "모든 세션 병합 배포해줘"
- 소스 병합: PR #39 → `main` 병합 커밋 `06e230b41aad5e8b45fc185ba6e7c8c516499945`
- 배포 방법: `Deploy RTCOM to GitHub Pages`(`.github/workflows/pages.yml`)를 `main`에서 실행
- GitHub Actions run: `36326967998`, `completed / success`
- 공개 URL: `https://seoulav.github.io/rtcom-configurator/`

## 이번에 공개된 버전(0.59.0, 여러 세션 공동 작업)

| 작업 | 내용 |
|---|---|
| 다른 세션 | EDID 설정 카드에 로터리 대표 설정 그림 추가(EDID_ROTARY_EXAMPLES_QA 문서·스크린샷 포함), 화면 버전 0.59로 갱신 |
| 이 세션 | (이전 배치, 이미 main에 있던 것) EDID 로터리 태그 잘림 수정·06 EDID 카드 전체 폭 복귀·코드표 좌우 분할 |
| 다른 세션 | EDID 코드표 세로 크기 추가 축소(줄 여백 9px→3px, 코드 칸 44px) |

- PR #39는 다른 세션이 이미 draft로 만들어 둔 것을 그대로 사용했습니다(같은 head sha, 범위가 이 세션이 기대한 것보다 넓었지만 실제 브랜치 diff와 일치해 그대로 병합).
- 병합 전 이 세션에서 검증: 39/39 단위테스트, 28종 검증, 105/105 e2e 통과.

## 배포 뒤 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 | `CATALOG BASED · 0.59` |
| `CLAUDE.md` 공개 여부 | HTTP 404(비공개, `dist/`만 배포됨 확인) |
| Actions run | `36326967998`, `success`, head_sha가 병합 커밋과 일치 |

## Rollback

병합 커밋 `06e230b41aad5e8b45fc185ba6e7c8c516499945`를 revert하는 PR을 만들면 `main`이 0.58.0 상태로 돌아갑니다. Pages만 되돌리려면 직전 배포 커밋(0.58.0 계열)에 태그를 만들고 그 태그로 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다.
