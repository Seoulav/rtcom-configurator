# 0.58.0 후속(EDID 카드 레이아웃 버그 수정) GitHub Pages 배포 기록

- 배포일: 2026-09-27
- 사용자 요청: "06 EDID설정 깨진ㄷ." + "로터리 스위치 표기 인덱스로 위로올라가서 짤리고" + "EDID 표가 너무 크게 차지하는데 이거는 좌우표를 펼쳐서하면 줄여줘" + "배포해줘"
- 소스 병합: PR #38 → `main` 병합 커밋 `8b19349d9d69f82f9da1d181cd8d85e9041d0da3`
- 배포 방법: `Deploy RTCOM to GitHub Pages`(`.github/workflows/pages.yml`)를 `main`에서 실행
- GitHub Actions run: `36326287821`, `completed / success`
- 공개 URL: `https://seoulav.github.io/rtcom-configurator/`

## 이번에 공개된 내용(버전 번호는 그대로 0.58.0, 화면 표기는 0.58)

- **EDID 로터리 태그 잘림 수정**: "EDID 로터리 스위치" 태그가 사진 컨테이너의 `overflow:hidden`에 가려 위쪽이 잘리던 문제. 사진 테두리 둥글림을 컨테이너 대신 `<img>` 자체에 주고 컨테이너 위쪽에 여백(22px)을 둬서 해결.
- **06 EDID 카드 빈 공간 버그 수정**: 0.56.0에서 "06 카드를 05 옆으로" 옮긴 규칙이 edidSwitch(사진+안내 2장+코드표 최대 16행)에도 적용돼, 좁은 칸(360px)에 밀어넣으면 반대쪽 칸(02·03·기록)에 최대 1500px 이상 빈 공간이 남는 문제를 발견. edidSwitch는 항상 전체 폭 아래로 되돌리고, videoModes·audioMux처럼 짧은 카드만 계속 05 옆에 두도록 규칙을 좁혔습니다.
- **EDID 코드표 좌우 분할**: 코드표가 6행을 넘으면(HD-13U 16행, HDS-21U/42MU 12행 등) 좌우 두 표로 나눠 카드 세로 길이를 절반 가까이 줄였습니다. 560px 이하 화면에서는 한 칸으로 되돌아갑니다.
- (같은 배치에 병합된 다른 세션 작업) EDID 설정 카드에 로터리 대표 설정 그림 추가(0.59.0) — 이 세션 작업 이후 별도로 병합됨.

## 병합 전 검증(`01d6cce`, PR #38 head)

- `node --test tests/*.test.cjs`: 39/39
- `node scripts/build-product-index.cjs --check`: 28종 검증 통과
- `node scripts/package-site.cjs`: 통과
- `node scripts/e2e-smoke.cjs`: 102/102(코드표 분할·칸 높이 차이 검증 2건 추가)
- `git diff --check`: 통과
- HD-13U(코드표 16행)·HDS-21U(12행) 스크린샷으로 칸 높이 균형과 태그 표시를 직접 확인

## 병합 뒤 확인(다른 세션의 0.59.0 병합분 포함, `c4696df`)

- `node --test tests/*.test.cjs`: 39/39
- `node scripts/build-product-index.cjs --check`: 28종 검증 통과
- `node scripts/e2e-smoke.cjs`: 105/105

## 배포 뒤 확인

| 항목 | 결과 |
|---|---|
| 화면 버전(배포 시점) | `CATALOG BASED · 0.58`(이 배치는 버전 번호를 올리지 않음) |
| `CLAUDE.md` 공개 여부 | HTTP 404(비공개, `dist/`만 배포됨 확인) |
| Actions run | `36326287821`, `success`, head_sha가 병합 커밋과 일치 |

## Rollback

병합 커밋 `8b19349d9d69f82f9da1d181cd8d85e9041d0da3`를 revert하는 PR을 만들면 06 EDID 카드가 다시 05 옆(빈 공간 버그 있는 상태)으로 돌아갑니다. Pages만 되돌리려면 직전 배포 커밋(0.58.0, `856dc62` 계열)에 태그를 만들고 그 태그로 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다.
