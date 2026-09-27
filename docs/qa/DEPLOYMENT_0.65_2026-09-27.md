# 0.65.0 GitHub Pages 배포 기록

- 배포일: 2026-09-27
- 사용자 승인: "업데이트 병합 후 올려"
- 소스 병합: PR #46 → `main` 병합 커밋 `ca547f632fb387647526135ccb160a6f6dd19d97`(PR head `eb23a1d4a959fbc39929cd79e92b04c90971dbc7`)
- 배포 방법: `Deploy RTCOM to GitHub Pages`(`.github/workflows/pages.yml`)를 `main`에서 실행
- GitHub Actions run: `36344724542`(run 41), `completed / success`, head_sha가 병합 커밋과 일치
- 공개 URL: `https://seoulav.github.io/rtcom-configurator/`

## 이번에 공개된 내용(0.65.0)

| 작업 | 내용 |
|---|---|
| OBHD-2C 06 EDID 설정 | 송신기 전면 사진(카탈로그 41쪽에서 잘라냄)에 MODE 로터리 위치 표시, EDID Library 14종을 로터리 그림 0~D 전체 14칸과 코드표로, EDID S/W 버튼 저장(Emulation) 순서 추가. 로터리 번호는 매뉴얼 표 순서 기준 추정이며 제조사 확인 전(카드 설명에 명시) |
| XDM-CT103/CR103 04 제품 사양 정리 | CT103·CR103 각각 있던 동일한 "전원(어댑터)" 행(카드 이름만 다름)을 하나의 공통 행으로 통합 |

- 근거·화면: `docs/qa/OBHD2C_EDID_ROTARY_QA_2026-09-27.md`, `docs/qa/obhd-edid-screens/`
- 병합 전 검증: 39/39 단위 테스트, 29종 validator, package-site, 125/125 e2e, `git diff --check` 통과.

## 배포 뒤 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 | `CATALOG BASED · 0.65` |
| 비공개 파일(`CLAUDE.md`) | HTTP 404 |
| 브랜치 배포(`pages build and deployment`) | 이번 병합 뒤에도 실행 없음(GitHub Actions 배포 run 41만 실행) |

## Rollback

병합 커밋 `ca547f632fb387647526135ccb160a6f6dd19d97`를 revert하는 PR을 만들어 병합한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행하면 0.64.0 화면으로 돌아갑니다.
