# LAN 제품 IP 설정 방식·DHCP, FT101-U 입력 수 확인 반영 (0.251.0)

## 1. 요청과 결정

- 사용자 확인 2026-10-18: 알티컴 질의서 20번(A-1)의 질문 중 두 가지에 답했습니다. "IP는 커맨드로 바꿀 수 없고 장비에서 직접 바꿔야 해, DHCP는 지원해"(대상 XDM·VDM·SPX·QMS-44UX·QMS-88UX 모두).
- 해석: "IP로 바꿀 수는 없고"는 "커맨드로 바꿀 수는 없고"로 읽었습니다(질문이 "IP를 커맨드로도 바꿀 수 있습니까?"였고 "장비에서 직접 바꿔야 해"가 이어짐).
- 이어서 확인(2026-10-18): 사용자가 "장비마다 출고값이 있는데 기억나지 않는다", 서브넷은 255.255.255.0이라고 답했습니다. 사내 IP 사용 순서는 사내 운영 정보라 이 공개 저장소에는 적지 않았습니다.
- 아직 답이 없는 것: 제품별 공장 기본 IP 끝자리·게이트웨이. 기본 대역 192.168.1.xxx는 이미 사용자 확인(2026-10-16)으로 알고 있습니다. 질의서 20번은 이 부분만 남깁니다.
- XDM 가이드 67쪽의 LAN 항목은 조회 명령(`?SNA` "LAN 정보 확인")뿐이라 "커맨드로는 못 바꾼다"는 답과 맞습니다. 사이트 설정 명령에도 LAN을 바꾸는 명령은 없습니다.

## 2. 변경

- `data/products/xdm.json`·`vdm.json`·`spx.json`·`qms-44ux.json`·`qms-88ux.json`: `controlExample.lan`에 `ipChange: "device"`, `dhcp: true`, `ipSource: "사용자 확인 2026-10-18"`를 더했습니다. 기존 `port`·`connections`·`autoDisconnect`·`source` 값은 그대로입니다.
- `src/control-example.js`: LAN 통신 안내 문단(`commBarHtml`)에 "IP 주소는 커맨드로 바꿀 수 없고 장비에서 직접 설정합니다. DHCP를 지원합니다. (사용자 확인 2026-10-18)"를 더했습니다. `lan.ipChange`가 `device`인 제품에만 붙고, HDS 두 제품(직렬 전용)에는 붙지 않습니다. 테스트에서 쓰도록 `commBarHtml`을 내보냈습니다. 이 안내는 AMX 코드와 같은 구역에 있어 AMX 코드 잠금이 풀린 뒤에 보입니다.
- 테스트: `tests/control-example.test.cjs`에 5개 제품 데이터·안내 문구, 직렬 전용 제품·LAN 정보 없는 제품에는 안내가 없음을 확인하는 시험 1건.
- 문서: `docs/handoff/RTCOM_QUESTIONS_2026-10-16.md`(20번 질문 축소·현황표·답을 받은 뒤 할 일), `docs/RTCOM_MANUFACTURER_DATA_REQUEST.md` §5 "답" 칸, `docs/handoff/OPEN_ITEMS.md`.

## 2-1. 같은 날 확인: FT101-U / FR101-U HDMI 입력 수(질의서 28번, 메일 C-3)

- 사용자 확인 2026-10-18 "C-3는 HDMI 1PORT가 맞아": 매뉴얼 Ver.1.4 4쪽의 TX 입력 "HDMI 2 Ports"는 오기이고 HDMI 입력은 1개가 맞습니다.
- 사이트는 0.220부터 카탈로그·매뉴얼 6쪽 사진·설명 기준으로 입력 1개를 적고 있어 화면 값은 바뀌지 않습니다. `data/products/ft101-u-fr101-u.json`의 출처 문구(sources M)를 "오기로 보고 1개 유지"(추정)에서 "오기이고 HDMI 입력은 1개가 맞음(사용자 확인 2026-10-18)"으로 바꿨습니다.
- 질의서 28번은 알티컴에 묻지 않아도 되므로 뺐고(전체 회신 대기 12건), 정정본 PDF를 따로 받을 필요도 없습니다.
- 테스트: `tests/site.test.cjs`에 출처 문구와 화면 사양·기능·단자에 "2 Ports"가 없음을 확인하는 시험 1건.

## 2-2. 같은 날 확인: 통합 제어는 IP(LAN) 제어가 기본

사용자 확인 2026-10-18 "통합제어시 HDS-42MU,21U제외하고는 무조건 IP제어를 기본으로 합니다."

- 화면은 0.239부터 LAN이 기본이었습니다(`commOf`). 이번에는 코드 생성 함수 `amxCode`의 기본값도 맞췄습니다. 통신 방식을 넘기지 않으면 예전에는 RS-232 코드가 나왔고, 지금은 LAN(TCP) 코드가 나옵니다(`opts.mode !== 'serial'`).
- 직렬 전용(`serialOnly`)인 HDS-42MU·HDS-21U는 그대로 RS-232 코드만 나옵니다. 나머지 5개 시리즈(XDM·VDM·SPX·QMS-44UX·QMS-88UX)는 RS-232를 따로 고를 때만 직렬 코드가 나옵니다.
- 시험: 직렬 코드를 확인하던 테스트는 `{mode:'serial'}`을 명시하고, 옵션이 없거나 `{}`일 때 `IP_CLIENT_OPEN`이 나오고 `SET BAUD`가 없는 검사를 더했습니다.

## 3. 경계

- 알티컴이 직접 답한 것이 아니라 사용자 확인입니다. 화면 문구에 "사용자 확인 2026-10-18"로 적었고, 알티컴 회신이 다르면 고칩니다.
- 5개 제품이 모두 같다는 답으로 읽어 모두 같은 값을 넣었습니다. 제품별로 다르면 `controlExample.lan`을 고칩니다.
- 남은 확인: 제품별 공장 기본 IP 끝자리·게이트웨이(질의서 20번, 메일 A-1).

## 4. 검증

- `node --test tests/*.test.cjs`, `node scripts/build-product-index.cjs --check`, `node scripts/package-site.cjs` 후 e2e, `node scripts/tools/unify_notation.cjs`, `check-version.cjs --against origin/main`, `git diff --check`(병합 직전 결과는 PR 설명에 적습니다).

## 5. 되돌리기

- 이 PR을 되돌리면 LAN 통신 안내에서 IP 설정·DHCP 문장이 사라지고 `lan` 데이터는 이전 값으로 돌아갑니다. 변경은 위 데이터 5개 파일과 `src/control-example.js`의 안내 한 줄·내보내기 한 항목에 한정됩니다.
