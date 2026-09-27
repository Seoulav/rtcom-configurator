# 0.67.0 GitHub Pages 배포 기록

- 배포일: 2026-09-27
- 사용자 승인: "2개 세션 다 끝나면 병합배포해"(2026-09-27)
- 소스 병합: PR #49 → `main` 병합 커밋 `0d258399a2f3f9e5723094af2e546ad0bd42356c`(PR head `9ead04e9fd22b8bda1bb0d2bdb7854b227a0df09`)
- 배포 방법: `Deploy RTCOM to GitHub Pages`(`.github/workflows/pages.yml`)를 `main`에서 실행
- GitHub Actions run: `36346105885`(run 43), `completed / success`, head_sha가 병합 커밋과 일치
- 공개 URL: `https://seoulav.github.io/rtcom-configurator/`

## 이번에 공개된 내용(0.67.0)

| 작업 | 내용 |
|---|---|
| QMS-88UX 출력 9번 "8분할(비율무시)" | 06 화면 구성 모드 QUAD 레이아웃 목록 13번째 항목으로 추가(매뉴얼 22~23쪽 Output Option 2·3 근거), 4×2 균등 8칸 도해 미리보기 |
| 분배기 4종 다단 증폭 최대 3단 | HD-13U·HD-104U·HD-108U·HD-210U 05 주요 기능에 "다단 증폭(캐스케이드 연결) 최대 3단 지원" 추가(출처 U, 서울영상테크 SI사업본부 확인) |

- 근거·화면: `docs/qa/QMS88UX_8SPLIT_QA_2026-09-27.md`, `docs/qa/DISTRIBUTOR_CASCADE_QA_2026-09-27.md`
- 병합 전 검증: 39/39 단위 테스트, 29종 validator, package-site, 132/132 e2e, `git diff --check` 통과.
- 이 병합에는 이전 세션에서 이미 완료한 0.66.0 배포 기록 문서(`docs/qa/DEPLOYMENT_0.66_2026-09-27.md`)도 함께 포함되어 올라갔습니다(0.67.0 자체 변경 사항은 아님).

## 배포 뒤 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 | `CATALOG BASED · 0.67` |
| 공개 파일 대조 | `main`(0d25839)에서 만든 `dist/`와 공개 파일 SHA-256 **202/202 일치**(`.nojekyll` 제외) |
| 비공개 파일 | `CLAUDE.md`·`README.md`·`CHANGELOG.md`·`AGENTS.md`·`docs/qa/`·`.source-materials/`·`scripts/package-site.cjs` 모두 HTTP 404 |
| 브랜치 배포(`pages build and deployment`) | 이번 병합 뒤에도 실행 없음(가장 최근 실행은 run 24, 0.46.0 병합 당시) |

## Rollback

병합 커밋 `0d258399a2f3f9e5723094af2e546ad0bd42356c`를 revert하는 PR을 만들어 병합한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행하면 0.66.0 화면으로 돌아갑니다.
