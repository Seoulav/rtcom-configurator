# 0.257.0 배포 기록 (2026-10-20)

- PR: #407 "0.257.0 AMX 코드 잠금 비밀번호 변경"
- 병합: squash, main `a9e4687` (`expectedHeadSha` 854913e 고정, GitHub `RTCOM checks / verify` success, 병합 직전 main은 `734a614` 그대로)
- 경위: 사용자가 "AMX커맨드 비밀번호는 (채팅으로 전달한 값)으로 변경해"(2026-10-20)라고 요청했습니다. 직전에 현재 잠금이 그 값과 일치하지 않음을 확인했습니다(0.254.0에서 다른 세션이 비밀번호를 한 번 바꿨고 원문은 기록에 없음). `AMX_LOCK`을 새 비밀번호의 변환값으로 교체했고, 원문은 저장소 어디에도 적지 않았습니다.
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 39358296275, success

## 공개 주소 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 표기 | `CATALOG BASED · 0.257` |
| 공개 `src/control-example.js`·`index.html` | main 파일과 SHA-256 앞 16자리 일치(`efb39f7e64099f47`·`755c2fafdeed03e6`) |
| 공개 `control-example.js`의 `AMX_LOCK` | 새 비밀번호 "일치", 이전 비밀번호(0.239 값) "일치하지 않습니다"(`set-amx-password.cjs --check`) |
| 공개 `CLAUDE.md` | 404 |
| 공개 `docs/` | 404 |

## 로컬 검증 메모

- 단위 테스트 200개 통과, `build-product-index --check` 33개 통과, `e2e-smoke` 288/288 통과, 표기 통일 바뀔 곳 0건, `check-version` 0.256 → 0.257, `git diff --check` 통과.
- 저장소 전체에서 비밀번호 원문 검색 0건(기록 문서에는 요청 문장만 적고 값은 뺐습니다).
- 공개 사이트를 브라우저로 직접 열어 보는 시험은 이 환경의 프록시 인증서 때문에 하지 못해, 공개 파일 해시와 잠금 일치 검사로 확인했습니다.
- 첫 해시 비교는 병합 이전 `origin/main`과 비교해 불일치로 나왔으나, 병합 후 main(`a9e4687`)을 다시 받아 비교하니 일치했습니다.

## 남은 확인 사항

- 이 잠금은 브라우저 안에서 비교하는 "잠금 스티커"입니다(사용자 결정 2026-10-16). 진짜 보안이 필요하면 서버 잠금(Cloudflare Worker)을 따로 정해야 합니다.
