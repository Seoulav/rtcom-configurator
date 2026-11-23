# 0.273.0 배포 기록 (2026-11-23)

- PR: #442 "0.273.0 주소창 주소로도 제품 미리보기 (product-<id>.html·popstate)"
- 병합: squash, main `a8b49ac` (`expectedHeadSha` f974b0d 고정, GitHub `RTCOM checks / verify` success, e2e 단계 4분 51초 포함). 병합 직전 main은 `2fa329d` 그대로였고 열린 PR은 다른 세션의 #431(0.269.0 번호 사용, 초안)뿐이었습니다. #431은 병합 전에 main을 합치고 번호를 0.274.0 이상으로 옮겨야 합니다(그 세션의 몫).
- 경위: 사용자가 0.272의 `share/<id>/` 주소가 아니라 주소창 주소를 그대로 카카오톡에 보내 제품 미리보기가 나오지 않는다고 알리고(2026-11-23 "카카오톡 제대로 안되", "너가 판단해서해줘"), 제품 상세를 열면 주소창이 `product-<id>.html#products/<id>`로 바뀌게 했습니다. 상세는 `docs/implementation/SHARE_PREVIEW_ADDRESS_0.273.md`입니다.
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 45177493126, main `a8b49ac` 기준 success

## 공개 주소 확인

공개 주소에서 카카오톡 수집기와 비슷하게 자바스크립트 없이(접속 정보 `kakaotalk-scrap/1.0`) 직접 내려받아 확인했습니다.

| 항목 | 결과 |
|---|---|
| 화면 버전 표기 | `CATALOG BASED · 0.273` |
| `product-hd-13u.html`·`product-hd-108u.html`·`product-xdm-ctr100.html`·`product-spx-r6.html` | `og:title`·`og:url`·`og:image`가 각 제품 값(HD-108U 제목 `HD-18U(108U) \| RTCOM 제품정보`) |
| 해시 없는 주소 진입 스크립트 | `product-hd-108u.html`에 `history.replaceState` 한 줄 있음 |
| 제품 33종의 `product-<id>.html`·`share/<id>/`·미리보기 이미지 | 33/33 정상(페이지 200, 이미지 `image/jpeg` 200) |
| 공개 `CLAUDE.md`·`docs/qa/DEPLOYMENT_0.272_2026-11-23.md` | 404 |

## 로컬 검증 메모

- 단위 테스트·화면 시험(e2e 312/312, 주소창 항목 12개)·`build-product-index --check`·`check-version` 0.272 → 0.273·사이트 빌드·`git diff --check` 통과.

## 남은 확인 사항

- **카카오톡 실제 미리보기:** 이 환경에서는 카카오톡 앱으로 직접 확인할 수 없습니다. 제품 상세를 연 뒤 주소창 주소(`…/product-<id>.html#products/<id>`)를 카카오톡에 보내 제품 이름·설명·사진이 나오는지 사용자가 확인해야 합니다.
- **카카오톡 캐시:** 이미 보낸 적 있는 옛 주소(`#products/…` 주소, 사이트 첫 화면)는 한동안 옛 미리보기가 나옵니다. 카카오 공유 디버거(https://developers.kakao.com/tool/debugger/sharing)에서 주소를 넣고 "초기화"합니다. `product-<id>.html` 주소는 처음 보내는 주소라 캐시가 없습니다.
- 공개 데이터 `slots`·`slotType`·`compatibleFrames`·`io` 필드의 유지·삭제는 사용자 결정 대기입니다(지금은 유지).
