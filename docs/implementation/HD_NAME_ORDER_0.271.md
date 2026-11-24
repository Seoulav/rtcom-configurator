# 0.271.0 HD-108U·HD-104U 제품명 표기 순서 변경 (2026-11-17)

## 1. 요청과 범위

- 사용자 요청 2026-11-17: "HD-108(18U) 병행기입해서 HD-18U(108U) 이런식으로 앞 뒤를 변경해줘".
- 현재 표기 `HD-108U (HD-18U)`(카탈로그 모델명 앞, 새 실크 이름 괄호 안)를 `HD-18U(108U)`(새 실크 이름 앞, 카탈로그 모델명 괄호 안)로 바꿉니다.
- **HD-104U도 함께 바꿨습니다.** 요청에는 HD-108U만 적혀 있었지만, HD-104U는 같은 사정(카탈로그 HD-104U, 실크 HD-14U)이라 한 쪽만 바꾸면 목록에서 표기가 어긋나 "이런식으로"에 맞춰 같이 적용했습니다. HD-104U만 원래대로 돌리려면 4절의 되돌리기를 따릅니다.

## 2. 바꾼 것

| 위치 | 변경 |
|---|---|
| `data/products/hd-108u.json` `productName` | `HD-108U (HD-18U)` → `HD-18U(108U)` |
| `data/products/hd-104u.json` `productName` | `HD-104U (HD-14U)` → `HD-14U(104U)` |
| `data/products/index.json` | `scripts/build-product-index.cjs`로 다시 생성(두 줄) |
| `scripts/e2e-smoke.cjs` | 옛 주소 `#products/hd-14u` 이동 시험의 기대 제목을 `HD-14U(104U)`로 |
| `tests/site.test.cjs` | 두 제품의 `productName`·`model`·`aliases`·색인 확인 시험 추가 |
| `data/products/hd-108u.json`·`hd-104u.json` N1 안내문 | 제목 "실크 표기 변경 예정" → "실크 표기 변경", 본문 "앞으로 HD-18U(HD-14U)로 바뀔 예정" → "HD-18U(HD-14U)로 바뀌었습니다"(사용자 확인 2026-11-18 "다음 단계 1번 할 거 없어 그냥 지금 바꿔", 실크 변경 시점을 따로 기다리지 않음) |
| `scripts/build-product-index.cjs` 주석 | "추후 실크만 … 변경 예정" → 변경됨 |
| `output/design/assets/docs/README.md` | PDF 파일 표의 제품명 두 줄 |
| `docs/handoff/AV_PORTAL_RTCOM_PRODUCT_DATA.md` | `productName` 설명에 새 표기와 `model`을 쓰라는 안내 |

- 표기는 사용자가 적은 그대로 괄호 앞에 공백을 두지 않습니다(`HD-18U(108U)`). 기존 `HD-108U (HD-18U)`는 공백이 있었습니다.

## 3. 그대로 둔 것과 영향

- `id`(`hd-108u`·`hd-104u`), `model`(`HD-108U`·`HD-104U`), `aliases`(`HD-18U`·`HD-14U`)는 그대로입니다. 옛 주소 이동(`#products/hd-18u`·`#products/hd-14u`)과 검색(제품명·모델명·별칭을 함께 검사)은 계속 동작합니다. `build-product-index.cjs`가 `aliases`에 `model`과 같은 이름을 금지하므로 `HD-108U`는 별칭에 넣지 않았고 `model`로 검색됩니다.
- 04 제품 사양과 개요는 손대지 않았습니다. N1 안내문은 처음에는 "변경 예정"으로 두었다가, 사용자가 "다음 단계 1번 할 거 없어 그냥 지금 바꿔"(2026-11-18)라고 해서 "바뀌었습니다"로 고쳤습니다. 이 문구는 화면의 "제조사 자료"에는 보이지 않고(0.52부터 참고 사항을 뺌) 데이터에만 남습니다.
- `productName`은 화면 제목·목록 카드·관련 제품 링크·사진 확대 창 제목에서 그대로 문자열로 쓰입니다. 코드가 괄호 앞 공백에 기대어 자르지 않습니다.
- 비공개 AV Portal이 공개 데이터의 `productName`을 화면에 쓴다면 표기가 바뀝니다. 모델명 비교는 `model`을 쓰도록 `docs/handoff/AV_PORTAL_RTCOM_PRODUCT_DATA.md`에 적었습니다.

## 4. 되돌리기

PR을 revert하면 됩니다. 일부만 되돌릴 때는 해당 제품 JSON의 `productName`을 `HD-104U (HD-14U)`·`HD-108U (HD-18U)`로 되돌리고 `node scripts/build-product-index.cjs`로 색인을 다시 만든 뒤, e2e 시험의 기대 제목(`HD-14U(104U)`)과 단위 시험을 맞춥니다.
