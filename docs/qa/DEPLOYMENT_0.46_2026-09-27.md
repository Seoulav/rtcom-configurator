# 0.46.0 GitHub Pages 배포 기록

- 배포일: 2026-09-27
- 사용자 승인: "배포"(2026-09-27)
- 소스 병합: PR #27 → `main` 병합 커밋 `3903cc58c8e3109c914beb24d35b62234bface07`
  - 이 세션: XDM-CTR100 딥 스위치·단자 역할(PSE 제품 안내서, CTR100 매뉴얼 Ver.1.4), XDM-CR103 매뉴얼 Ver.1.1, 송신기·수신기 단자 번호 통일, 0.45 배포 기록
  - 다른 세션: 제품 목록 카드의 카탈로그 쪽수 표기 제거(`6b9b262`, 사용자 요청 "카탈로그 몇쪽 다 빼줘"). 병합 직전에 올라와 함께 검증했습니다.
- 공개 URL: `https://seoulav.github.io/rtcom-configurator/`

## 병합 전 검증(`fbcdd08`)

- `node --test tests/*.test.cjs`: 37/37
- `node scripts/build-product-index.cjs --check`: 27종
- `node scripts/package-site.cjs`: 통과
- `node scripts/e2e-smoke.cjs`: 84/84
- `git diff --check`: 통과

## 배포 순서(0.45 문제 재발 방지)

1. 병합하면 GitHub 기본 브랜치 배포(`pages build and deployment`, run `36310167219`)가 자동으로 돌아 저장소 전체를 올립니다. 09:41:23에 시작해 09:42:05에 끝났고, 공개 주소의 `CLAUDE.md`가 200이 된 것으로 끝남을 확인했습니다.
2. 그 뒤에 `Deploy RTCOM to GitHub Pages`(run `36310206338`, 실행 번호 24)를 실행했습니다. 09:42:08에 시작해 09:42:34에 끝났고, 결과는 success입니다.

## 배포 뒤 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 | `CATALOG BASED · 0.46` |
| 배포 파일 일치 | 로컬 `dist/`(main과 같은 내용) 187개를 공개 주소에서 받아 SHA-256 비교: 187/187 같음 |
| 배포하지 않을 파일 | 카탈로그 PDF, `CLAUDE.md`, `README.md`, QA 문서, `.source-materials` 매뉴얼 모두 404 |

## 남은 운영 과제

Settings → Pages → Source를 GitHub Actions로 바꾸기 전까지는, 이 기록 PR처럼 문서만 바뀐 병합이라도 병합 뒤 브랜치 배포가 저장소 전체를 다시 올립니다. 따라서 병합 뒤에는 위 순서대로 배포 작업을 다시 실행해야 합니다.

## Rollback

직전 배포 커밋 `13ddf34`(0.45.0)에 태그를 만들고 그 태그로 배포 작업을 실행합니다. `main`까지 되돌리려면 병합 커밋 `3903cc5`를 revert하는 PR을 만듭니다. 0.46.0은 저장 형식을 바꾸지 않았습니다.
