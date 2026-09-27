# 0.58.0 GitHub Pages 배포 기록

- 배포일: 2026-09-27
- 사용자 요청: "hds42mu 21u 딥스위치 로터리 하단에 상세하게 표기좋게 수정" + "05주요 기능에 hdmi특정포토 번호 1~4번 입력 시 우선순위 절체 이런 식으로 표현해줘" + "모든 세션의 업데이트 확인하고 병합해서 깃허브에 올려줘" + "배포해줘"
- 소스 병합: PR #37 → `main` 병합 커밋 `856dc62ac9829839bdf952f90c43574bcd98f6f3`
- 배포 방법: `Deploy RTCOM to GitHub Pages`(`.github/workflows/pages.yml`)를 `main`에서 실행
- GitHub Actions run: `36325201554`, `completed / success`
- 공개 URL: `https://seoulav.github.io/rtcom-configurator/`

## 이번에 공개된 버전(0.58.0, 여러 세션 공동 작업)

| 작업 | 내용 |
|---|---|
| 이 세션 | HDS-21U·HDS-42MU 단자 지도에 MODE 딥 스위치 핀 추가(전원 앞), Priority "05 주요 기능"에 입력 포트 번호 명시(21U: 1·2번 중 1번, 42MU: 1~4번 중 1번) |
| 다른 세션 | HDS-21U·HDS-42MU "07 오디오 설정"을 딥 스위치 설정 카드로 개편, 매트릭스 "02 신호 흐름"을 크로스포인트(출력마다 입력 선택) 방식으로 재작성, HDS-42MU 정면 사진의 잘못 인쇄된 실크(MODE·EDID 표기가 반대로 인쇄됨)를 사진 합성 단계에서 바로잡음 |

- 이 세션에서 작업하던 중 다른 세션이 같은 브랜치에 4개 커밋(0.58.0 배치)을 먼저 올려, `git fetch` + fast-forward 병합으로 받아왔습니다(충돌 없음). 특히 HDS-42MU의 MODE/EDID 라벨이 사진상 반대로 보이는 문제를 이 세션에서도 인지했으나 근거 부족으로 보류했던 것을, 다른 세션이 사용자 확인을 거쳐 사진 자체를 수정하는 방식으로 해결했습니다.
- 병합된 브랜치를 이 세션에서 다시 검증했습니다: 39/39, 28종, e2e 100/100.

## 병합 전 검증(`b7bd3e8`, PR #37 head)

- `node --test tests/*.test.cjs`: 39/39
- `node scripts/build-product-index.cjs --check`: 28종 검증 통과
- `node scripts/package-site.cjs`: 통과
- `node scripts/e2e-smoke.cjs`: 100/100
- `git diff --check`: 통과

## 배포 뒤 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 | `CATALOG BASED · 0.58` |
| `CLAUDE.md` 공개 여부 | HTTP 404(비공개, `dist/`만 배포됨 확인) |
| Actions run | `36325201554`, `success`, head_sha가 병합 커밋과 일치 |

## Rollback

병합 커밋 `856dc62ac9829839bdf952f90c43574bcd98f6f3`를 revert하는 PR을 만들면 `main`이 0.57.0 상태로 돌아갑니다. Pages만 되돌리려면 직전 배포 커밋(0.57.0)에 태그를 만들고 그 태그로 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다.
