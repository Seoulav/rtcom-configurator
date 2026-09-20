# RTCOM 카탈로그 데이터 감사와 Gap

- 기준: `src/library.js`, `src/catalog.js`, `src/core.js`
- 기준 커밋: `f7951ef0bb5a4294c9e68debc43de333a3bea707`
- 감사일: 2026-09-20

## 1. 실제 등록 수

제품 라이브러리에는 31개 제품·시리즈가 등록되어 있다. 실제 데이터 카테고리는 5개다. 화면의 6개 탭은 `전체 장비` 탭을 포함한 수이므로 “6개 제품 카테고리”로 해석하면 안 된다.

| 현재 category ID | 표시명 | 수량 | 목표 매핑 |
|---|---|---:|---|
| `matrix` | 모듈형 매트릭스 | 3 | `modular-matrix` |
| `integrated` | 일체형 매트릭스 | 3 | `fixed-matrix` |
| `distribution` | 분배기·선택기 | 9 | `distribution-switching` |
| `extender` | 전송기·확장 | 12 | CAT·HDBaseT 5, 광 전송 6, 확장 프레임 1의 하위 유형으로 매핑 |
| `cable` | 케이블 | 4 | `cables` |
| 없음 | 액세서리 | 0 | 후속 자료 확보 뒤 `accessories` 추가 |

구성기 카탈로그에는 XDM 7개, SPX 5개, VDM 9개로 총 21개 섀시 모델과 카드 26개가 등록되어 있다.

## 2. 전체 제품·시리즈 inventory

| ID / slug 후보 | 모델·시리즈 | 현재 분류 | 페이지 | 이미지 | 상태 후보 |
|---|---|---|---:|---|---|
| `xdm` | XDM Series | matrix | 4–12 | `output/design/assets/xdm.jpg` | CATALOG_ONLY + 기술자료 |
| `spx` | SPX Series | matrix | 13–16 | `output/design/assets/spx.jpg` | CATALOG_ONLY |
| `vdm` | VDM Series | matrix | 17–27 | `output/design/assets/vdm.jpg` | CATALOG_ONLY |
| `hs-88mx` | HS-88MX | integrated | 28 | `library/hs-88mx.jpg` | CATALOG_ONLY |
| `qms-44ux` | QMS-44UX | integrated | 29 | `library/qms-44ux.jpg` | CATALOG_ONLY |
| `qms-88ux` | QMS-88UX | integrated | 30 | `library/qms-88ux.jpg` | CATALOG_ONLY |
| `hd-d102u` | HD-D102U | distribution | 31 | `library/hd-d102u.jpg` | CATALOG_ONLY |
| `hd-d104u` | HD-D104U | distribution | 32 | `library/hd-d104u.jpg` | CATALOG_ONLY |
| `hd-d108u` | HD-D108U | distribution | 33 | `library/hd-d108u.jpg` | CATALOG_ONLY |
| `hds-21u` | HDS-21U | distribution | 34 | `library/hds-21u.jpg` | CATALOG_ONLY |
| `hds-42mu` | HDS-42MU | distribution | 35 | `library/hds-42mu.jpg` | CATALOG_ONLY |
| `hd-13u` | HD-13U | distribution | 36 | `library/hd-13u.jpg` | CATALOG_ONLY |
| `hd-104u` | HD-104U | distribution | 37 | `library/hd-104u.jpg` | CATALOG_ONLY |
| `hd-108u` | HD-108U | distribution | 38 | `library/hd-108u.jpg` | CATALOG_ONLY |
| `hd-210u` | HD-210U | distribution | 39 | `library/hd-210u.jpg` | CATALOG_ONLY |
| `xdm-ctr100` | XDM-CTR100 / PSE | extender/CAT | 10 | `library/xdm-cat-extender.jpg` | CATALOG_ONLY, 전원 모델 NEEDS_REVIEW |
| `xdm-ct103` | XDM-CT103 / CR103 | extender/CAT | 11 | `library/xdm-wall-extender.jpg` | CATALOG_ONLY |
| `xdm-ft101` | XDM-FT101 / FR101 | extender/Fiber | 12 | `library/xdm-fiber-extender.jpg` | CATALOG_ONLY |
| `vdm-cat101` | CT101-U / CR101-U | extender/CAT | 21 | `library/vdm-cat-101.jpg` | CATALOG_ONLY |
| `vdm-cat102` | CT102-U / CR102-U | extender/CAT | 22 | `library/vdm-cat-102.jpg` | CATALOG_ONLY |
| `vdm-cat103` | CT103-U-H / CR103-U | extender/CAT | 23 | `library/vdm-cat-wall.jpg` | NEEDS_REVIEW |
| `vdm-fiber101` | FT101-U / FR101-U | extender/Fiber | 24 | `library/vdm-fiber-101.jpg` | CONFLICTED 후보 |
| `vdm-fiber102` | FT102-U / FR102-U | extender/Fiber | 25 | `library/vdm-fiber-102.jpg` | CONFLICTED 후보 |
| `vdm-fiber103` | FT103-U-H / FR103-U | extender/Fiber | 26–27 | `library/vdm-fiber-103.jpg` | CONFLICTED 후보 |
| `mr-4s` | MR-4S | extender/Frame | 40 | `library/mr-4s.jpg` | CATALOG_ONLY |
| `obhd-2c` | OBHD-2C | extender/Fiber | 41 | `library/obhd-2c.jpg` | CATALOG_ONLY |
| `obux-1c` | OBUX-1C | extender/Fiber | 42 | `library/obux-1c.jpg` | CATALOG_ONLY |
| `hoc-ux` | HOC-UX | cable | 43 | `library/hoc-ux.jpg` | CATALOG_ONLY |
| `lhoc` | LHOC | cable | 44 | `library/lhoc.jpg` | CATALOG_ONLY |
| `ahoc` | AHOC | cable | 45 | `library/ahoc.jpg` | CATALOG_ONLY |
| `umc` | UMC Locking Cable | cable | 46 | `library/umc.jpg` | CATALOG_ONLY |

경로 앞의 `library/`는 `output/design/assets/library/`를 줄여 표기했다. 검사 결과 31개 이미지가 모두 존재하며 ID와 모델명 중복은 없다.

## 3. 현재 데이터 계약

`library.js` 제품 객체의 공통 필드는 `id`, `category`, `name`, `sub`, `image`, `page`, `features`다. 선택 필드는 `status`, `config`, `pdf`다. `pdf`는 제품에 없으면 공통 카탈로그 PDF로 대체된다.

`catalog.js`는 제품 객체가 아니라 제품군 객체와 위치 기반 카드 튜플을 사용한다.

```text
family: name, copy, tags, models[], modelNotes[], input[][], output[][]
card tuple: [modelId, description, channelCount, signalType]
```

이 구조는 현행 구성기에 충분하지만 제품 비교, 필터, 문서 registry, 관계 그래프에는 부족하다.

## 4. 중복·하드코딩·불일치 위험

| 문제 | 위치 | 영향 | PHASE 0 결정 |
|---|---|---|---|
| XDM·SPX·VDM 시리즈 정보 중복 | `library.js`, `catalog.js` | 카드와 구성기에서 다른 명칭·기능을 표시할 수 있다. | REFACTOR 후보로 기록하고 현행 코드는 유지한다. |
| XDM 슬롯 수 중복 | `core.js:slotsFor`, `app.js:cardsViewV3` | 한쪽만 수정하면 슬롯 개수와 화면 라벨이 달라진다. | PHASE 2 이후 단일 데이터로 이동한다. |
| HOS/WOS 기능 문자열 중복 | `library.js`, `app.js:cardTips`, 출력 TIP | 기능 표현과 검증 상태가 분리된다. | 공통 capability로 옮길 후보로 기록한다. |
| CTR100 전원 규칙 중복 | `core.js` 검증·BOM, `app.js:powerNotice` | 수량 공식과 안내가 달라질 수 있다. | 코어 결과를 UI가 표시하도록 후속 정리한다. |
| 제품 상태가 자유 문자열 | `library.js:status` | VERIFIED/CATALOG_ONLY 등 공통 상태로 비교할 수 없다. | 상태 migration 표를 먼저 정의한다. |
| 기술 사양이 문자열 배열 | `features` | 숫자·단위·UNKNOWN을 구분하거나 필터링할 수 없다. | 원문을 보존하고 구조화 필드를 병행 추가한다. |
| 카테고리 수 문구 하드코딩 | `library.js` hero의 `6` | 실제 데이터 카테고리 5개와 혼동된다. | PHASE 1 표시 문구 결정 전까지 유지한다. |
| 공통 PDF 선택이 비결정적 | `package-site.cjs` | docs에 PDF가 추가되면 잘못된 파일이 배포될 수 있다. | 명시적 document ID 도입 전 변경하지 않는다. |
| legacy 화면 함수 잔존 | `app.js`, `workspace.inc.js` | 어느 코드가 현행인지 판단하기 어렵다. | PHASE 1에서는 삭제하지 않는다. |

## 5. 카테고리별 부족 필드

### 공통

`productId`, `slug`, `displayName`, 한글 제품 유형, 제품 상태, use case, tags, aliases, 이미지 메타데이터·출처·권한, 구조화된 문서 참조, 검증 기록, 관계, 마지막 검토일이 부족하다.

### 분배기·선택기

- 제품 유형 Splitter/Switcher/Matrix의 구조화 값
- `inputCount`, `outputCount`, topology
- HDMI·HDCP 버전, bandwidth 수치와 단위
- 최대 해상도·frame rate·chroma·color depth
- EDID mode, audio embed/extract, auto/priority switching, scaling
- 제어 포트, 전원, 크기, 포함품

현재 이 값들은 `sub`와 `features` 문자열에만 있다. `UNKNOWN`과 `false`를 구분할 필드가 없다.

### CAT·HDBaseT 익스텐더

- TX/RX/Transceiver 역할과 pair ID
- HDBaseT 세대와 connector
- 거리 수치, 케이블 조건, 해상도 조건
- PSE/PD/PoE/PoH 방향과 전원 예산
- RS-232/IR/USB/Ethernet/Audio 전달 여부
- 벽부형·스케일링 여부
- compatibleCards, compatibleChassis, requires, recommendedCable

현재 XDM의 일부 관계만 `RtCore.choices()`에 UI 선택 문자열로 하드코딩되어 있다.

### 광 익스텐더

- 송신기·수신기 pair
- single-mode/multi-mode 구분, connector, fiber strand 수
- 거리와 조건, 광 모듈 요구사항
- 영상 성능과 제어·오디오 전달 여부
- 전원, 호환 카드, 권장 케이블

VDM 광 제품은 방향·프로토콜 표기 충돌이 있어 자동 추천에서 제외해야 한다.

### 케이블

- connector A/B, 방향성, medium
- 판매 길이와 길이별 SKU
- bandwidth 수치, 해상도 조건
- HDR/Dolby Vision, Plenum, locking, armored
- 최소 굽힘 반경, 인장력, 외부 전원, 인증

현재 여러 길이는 하나의 feature 문자열로 저장되어 계산과 SKU 생성에 사용할 수 없다.

## 6. 관계·문서·검증 Gap

- TX/RX pair, compatible card/chassis, required accessory, recommended cable 관계가 공통 모델로 존재하지 않는다.
- `choices()`가 허용하는 관계는 XDM 4종과 SPX 1종뿐이며 조건·근거가 구조화되어 있지 않다.
- 모든 제품이 하나의 카탈로그 PDF와 page 문자열만 참조한다.
- 제품별 매뉴얼, 데이터시트, 펌웨어 노트, 문서 버전과 최신 여부가 없다.
- 제품 검증 상태와 개별 사양 검증 상태가 분리되어 있지 않다.
- 문자열에 없는 기능이 미지원인지 UNKNOWN인지 판단할 수 없다.
- 거리·대역폭·해상도가 단위 포함 문자열이라 계산과 정렬에 바로 사용할 수 없다.

## 7. 점진적 schema migration 요구사항

1. 기존 `products` 객체와 `RtCatalog` 튜플을 PHASE 1에서 변경하지 않는다.
2. 먼저 read-only adapter가 두 소스를 공통 view model로 투영하도록 설계한다.
3. 기존 필드와 feature 문자열을 원문으로 보존하고 구조화 필드는 optional로 추가한다.
4. `undefined/UNKNOWN`, `false/UNSUPPORTED`, `true/SUPPORTED`를 구분한다.
5. 숫자는 값과 단위를 분리하고 거리에는 조건 문자열과 근거를 함께 보존한다.
6. 문서는 stable document ID로 등록하고 제품은 ID와 page range를 참조한다.
7. 관계에는 대상 ID, 방향, 조건, 근거, 검증 상태를 포함한다.
8. 기존 `RtCatalog`와 JSON schema 3을 사용하는 구성기는 adapter 뒤에서도 동일한 값을 받아야 한다.
9. catalogVersion을 변경하기 전에 이전 버전 fixture와 migration test를 만든다.
10. 단일 카탈로그 전환은 PHASE 2의 Release Gate에서 수행하며 PHASE 1에서는 정보구조만 분리한다.

## 8. 검증 결과

- 제품·시리즈: 31개
- 실제 데이터 카테고리: 5개
- 표시 탭: 6개 (`all` 포함)
- 구성기 제품군: 3개
- 구성기 섀시 모델: 21개
- 구성기 카드: 26개
- 중복 ID: 0
- 중복 제품명: 0
- 누락 이미지 경로: 0
- 구조화 문서 registry: 없음
- 전용 catalog validator: 없음
