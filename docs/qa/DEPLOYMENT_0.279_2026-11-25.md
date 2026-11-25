# 0.279.0 배포 기록 (2026-11-25)

- PR: #452 "0.279.0 제품 링크 주소를 product-<id>.html로 (카카오톡 미리보기에 제품명)"
- 병합: squash, main `8761cde` (`expectedHeadSha` 93655f9 고정, GitHub `RTCOM checks / verify` success, e2e 단계 포함). 병합 직전 main은 `e3e9c47` 그대로였고 열린 PR은 이 PR뿐이었습니다.
- 경위: 사용자가 카카오톡에 `#products/obhd…` 주소로 보낸 링크가 사이트 첫 화면 카드로만 보인다며 "제품링크에 제품명이 나오면 좋겠다"고 요청했습니다(2026-11-25). 원인은 제품 카드·관련 제품 링크의 `href`가 `#products/<id>`(# 뒤만 있는 주소)라서 "링크 주소 복사"·새 탭 열기 때 해시 주소가 복사되던 것입니다. 상세는 `docs/implementation/SHARE_PRODUCT_LINKS_0.279.md`입니다.
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 45576050461, main `8761cde` 기준 success

## 공개 주소 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 표기 | `CATALOG BASED · 0.279` |
| 제품 목록 카드(OBHD-2C) 링크 주소 | `product-obhd-2c.html#products/obhd-2c` |
| 카드를 그냥 누르면 | 페이지를 새로 읽지 않고 같은 화면에서 상세로 이동, 주소창 `product-obhd-2c.html#products/obhd-2c`, 탭 제목 `OBHD-2C \| RTCOM 제품정보` |
| 목록 탭 제목 | `RTCOM 매트릭스 구성기`(첫 화면 제목) |
| 카카오톡 수집기 접속 정보로 본 `product-obhd-2c.html` | `og:title` = `OBHD-2C \| RTCOM 제품정보`, `og:image` = `…/share/obhd-2c.jpg` |
| 공개 `CLAUDE.md`·`docs/implementation/SHARE_PRODUCT_LINKS_0.279.md` | 404 |

## 로컬 검증 메모

- 단위 시험 226/226, 화면 시험(e2e) 319/319(새 항목 3개), `build-product-index --check` 33개, 표기 통일 0건, `check-version` 0.278 → 0.279, `git diff --check` 통과.

## 남은 확인 사항

- **카카오톡 실제 표시:** 이 환경에서는 카카오톡 앱으로 볼 수 없습니다. 제품 카드를 길게 눌러 "링크 주소 복사"한 주소(또는 제품 상세의 주소창 주소·"링크 공유" 버튼 주소)를 보내 제품 이름이 나오는지 사용자가 확인해야 합니다.
- **카카오톡 캐시:** 이미 보낸 옛 `#products/…` 주소와 사이트 첫 화면 주소는 옛 카드가 남을 수 있습니다. 카카오 공유 디버거(https://developers.kakao.com/tool/debugger/sharing)에서 "초기화"합니다.
- `#products/…`만 있는 옛 주소를 직접 붙이면 첫 화면 카드로만 보이는 한계는 주소 방식상 풀리지 않습니다.
