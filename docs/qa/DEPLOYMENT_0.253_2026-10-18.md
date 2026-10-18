# 0.253.0 배포 기록 (2026-10-18)

- PR: #401 "0.253.0 AMX 장비 IP 칸에 기본값 192.168.1.141 채움"
- 병합: squash, main `f6268d1` (`expectedHeadSha` 1c4435b 고정, GitHub `RTCOM checks / verify` success, 병합 직전 main은 `d46b839` 그대로)
- 경위: 사용자가 "qms-88ux 제어시 디폴트 ip 192.168.1.141이 안되어 있어 알티컴 lan제어 전제품 동일하게 디폴트아이피 넣어줘"(2026-10-18)라고 요청했습니다. 0.252에서 AMX 코드의 `cDeviceIp`에는 이미 기본값이 들어갔지만 IP 입력 칸은 흐린 안내 글자(placeholder)로만 보여 비어 있는 것처럼 보였습니다. LAN 제어 제품 5종(XDM·SPX·VDM·QMS-44UX·QMS-88UX)의 칸에 실제 값이 들어가게 고쳤습니다.
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 39132505345, success

## 공개 주소 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 표기 | `CATALOG BASED · 0.253` |
| 공개 `src/control-example.js`·`index.html`·`data/products/qms-88ux.json` | main 파일과 SHA-256 앞 16자리 일치(`498057092ecb89d3`·`a90e0bf84faa71f0`·`51a6f6c0644c6e7c`) |
| 공개 `CLAUDE.md` | 404 |
| 공개 `docs/` | 404 |

## 로컬 검증 메모

- 단위 테스트 187개 통과(5종 제품 IP 칸 기본값 새 테스트 포함), `build-product-index --check` 33개 통과, `e2e-smoke` 285/285 통과, 표기 통일 바뀔 곳 0건, `check-version` 0.252 → 0.253, `git diff --check` 통과.
- 공개 사이트를 브라우저로 직접 열어 보는 시험은 이 환경의 프록시 인증서 때문에 하지 못해, 공개 파일 해시를 main과 비교해 확인했습니다.

## 남은 확인 사항

- 기본값 192.168.1.141을 알티컴 전 제품 공통 기본 IP로 적었습니다(사용자 지시). 알티컴 공식 회신으로 확인한 값은 아니므로, 알티컴 회신 대기 항목(`docs/handoff/RTCOM_QUESTIONS_2026-10-16.md`)과 함께 확인합니다.
