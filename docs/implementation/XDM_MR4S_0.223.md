# 0.223 XDM-MR4S 추가

## 배경

- **사용자 요청(2026-10-16):** "MR-4S 4K프레임 사진이 추가 등록해줘 여기에는 XDM-CTR100, FT101FR101 카드 형태로 만들어서 장착할 수 있는거야 추가해줘"
- **받은 자료:** zip 1개에 투명 배경 PNG 2장(`MR-4S 4K_front.png`·`MR-4S 4K_back.png`, 각 2172×724)이 있었습니다.
- **사진 내용:** 앞면 실크는 "XDM-MR4S 4K MODULAR EXTENSION CENTER"입니다. 뒷면에는 XDM-FT101·XDM-FR101·XDM-CTR100 2장이 장착되어 있고, 왼쪽에 POWER 1·2 입력이 있습니다.

## 사용자 결정(질문 창, 2026-10-16)

| 질문 | 답 |
|---|---|
| 기존 MR-4S(CT104-U/CR104-U·FT101-U/FR101-U 장착)와 어떻게 등록할까 | 별도 제품 추가 |
| 크기·무게·전원 규격(자료 없음) | 사진으로 확인되는 것만 적음 |

## 반영 내용

- **새 제품 `data/products/xdm-mr4s.json`(33번째, 전송기 그룹):**
  - 04 제품 사양: 인터페이스(HDBaseT·광, 장착 카드에 따라), 카드 장착 수 최대 4장, 장착 카드, 표시등, 전원 입력 2개
  - 05 주요 기능: 장착 카드, 송신·수신 카드 혼합 구성, XDM 매트릭스 카드 연동, 전원 입력 2개, 슬롯별 표시등, 영상 사양은 장착 카드 기준
  - 02 Port Map: 앞면(슬롯 1~4 표시등, 전원 표시등)과 뒷면(카드 슬롯 1~4, DC 전원 1·2)
  - 출처: P(사용자 제공 실물 사진), U(사용자 확인), X(이 사이트의 XDM 전송기 제품 데이터)
- **사진:** 투명 배경을 흰색으로 합성하고 몸체 경계(불투명도 200 초과)에서 12px 여백으로 잘라 webp로 저장했습니다.
  - `output/design/assets/products/xdm-mr4s-front.webp`(1981×225)
  - `output/design/assets/products/xdm-mr4s-rear.webp`(2107×240)
- **관련 제품:** XDM-CTR100·XDM-FT101/FR101·MR-4S에 XDM-MR4S를 잇고, XDM-MR4S에서도 세 제품과 XDM 시리즈를 잇습니다.
- **OPEN_ITEMS:** "XDM 매트릭스 호환 모듈(가칭)" 항목을 이 제품으로 정리했습니다. 사양 자료(크기·무게·전원 규격, 전원 이중화 여부, 매뉴얼) 요청 항목을 새로 넣었습니다.

넣지 않은 값은 아래와 같습니다.
- **전원 이중화:** POWER 1·2 입력은 사진으로 확인되지만, 이중화 동작은 확인 전이라 "전원 입력 2개"로만 적었습니다.
- **카드 단자 표(io):** 장착 카드마다 다르므로 비워 두고, 단자는 각 전송기 제품 상세를 따릅니다.

## 검증

- `node --test tests/*.test.cjs`
- `node scripts/build-product-index.cjs --check`(제품 33개)
- `node scripts/package-site.cjs`
- `node scripts/e2e-smoke.cjs`(제품 33종·전송기 16종, XDM-MR4S 상세 단자 지도 5·5개와 관련 제품 링크)
- `node scripts/tools/unify_notation.cjs`(바뀔 곳 0건)
- `node scripts/check-version.cjs --against origin/main`
- `git diff --check`

## 되돌리기

`git revert <0.223 커밋>`을 실행한 뒤 Pages 배포를 다시 실행합니다. 제품 목록이 32종으로 돌아가고 세 제품의 관련 제품 링크도 빠집니다.
