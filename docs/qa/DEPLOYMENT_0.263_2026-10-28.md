# 0.263.0 배포 기록 (2026-10-28)

- PR: #419 "0.263.0 HDS-42MU·HDS-21U 오토 셀렉팅(펌웨어 개선) 3단계 그림"
- 병합: squash, main `a298fa3` (`expectedHeadSha` 9542faa 고정, GitHub `RTCOM checks / verify` success)
  - 병합 직전 main 변화는 없었고, 열린 PR은 이 PR 하나뿐이었습니다.
  - 첫 커밋 `721b48f`의 검사 알림은 병합 근거로 쓰지 않았습니다.
- 경위:
  - 사용자가 알티컴 펌웨어 개선 후 자사 시험 결과(2026-10-28)를 전달하고 쉬운 표현을 요청했습니다.
  - 처음에는 딥 스위치 2번 OFF 카드 안에 그림을 넣었습니다.
  - 사용자 확인("딥스위치와 상관없이 오토셀렉팅이야")을 받고 별도 08 카드로 옮겼습니다. AMX 카드는 09가 되었습니다.
  - ③단계는 사용자 확인("HDMI케이블 뽑으면 이전 소스로 넘어가는거야")대로 직전 소스로 돌아가는 그림입니다.
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 40663571867, success

## 공개 주소 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 표기 | `CATALOG BASED · 0.263` |
| 공개 `index.html`·`src/products.js`·`src/styles.css` | main 빌드와 SHA-256 앞 16자리 일치(`31c88e506ecde46f`·`62b62673908f22bd`·`434a6ffde77ac06a`) |
| 공개 `data/products/hds-42mu.json`·`hds-21u.json` | main 빌드와 일치(`038df39737d24897`·`83884406cbbc97b5`) |
| 공개 `products.js`의 오토 셀렉팅 카드 코드(`autoSelectSection`) | 확인 |
| 공개 `CLAUDE.md` | 404 |
| 공개 `docs/` | 404 |

## 로컬 검증 메모

- PR 병합 전에 다음 검사를 모두 통과했습니다. 자세한 내용은 `docs/implementation/HDS_AUTOSELECT_0.263.md`에 있습니다.
  - 단위 테스트 208개
  - `build-product-index --check` 33개
  - `e2e-smoke` 293/293(08 오토 셀렉팅 카드·AMX 카드 09·휴대폰 넘침 없음)
  - 표기 통일 0건, `dark_tokens --check` 최신
  - `check-version` 0.262 → 0.263, `git diff --check`
- 공개 사이트를 브라우저로 직접 여는 시험은 이 환경의 프록시 인증서 때문에 하지 못했습니다. 대신 공개 파일 해시와 카드 코드가 있는지로 확인했습니다.

## 남은 확인 사항

- 딥 스위치 2번(Priority) 역할 변화와 펌웨어 버전·기존 출고품 업데이트 필요 여부(`docs/handoff/OPEN_ITEMS.md`)
