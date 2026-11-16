# 0.266.0 배포 기록 (2026-11-16)

- PR: #425 "0.266.0 AMX 코드 비밀번호 잠금 제거"
- 병합: squash, main `19fbe5c` (`expectedHeadSha` 967d766 고정, GitHub `RTCOM checks / verify` success)
  - 병합 직전 main 변화는 없었고, 열린 PR은 이 PR 하나뿐이었습니다.
- 경위: 사용자 요청(2026-11-16 "AMX 관련돼서 비밀번호 잠겨 있는데 그 비밀번호 그냥 없이 그냥 다 풀어서 보여줘")
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 43831001437, success

## 공개 주소 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 표기 | `CATALOG BASED · 0.266` |
| 공개 `index.html`·`src/control-example.js`·`src/styles.css` | main 빌드와 SHA-256 앞 16자리 일치(`bb9ff22713d175a4`·`88b76245e88d376e`·`29dcb8045261c390`) |
| 공개 `control-example.js`의 잠금 코드(`AMX_LOCK`·비밀번호 입력 칸) | 0건 |
| 공개 `CLAUDE.md` | 404 |

## 로컬 검증 메모

- PR 병합 전에 다음 검사를 모두 통과했습니다. 자세한 내용은 `docs/implementation/REMOVE_AMX_LOCK_0.266.md`에 있습니다.
  - 단위 테스트 207개
  - `build-product-index --check` 33개
  - `e2e-smoke` 293/293(HDS·XDM AMX 코드가 바로 보임)
  - 표기 통일 0건, `dark_tokens --check` 최신
  - `check-version` 0.265 → 0.266
- 공개 사이트를 브라우저로 직접 여는 시험은 이 환경의 프록시 인증서 때문에 하지 못했습니다. 대신 공개 파일 해시와 잠금 코드가 없는지로 확인했습니다.

## 남은 확인 사항

- 없음.
