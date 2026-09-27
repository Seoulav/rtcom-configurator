# 0.69.0 GitHub Pages 배포 기록

- 배포일: 2026-09-28
- 사용자 승인: "병합배포해줘"(2026-09-27)
- 소스 병합: PR #53 → `main` 병합 커밋 `e943dfe53e3c01eb3058e9c07f1726ea4ec66227`(PR head `616349281622d2f521d6f0039a4c893f09aeed96`)
- 배포 방법: `Deploy RTCOM to GitHub Pages`(`.github/workflows/pages.yml`)를 `main`에서 실행
- GitHub Actions run: `36356665370`(run 45), `completed / success`, head_sha가 병합 커밋과 일치
- 공개 URL: `https://seoulav.github.io/rtcom-configurator/`

## 이번에 공개된 내용(0.69.0)

| 작업 | 내용 |
|---|---|
| HDS-21U·HDS-42MU EDID 안내 문구 정리 | "06 EDID 설정" 안내 문장 "전면 로터리 스위치를 원하는 EDID 번호에 맞춘다(10번=A, 11번=B)."에서 괄호 설명을 완전히 제거하고 "전면 로터리 스위치를 원하는 EDID 번호에 맞춘다."로 정리(실제 로터리 스위치에는 0-9·A·B만 인쇄되어 있고 "10"·"11" 표기가 없어 실물과 맞지 않는 오해를 줄 수 있다는 지적 반영). EDID 코드표 자체(0-9, A, B 표기)는 변경하지 않음 |

- 병합 전 검증: 39/39 단위 테스트, 29종 validator, package-site, 133/133 e2e, `git diff --check` 통과.

## 배포 뒤 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 | `CATALOG BASED · 0.69` |
| `CLAUDE.md` 공개 여부 | HTTP 404(비공개 유지) |

## Rollback

병합 커밋 `e943dfe53e3c01eb3058e9c07f1726ea4ec66227`을 revert하는 PR을 만들어 병합한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행하면 0.68.0 화면으로 돌아갑니다.
