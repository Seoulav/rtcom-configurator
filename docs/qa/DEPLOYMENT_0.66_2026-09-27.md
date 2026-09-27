# 0.66.0 GitHub Pages 배포 기록

- 배포일: 2026-09-27
- 사용자 승인: "OBHD-2C 포함해서 올리자"(OBHD-2C 06 EDID 설정은 0.65.0에서 이미 공개, 이번 배포에서도 그대로 유지)
- 소스 병합: PR #48 → `main` 병합 커밋 `a1b125437ba443867c13ceff8d750c2248ecb35e`(PR head `6360563cb45614e232fe41d31388de578bf06609`)
- 배포 방법: `Deploy RTCOM to GitHub Pages`(`.github/workflows/pages.yml`)를 `main`에서 실행
- GitHub Actions run: `36345557041`(run 42), `completed / success`, head_sha가 병합 커밋과 일치
- 공개 URL: `https://seoulav.github.io/rtcom-configurator/`

## 이번에 공개된 내용(0.66.0)

| 작업 | 내용 |
|---|---|
| XDM-CTR100·CTR100 PSE 06 딥 스위치 설정 | 매뉴얼 Ver.1.4 5쪽: 검은 몸체 4핀, 아래쪽 ON, 1·2번 TX/RX 모드 조합, 3번 Normal/Long Reach(1080p 150m), 4번 사용 안 함 |
| CTR100·PSE 04 사양 공통 표기 정리 | 다른 세션 작업(`0bb05a1`) |
| "지원 케이블" → "권장 케이블" | CTR100·PSE·CT103/CR103 04 사양 전송 행 이름 |
| 분배기 4종 정면 번호 | HD-13U·HD-104U·HD-108U·HD-210U 02 Port Map을 앞면·뒷면 합성 사진 한 장으로, 정면 EDID/MODE 로터리·SET·MODE 딥 스위치에 번호 |

- 근거·화면: `docs/qa/CTR100_DIP_SWITCH_QA_2026-09-27.md`, `docs/qa/DISTRIBUTOR_FRONT_PORTMAP_QA_2026-09-27.md`
- 병합 전 검증: 39/39 단위 테스트, 29종 validator, package-site, 131/131 e2e, `git diff --check` 통과.
- 남은 확인: OBHD-2C MODE 로터리 번호(매뉴얼 표 순서 기준 추정, 카드에 "제조사 확인 전" 표시)는 제조사 답을 받은 뒤 고칩니다(`docs/qa/OBHD2C_EDID_ROTARY_QA_2026-09-27.md`).

## 배포 뒤 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 | `CATALOG BASED · 0.66` |
| 공개 파일 대조 | `main`(a1b1254)에서 만든 `dist/`와 공개 파일 SHA-256 **202/202 일치**(`.nojekyll` 제외) |
| 비공개 파일 | `CLAUDE.md`·`README.md`·`CHANGELOG.md`·`AGENTS.md`·`docs/qa/`·`.source-materials/`·`scripts/package-site.cjs` 모두 HTTP 404 |
| 브랜치 배포(`pages build and deployment`) | 이번 병합 뒤에도 실행 없음 |

## Rollback

병합 커밋 `a1b125437ba443867c13ceff8d750c2248ecb35e`를 revert하는 PR을 만들어 병합한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행하면 0.65.0 화면으로 돌아갑니다.
