# 0.264.0 배포 기록 (2026-11-16)

- PR: #422 "0.264.0 머리의 "AV Portal에서 제품 찾기" 링크 삭제"
- 병합: squash, main `55d2f3f` (`expectedHeadSha` fd9e738 고정, GitHub `RTCOM checks / verify` success)
  - 병합 직전 main 변화는 없었고, 열린 PR은 이 PR 하나뿐이었습니다.
- 경위: 사용자 요청(2026-11-16 "AV 포탈에서 제품 찾기 링크는 이번에 지워줘")
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 43805064802, success
- 이 배포 기록은 다음 기능 묶음 PR(0.265)에 함께 실었습니다.

## 공개 주소 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 표기 | `CATALOG BASED · 0.264` |
| 공개 `index.html`·`src/styles.css` | main 빌드와 SHA-256 앞 16자리 일치(`915ec469ebf84c41`·`7962ddccee5d18f3`) |
| 공개 첫 화면의 "AV Portal에서 제품 찾기" | 0건 |
| 공개 `CLAUDE.md` | 404 |

## 로컬 검증 메모

- PR 병합 전에 다음 검사를 모두 통과했습니다.
  - 단위 테스트 208개
  - `build-product-index --check` 33개
  - `e2e-smoke` 293/293
  - 표기 통일 0건, `dark_tokens --check` 최신
  - `check-version` 0.263 → 0.264
- 공개 사이트를 브라우저로 직접 여는 시험은 이 환경의 프록시 인증서 때문에 하지 못했습니다. 대신 공개 파일 해시와 문구 검색으로 확인했습니다.

## 남은 확인 사항

- 없음.
