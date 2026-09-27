# VDM 전송기 RS-232 추가 + 46쪽판 재대조 + 쪽 번호 통일 QA (0.31.0)

- 일시: 2026-09-27 · 환경: 로컬 build(`dist/`), 전역 Playwright(`NODE_PATH=/opt/node22/lib/node_modules`), Chromium(`executablePath: /opt/pw-browsers/chromium`)
- 근거: `docs/audit/PRODUCT_DIAGRAM_REVIEW_2026-09-27.md` A3·B6·B7, 카탈로그 원본 `docs/RTcom_catalogue_2026_46p.pdf`

| 항목 | 결과 |
|---|---|
| `node --test tests/*.test.cjs` | 29/29 통과 |
| `node scripts/build-product-index.cjs --check` | 27개 통과 |
| `node scripts/package-site.cjs` | 정상 빌드 |
| `node scripts/e2e-smoke.cjs`(전역 playwright) | 53/53 통과 |
| `git diff --check` | 통과 |

## A3 — RS-232 단자 추가

- 대상: `ct101-u-cr101-u.json`·`ct103-u-h-cr103-u.json`·`ft101-u-fr101-u.json`·`ft103-u-h-fr103-u.json`
- 각 파일 TX 쪽에 `{group:"TX · Control", connector:"Phoenix connector(녹색, 핀 수 미기재)", signal:"RS-232", direction:"BIDIR", quantity:"1", condition:"…소개문·사진 기준(녹색 Phoenix 단자), 핀 수 미기재", verification:"REVIEW REQUIRED"}` 행을, RX 쪽에도 같은 형태로 추가했다.
- 화면 확인(CT101-U/CR101-U 상세, Playwright): 입출력 표에 "TX · Control | 입출력 | Phoenix connector(녹색, 핀 수 미기재) | 1 | RS-232 검토 필요 | CT101-U · 소개문·사진 기준(녹색 Phoenix 단자), 핀 수 미기재" 행이 정상적으로 나타남. RX · Control도 동일하게 확인.

## B7 — 5개 파일 46쪽판 재대조

- 대상: 위 4개 + `ct104-u-cr104-u.json`(이미 RS-232 행이 있어 추가 데이터 변경 없음)
- 방법: 46쪽판(새 카탈로그) 21·22·23·24·25쪽과 48쪽판(옛 카탈로그) 21·23·24·25·27쪽을 공백 제거 후 줄 단위로 비교(`diff <(tr -d ' \t' old) <(tr -d ' \t' new)`).
- 결과: 5개 파일 모두 머리글·쪽 번호·"RTCOM CO., LTD." 각주의 줄바꿈 위치 차이만 있고 실제 사양 값 차이는 없었다. 각 파일에 `C2` 출처(46쪽판 쪽 번호)와 재확인 INFO 이슈를 추가했다.
- CHANGELOG 0.27.0 정정: "나머지(CT101/103/104-U, FT101/103-U, …)의 기존 검토 필요 항목은 새 카탈로그도 같은 표기를 반복해 그대로 유지했습니다"라는 문장이 이 5종에는 사실이 아니었다(그때는 대조하지 않았음). CHANGELOG에 정정 문단을 추가했다.

## B6 — 카탈로그 쪽 번호 46쪽판 통일

- 20개 파일의 `catalogPages`를 48쪽판 값에서 46쪽판(각 파일의 기존 `C2` 출처 페이지) 값으로 바꿨다: `ahoc`(45→43)·`ct103-u-h-cr103-u`(23→22)·`ct104-u-cr104-u`(24→23)·`ft101-u-fr101-u`(25→24)·`ft103-u-h-fr103-u`(27→25)·`hd-13u`(36→34)·`hd-14u`(37→35)·`hd-18u`(38→36)·`hd-210u`(39→37)·`hd-d102u`(31→29)·`hds-21u`(34→32)·`hds-42mu`(35→33)·`hoc-ux`(43→41)·`lhoc`(44→42)·`mr-4s`(40→38)·`obhd-2c`(41→39)·`obux-1c`(42→40)·`qms-44ux`(29→27)·`qms-88ux`(30→28)·`umc`(46–47→44–45).
- `ct101-u-cr101-u`(21)·`xdm-ctr100`(10)·`xdm-ct103-cr103`(11)·`xdm-ft101-fr101`(12)·`xdm`(4–12)·`spx`(13–16)는 두 카탈로그 쪽 번호가 이미 같아 값을 바꾸지 않았다(직접 대조로 확인: 예를 들어 XDM-CTR100·XDM-CT103·XDM-FT101의 46쪽판 페이지가 옛 카탈로그와 각각 10·11·12로 동일).
- `vdm.json`은 "17–27"(VDM 섀시·보드 소개부터 전송기 개별 모델까지 폭넓게 가리키던 범위)을 "17–20"(VDM 섀시·보드 소개만)으로 좁혔다. 전송기 개별 모델(CT101-U~FT103-U-H)은 각자 별도 파일에서 자기 쪽 번호를 관리하므로 중복·혼동을 줄였다. 근거는 `vdm.json`의 새 이슈(I5)에 남겼다.
- 48쪽판 쪽 번호는 각 파일 `sources`의 `C` 항목에 그대로 남아 있다(`C2`는 46쪽판, `C`는 48쪽판으로 역할이 분명해짐).
- 구성기(`src/app.js`) 확인: 전송기 카드 정보(`extenderInfo`·`extenderLineup`)의 XDM 전송기 `page:10/11/12`는 XDM 섹션이 두 카탈로그에서 쪽이 밀리지 않아 그대로 정확하다(수정 없음). VDM 전송기 항목(CT104-U 등)에는 애초에 카탈로그 쪽 번호 필드가 없어 해당 없음. `rearPhotos`의 `page:` 값은 RTCOM 종합 카탈로그가 아니라 별도 매뉴얼(XDM/VDM/SPX manual) 쪽 번호라 이번 통일 대상이 아니다.

## 화면 확인(Playwright)

- HD-13U 목록 카드: "분배기·선택기 · 카탈로그 34쪽"(이전 36쪽에서 변경 확인).
- FT103-U-H/FR103-U 목록 카드: "전송기 · 카탈로그 25쪽"(이전 27쪽에서 변경 확인).
- CT101-U/CR101-U 목록 카드: "전송기 · 카탈로그 21쪽"(원래도 21쪽, 두 카탈로그 동일하므로 변경 없음 확인).

## 남은 위험

- RS-232 단자 4곳 모두 핀 수·정확한 커넥터 규격은 제조사 확인 전까지 REVIEW REQUIRED로 남습니다.
- 이번 재대조로 값이 바뀐 곳은 없어(카탈로그 자체가 동일), 사양 정확성 관련 새로운 위험은 없습니다.
