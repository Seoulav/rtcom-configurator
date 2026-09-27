# 0.45.0 GitHub Pages 배포 기록

- 배포일: 2026-09-27
- 사용자 승인: "다른 세션까지 합쳐서 올려줘"(2026-09-27)
- 소스 병합: PR #26 → `main` 병합 커밋 `13ddf34fd2a91b2b3b8ad3b09ce38719cf1ed5c3`(0.40~0.45, 다른 세션의 0.40·0.41·0.43·0.44 포함)
- 배포 방법: `Deploy RTCOM to GitHub Pages`(`.github/workflows/pages.yml`)를 `main`에서 실행
- GitHub Actions run: `36309139760`(실행 번호 22), 다시 실행한 run(실행 번호 23)
- 결과: 모두 `completed / success`
- 공개 URL: `https://seoulav.github.io/rtcom-configurator/`

## 병합 전 검증(`3e9f625`)

- `node --test tests/*.test.cjs`: 37/37
- `node scripts/build-product-index.cjs --check`: 27종
- `node scripts/package-site.cjs`: 통과
- `node scripts/e2e-smoke.cjs`: 84/84
- `git diff --check`: 통과

## 배포 중 발생한 문제: 저장소 전체가 사이트를 덮어씀

### 현상

첫 배포(실행 번호 22)가 끝난 뒤 공개 주소를 점검했습니다. 배포하지 않아야 할 파일이 200으로 열렸습니다.

- `docs/RTcom_catalogue_2026_46p.pdf`
- `CLAUDE.md`
- `docs/qa/…`

### 원인

이 저장소에는 사이트 배포가 두 가지 돌고 있습니다.

| 이름 | 계기 | 올리는 것 |
|---|---|---|
| `Deploy RTCOM to GitHub Pages`(우리 배포 작업) | 직접 실행 | 검사를 마친 `dist/`만 |
| `pages build and deployment`(GitHub 기본 브랜치 배포) | `main`에 push·병합될 때마다 자동 | 저장소 전체 |

이번에는 브랜치 배포(09:22:00 시작, 09:22:48 종료)가 우리 배포 작업(09:22:04 시작, 09:22:34 종료)보다 늦게 끝났습니다. 그래서 저장소 전체가 마지막으로 올라갔습니다.

기록상 PR #25(문서만) 병합 때도 브랜치 배포만 돌았습니다(08:23:54 종료). 따라서 **08:23부터 09:22까지도 저장소 전체가 사이트에 올라가 있었을 가능성이 큽니다.**

### 조치

- 우리 배포 작업을 다시 실행했습니다(실행 번호 23). 그 뒤 카탈로그 PDF, `CLAUDE.md`, 문서, 시안이 모두 404로 돌아왔습니다.
- 로컬 `dist/` 파일 186개를 공개 주소에서 받아 SHA-256을 비교했고, **186/186 같음**을 확인했습니다.

### 영향 판단

`Seoulav/rtcom-configurator`는 공개(public) 저장소입니다. 사이트에 잠시 올라간 파일은 GitHub 저장소 화면에서도 원래 누구나 볼 수 있는 파일입니다. 따라서 새로 노출된 정보는 없습니다. 사용자 제공 매뉴얼 PDF는 `.source-materials/`(Git 제외)에만 있어 어느 쪽에도 올라가지 않았습니다(`/.source-materials/…` 404 확인).

### 재발 방지(사용자 조치 필요)

저장소 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 바꾸면 브랜치 배포가 더는 돌지 않습니다. 이 설정은 이 세션의 도구로 바꿀 수 없습니다. 바꾸기 전까지는 `main` 병합 뒤 반드시 우리 배포 작업을 실행하고, `CLAUDE.md`가 404인지 확인합니다(`CLAUDE.md` 저장소 역할 항목에 적음).

## 배포 뒤 확인(실행 번호 23 이후)

| 항목 | 결과 |
|---|---|
| 화면 버전 | `CATALOG BASED · 0.45` |
| 배포 파일 일치 | 186/186 같음 |
| 배포하지 않을 파일 | 카탈로그 PDF, `CLAUDE.md`, `README.md`, QA 문서, 시안, `.source-materials` 모두 404 |

## Rollback

직전 배포 커밋 `5ceeb27`(0.39.0)에 태그를 만들고, 그 태그로 우리 배포 작업을 다시 실행합니다. `main`까지 되돌리려면 병합 커밋 `13ddf34`를 revert하는 PR을 만듭니다. 0.40~0.45는 저장 형식을 바꾸지 않았습니다.
