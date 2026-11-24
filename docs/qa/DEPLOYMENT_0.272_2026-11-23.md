# 0.272.0 배포 기록 (2026-11-23)

- PR: #440 "0.272.0 제품 링크 공유 미리보기 (share 주소·미리보기 이미지·링크 공유 버튼)"
- 병합: squash, main `91afcb8` (`expectedHeadSha` 3bfe356 고정, GitHub `RTCOM checks / verify` success, e2e 단계 포함). 병합 직전 main은 `06984e1` 그대로였고 열린 PR은 다른 세션의 #431(0.269.0 번호 사용, 초안)뿐이었습니다. #431은 병합 전에 main을 합치고 번호를 0.273.0 이상으로 옮겨야 합니다(그 세션의 몫).
- 경위: 사용자가 제품 링크(`…/#products/hd-108u`)를 보냈을 때 미리보기에 제품이 나오지 않는다고 알리고(2026-11-23), "모든 제품 링크 보냈을때 가능하게 만들어줘", "링크를 카카오톡으로 보냈을때 뭐를 공유했는지 나오게하고 싶은거야"라고 요청했습니다. 주소의 `#` 뒤는 미리보기 수집기에 전달되지 않으므로 제품마다 `share/<id>/` 주소와 미리보기 이미지를 만들고 "링크 공유" 버튼을 넣었습니다. 상세는 `docs/implementation/SHARE_PREVIEW_0.272.md`입니다.
- Pages 배포: `Deploy RTCOM to GitHub Pages` main `91afcb8` 기준 success

## 공개 주소 확인

공개 주소에서 카카오톡 수집기와 비슷하게 자바스크립트 없이(접속 정보 `kakaotalk-scrap/1.0`) 직접 내려받아 확인했습니다.

| 항목 | 결과 |
|---|---|
| 화면 버전 표기 | `CATALOG BASED · 0.272` |
| 제품 33종의 `share/<id>/` 페이지 | 33/33 정상(제목에 제품 이름, 설명 10자 이상, `og:image` 주소 응답 200) |
| 33종의 미리보기 이미지 | 모두 JPEG(`image/jpeg`, 10KB 초과, JPEG 머리값 확인) |
| HD-108U 미리보기 | 제목 `HD-18U(108U) \| RTCOM 제품정보`, 설명 "하나의 HDMI 입력을 손실 없이 8개의 동일한 출력으로 분배합니다. 4K/60 @ 4:4:4를 지원합니다.", 이미지 `…/output/design/assets/share/hd-108u.jpg` |
| 첫 화면 | `og:image` = `…/output/design/assets/share/site.jpg`(응답 200, JPEG) |
| 슬래시 없는 주소 `share/hd-108u` | 301로 `share/hd-108u/`에 이동(수집기가 따라감) |
| 공개 `CLAUDE.md` | 404 |
| 공개 `docs/implementation/SHARE_PREVIEW_0.272.md`·`docs/handoff/OPEN_ITEMS.md` | 404 |

## 로컬 검증 메모

- 단위 테스트 214개(새 시험 3개), 화면 시험 301/301(새 항목 7개), `build-product-index --check` 33개, 표기 통일 바뀔 곳 0건, `check-version` 0.271 → 0.272, 사이트 빌드, `git diff --check` 통과. 캡처는 `docs/qa/share-preview-0.272/`입니다.

## 남은 확인 사항

- **카카오톡 실제 미리보기:** 이 환경에서는 카카오톡 앱으로 직접 확인할 수 없습니다. 사용자가 `🔗 링크 공유`로 복사한 `share/<id>/` 주소를 카카오톡에 보내 제품 이름·설명·사진이 나오는지 확인해야 합니다.
- **카카오톡 캐시:** 이미 카카오톡에 보낸 적 있는 주소(사이트 첫 화면 포함)는 한동안 옛 미리보기가 나옵니다. 카카오 공유 디버거(https://developers.kakao.com/tool/debugger/sharing)에서 주소를 넣고 "초기화"합니다.
- 주소창의 `#products/…` 주소를 그대로 붙이면 미리보기가 첫 화면 정보로 나오는 한계는 주소 방식상 풀리지 않습니다(`share/<id>/` 주소를 보내야 함).
- 공개 데이터 `slots`·`slotType`·`compatibleFrames`·`io` 필드의 유지·삭제는 사용자 결정 대기입니다(지금은 유지).
