# 0.252.0 배포 기록 (2026-10-18)

- PR: #398 "0.252.0 AMX 예시 장비 IP를 192.168.1.141로"
- 병합: squash, main `e30ac3d` (`expectedHeadSha` 6e2ce64 고정, GitHub `RTCOM checks / verify` success, 병합 직전 main은 `ec953b8` 그대로)
- 경위: 사용자가 "AMX예시쪽에 192.168.1.141로 전부 반영했어?"(2026-10-18)라고 물어 아직 반영하지 않았음(예시 주소 `192.168.1.100`)을 확인하고 요청대로 바꿨습니다. 앞서 회사 내부 IP 사용 순서는 사내 정보라 저장소에 적지 않기로 했으므로, 화면의 `192.168.1.141`은 "예시 주소"로만 표시합니다.
- 직전 문서 PR(#397, 0.251.0 배포 기록과 알티컴 통합 메일 발송 기록)은 `ec953b8`로 병합했고 재배포(run 39092644598) 뒤 `CLAUDE.md`·`docs/qa/` 404를 확인했습니다.
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 39093001989, success (`pages build and deployment` 실행은 보이지 않음)

## 공개 주소 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 표기 | `CATALOG BASED · 0.252` |
| 공개 `src/control-example.js`·`index.html`·`data/products/xdm.json` | main 파일과 SHA-256 앞 12자리 일치(`6a11058fd0e9`·`3a51c9298c87`·`1a9726511deb`) |
| 공개 `control-example.js`의 `DEFAULT_IP='192.168.1.141'` | 1건 확인 |
| 공개 `CLAUDE.md` | 404 |
| 공개 `docs/qa/` | 404 |

## 로컬 검증 메모

- 단위 테스트 186개 통과(예시 주소 기대값 141로 갱신), `build-product-index --check` 33개 통과, `e2e-smoke` 285/285 통과, 표기 통일 바뀔 곳 0건, `check-version` 0.251 → 0.252, `git diff --check` 통과.
- 공개 사이트를 브라우저로 직접 열어 보는 시험은 이 환경의 프록시 인증서 때문에 하지 못해, 공개 파일 해시를 main과 비교해 확인했습니다.

## 남은 확인 사항

- 장비가 여러 대일 때 장비마다 다른 주소를 자동으로 나누지는 않습니다. IP 칸은 제품(시리즈)마다 하나이고 이 브라우저에 기억됩니다. 필요하면 장비별 IP 칸을 만드는 것을 다음 단계로 제안했습니다.
- 알티컴 확인 대기 11건(2026-10-18 통합 메일로 발송): `docs/handoff/RTCOM_QUESTIONS_2026-10-16.md`의 "전체 회신 대기 현황".
