# 0.70.0 GitHub Pages 배포 기록

- 배포일: 2026-09-28
- 사용자 승인: "현재까지 내용 병합 배포해줘"(2026-09-28)
- 소스 병합: PR #55 → `main` 병합 커밋 `078bc4b38d9324de8b4fdb0f34a2688d5cb706c5`(PR head `ce021148ecaf26e330c749de52605fa9d785a7f8`)
- 배포 방법: `Deploy RTCOM to GitHub Pages`(`.github/workflows/pages.yml`)를 `main`에서 실행
- GitHub Actions run: `36360806511`(run 46), `completed / success`, head_sha가 병합 커밋과 일치
- 공개 URL: `https://seoulav.github.io/rtcom-configurator/`

## 이번에 공개된 내용(0.70.0)

| 작업 | 내용 |
|---|---|
| 구성기 개선 5건 | "섀시" 표기를 "프레임"으로 통일, 블랭크·빈 슬롯 IN/OUT 번호표 강조(입력 파랑·출력 주황, 11px), 카드 팝업 카드별 수량 + "순서대로 장착" 버튼, 02 프레임 선택 아래 "함께 보면 좋은 제품"(시리즈 상세·연동 전송기) 사진 카드 줄 추가, 모든 프레임 빈 슬롯 공패널색을 XDM-12 기준으로 통일 |
| OBHD-2C 매뉴얼 Ver.2.1 반영 | 06 EDID 설정 로터리 번호를 매뉴얼 6쪽 번호표(0 EXTERNAL ~ F RESERVED, 16칸)로 정정하고 "제조사 확인 전" 문구 삭제, EDID 저장 순서·기본값 보완, Tx·Rx 단자 지도를 매뉴얼 원본 사진 기준 합성 사진으로 교체, 05 주요 기능에 EDID 마인더 기능 추가 |
| HD-D102U "스마트 EDID" 문구 정리 | 기능 설명 문장을 단순화 |
| KC 인증 사양 행 삭제 | HD-13U·XDM-CTR100 PSE "04 제품 사양"의 KC 인증 행 제거, HD-D102U 사양표를 HD-13U 행 구조에 맞춰 정리 |

- 병합 전 검증: 39/39 단위 테스트, 29종 validator, package-site, 139/139 e2e, `git diff --check` 통과(PR #55 본문 기준, 이번 세션에서 동일 head sha로 재확인).

## 배포 뒤 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 | `CATALOG BASED · 0.70` |
| `CLAUDE.md` 공개 여부 | HTTP 404(비공개 유지) |

## Rollback

병합 커밋 `078bc4b38d9324de8b4fdb0f34a2688d5cb706c5`을 revert하는 PR을 만들어 병합한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행하면 0.69.0 화면으로 돌아갑니다.
