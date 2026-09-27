# AV Portal 인계 — 알티컴 공개 제품정보 데이터 연동

- 작성: rtcom-configurator 0.19.0 (2026-09-26)
- 보내는 곳: `Seoulav/rtcom-configurator` (공개)
- 받는 곳: `Seoulav/AV-Portal` (비공개 전환 예정)
- 근거 결정: rtcom-configurator `docs/audit/SITE_SCOPE_REVIEW.md` §9 (2026-09-26 사용자 확정)
- 이 문서의 용도: AV Portal의 Work(기획)가 이 문서를 근거로 `Work/작업/<작업ID>.md` 명세를 만들고, Codex(구현)가 그 명세대로 연동합니다. 이 문서 자체는 구현 승인이 아닙니다. AV Portal의 승인 절차(AGENTS.md)를 따릅니다.

## 1. 결정 요약

| 구분 | 위치 | 공개 여부 | 내용 |
|---|---|---|---|
| 브로셔 수준 제품정보 **원본** | rtcom-configurator | 공개 | 모델명·사양·입출력·사진·카탈로그 쪽 번호 + Matrix 구성기 |
| 회사 내부 자료 | AV Portal | 비공개(회사 계정 로그인) | 아래 공개 데이터를 받아 표시 + 팁·테크닉·노하우·단가 등 |

데이터는 **공개 → 비공개 한 방향**으로만 흐릅니다.

1. 알티컴 브로셔 정보(사양·사진)는 **rtcom-configurator에서만 고칩니다.** AV Portal에서 고치지 않습니다.
2. AV Portal은 공개 파일을 **읽기만** 합니다. AV Portal에서 rtcom-configurator로 보내는 기능은 만들지 않습니다.
3. AV Portal은 같은 `id`를 기준으로 내부 정보만 덧붙입니다.
4. rtcom-configurator에는 단가·원가·거래처·노하우 같은 내부 정보를 넣지 않습니다. 이 저장소의 검증 스크립트가 금지어를 검사합니다.

## 2. 공개 데이터 주소

| 파일 | 주소 |
|---|---|
| 목록 | `https://seoulav.github.io/rtcom-configurator/data/products/index.json` |
| 상세 | `https://seoulav.github.io/rtcom-configurator/data/products/{id}.json` |
| 이미지 | `https://seoulav.github.io/rtcom-configurator/output/design/assets/products/{file}` |

- GitHub Pages는 `access-control-allow-origin: *`로 응답합니다(2026-09-26 확인). 그래서 다른 사이트에서도 읽을 수 있습니다.
- 원본 파일은 저장소의 `data/products/`와 `output/design/assets/products/`에 있습니다. `main`에 병합되고 Pages에 배포된 것만 공개 기준입니다.

## 3. 데이터 형식 — `rtcom.products.v1`

### 3.1 목록 `index.json`

```json
{
  "schema": "rtcom.products.v1",
  "manufacturer": "RTCOM",
  "source": "알티컴 종합 카탈로그 2026 (국문 48쪽)",
  "detailPath": "data/products/{id}.json",
  "imagePath": "output/design/assets/products/{file}",
  "groups": {"series": "매트릭스 시리즈", "integrated": "일체형 매트릭스", "distribution": "분배기·선택기", "extender": "전송기", "cable": "케이블"},
  "products": [
    {"id": "qms-44ux", "group": "integrated", "productName": "QMS-44UX", "model": "QMS-44UX", "itemType": "PRODUCT",
     "categories": ["영상", "Video", "Matrix Switcher"], "english": "…", "korean": "…",
     "catalogPages": "29", "packageStatus": "VERIFIED", "cardImage": "qms-44ux-front.webp"}
  ]
}
```

### 3.2 상세 `{id}.json` — AV Portal 상세 JSON(`beta/site/detail/data/*.json`) 호환

AV Portal 상세 JSON과 같은 필드를 씁니다: `manufacturer, productName, model, series, seriesNote, itemType, categories, english, korean, verificationSummary, packageStatus, overview, images, imageStatuses, documents, features, specifications, io, sources, issues`.

rtcom-configurator가 **추가한 필드**는 다음과 같습니다.

| 필드 | 뜻 |
|---|---|
| `id` | 고정 식별자. 파일명과 같습니다. AV Portal 내부 자료는 이 값으로 연결합니다 |
| `group` | `series` / `integrated` / `distribution` / `extender` / `cable` |
| `catalogPages` | 종합 카탈로그 쪽 번호(예: `"21"`, `"4-12"`) |
| `lineup` | 시리즈(`itemType: "SERIES"`)만. 프레임·카드·전송기 구성 목록 `{model, kind, summary}` |
| `related` | 관련 제품 `{relation, target, note}`. relation 값: `TX_PAIR` / `WORKS_WITH` / `COMPATIBLE_CARD` / `PART_OF_SERIES`. target은 다른 제품의 `id` |

**AV Portal 형식과 다른 점**

- `images[].file`은 파일명만 담습니다. 전체 주소는 `imagePath`에 파일명을 넣어 만듭니다.
- `presentation` 필드가 없습니다. AV Portal 기본 문구를 쓰면 됩니다.
- 카탈로그 PDF는 재배포하지 않으므로 `documents`의 카탈로그 항목에는 `url`이 없고 쪽 번호만 있습니다.
- 출처 코드는 `C` = 종합 카탈로그, `R` = 저장소에 이미 있던 사진·매뉴얼 이미지입니다. 각 제품의 `sources` 배열에 정의돼 있습니다.
- 검증 상태
  - `VERIFIED`: 카탈로그 값과 일치합니다.
  - `REVIEW REQUIRED`: 카탈로그 안에서 표기가 서로 어긋납니다. **값은 원문 그대로 두고** 상태로만 표시합니다. 상세 내용은 `issues`에 있습니다.

### 3.3 대상 제품 (27종, 2026-09-27 갱신)

AV Portal과 같은 제외 모델을 적용했습니다(HS-88MX, HS-88M-U, HD-D104U, HD-D108U). HD-104U와 HD-108U는 서로 다른 제품이라 **포함**합니다.

| 분류 | id | 제품 | 카탈로그 쪽 | 상태 |
|---|---|---|---|---|
| 매트릭스 시리즈 | `spx` | SPX Series | 13–16 | REVIEW REQUIRED |
| 매트릭스 시리즈 | `vdm` | VDM Series | 17–27 | REVIEW REQUIRED |
| 매트릭스 시리즈 | `xdm` | XDM Series | 4–12 | REVIEW REQUIRED |
| 일체형 매트릭스 | `qms-44ux` | QMS-44UX | 29 | REVIEW REQUIRED |
| 일체형 매트릭스 | `qms-88ux` | QMS-88UX | 30 | REVIEW REQUIRED |
| 분배기·선택기 | `hd-13u` | HD-13U | 36 | VERIFIED |
| 분배기·선택기 | `hd-14u` | HD-14U | 37 | REVIEW REQUIRED |
| 분배기·선택기 | `hd-18u` | HD-18U | 38 | VERIFIED |
| 분배기·선택기 | `hd-210u` | HD-210U | 39 | VERIFIED |
| 분배기·선택기 | `hd-d102u` | HD-D102U | 31 | VERIFIED |
| 분배기·선택기 | `hds-21u` | HDS-21U | 34 | VERIFIED |
| 분배기·선택기 | `hds-42mu` | HDS-42MU | 35 | VERIFIED |
| 전송기 | `ct101-u-cr101-u` | CT101-U / CR101-U | 21 | REVIEW REQUIRED |
| 전송기 | `ct103-u-h-cr103-u` | CT103-U-H / CR103-U | 23 | REVIEW REQUIRED |
| 전송기 | `ct104-u-cr104-u` | CT104-U / CR104-U | 24 | VERIFIED |
| 전송기 | `ft101-u-fr101-u` | FT101-U / FR101-U | 25 | REVIEW REQUIRED |
| 전송기 | `ft103-u-h-fr103-u` | FT103-U-H / FR103-U | 27 | REVIEW REQUIRED |
| 전송기 | `mr-4s` | MR-4S | 40 | REVIEW REQUIRED |
| 전송기 | `obhd-2c` | OBHD-2C | 41 | VERIFIED |
| 전송기 | `obux-1c` | OBUX-1C | 42 | REVIEW REQUIRED |
| 전송기 | `xdm-ct103-cr103` | XDM-CT103 / XDM-CR103 | 11 | REVIEW REQUIRED |
| 전송기 | `xdm-ctr100` | XDM-CTR100 / XDM-CTR100 PSE | 10 | REVIEW REQUIRED |
| 전송기 | `xdm-ft101-fr101` | XDM-FT101 / XDM-FR101 | 12 | VERIFIED |
| 케이블 | `ahoc` | AHOC | 45 | VERIFIED |
| 케이블 | `hoc-ux` | HOC-UX | 43 | VERIFIED |
| 케이블 | `lhoc` | LHOC | 44 | REVIEW REQUIRED |
| 케이블 | `umc` | UMC | 46–47 | VERIFIED |

## 4. AV Portal에서 할 작업 (Work 명세 초안)

- **작업 이름(안)**: 알티컴 공개 제품정보 읽기 연동
- **목표**: AV Portal의 알티컴 제품 표시를 rtcom-configurator 공개 데이터로 바꾸고, 내부 자료는 `id`로 덧붙입니다.
- **범위**
  1. **동기화 스크립트**(권장: 빌드할 때 한 번 받는 방식)
     - `index.json`과 각 `{id}.json`, 이미지를 받아 AV Portal 빌드 폴더에 캐시합니다.
     - `schema`가 `rtcom.products.v1`이 아니면 중단합니다.
     - 받은 파일의 SHA-256과 받은 시각을 기록합니다.
     - 화면이 열릴 때마다 받는 방식은 GitHub Pages가 멈추면 AV Portal 화면도 비므로 권하지 않습니다.
  2. **표시**: AV Portal 상세 화면에 공개 필드를 그대로 표시합니다. AV Portal에서 사양 값을 고치지 않습니다.
  3. **내부 자료 연결**
     - AV Portal 비공개 데이터에 `{rtcomId, 내부필드…}` 형태로 저장하고, 화면에서 공개 데이터와 합쳐 보여 줍니다.
     - 내부 필드 예: 단가, 시공 팁, 노하우, 사내 문서 링크.
  4. **변경 감지**
     - 동기화 때 목록에서 사라진 `id`가 있으면 경고합니다. 내부 자료가 연결된 제품이 사라진 경우에 해당합니다.
     - 새로 생긴 `id`는 목록에만 추가합니다.
- **제외**
  - AV Portal에서 rtcom-configurator로 데이터를 쓰는 기능
  - 공개 데이터 수정
  - 카탈로그 PDF 재배포
- **완료 조건**
  - 27종이 AV Portal에 공개 데이터 그대로 표시됩니다.
  - 내부 자료 1건 이상이 `id`로 연결되어 **로그인한 사용자에게만** 보입니다.
  - 공개 배포물(있다면)에 내부 필드가 없다는 것을 검사로 확인합니다.
- **선행 조건**
  - AV Portal 비공개 전환(아래 5장)
  - rtcom-configurator 0.19.0이 병합·배포되어 위 주소가 열려야 합니다.

## 5. AV Portal 비공개 전환 (2026-09-27 회사 내부 검토 후 진행 예정)

2026-09-26 기준 `Seoulav/AV-Portal` 저장소는 **공개(public)**이고, `https://seoulav.github.io/AV-Portal/`로 공개 배포 중입니다. 내부 자료를 넣기 전에 다음을 먼저 끝냅니다.

1. 저장소를 비공개(Private)로 전환합니다.
2. GitHub Pages 공개 배포를 중지합니다. GitHub 무료 요금제에서는 저장소가 비공개여도 Pages 사이트가 공개되기 때문입니다.
3. 접속 제한을 붙여 배포합니다. 권장: Cloudflare Pages + Cloudflare Access(50명까지 무료).
   - Google Workspace나 Microsoft 365 같은 회사 계정 로그인이 있으면 그것을 씁니다.
   - 없으면 `@seoulav.co.kr` 메일로 받은 인증코드로 로그인하게 합니다.
4. 과거 커밋 기록은 공개된 적이 있으므로, 실제 회사 정보는 **전환이 끝난 뒤부터** 입력합니다.
5. 비밀번호 입력창만 둔 화면 보호는 쓰지 않습니다. 파일 자체는 누구나 받을 수 있기 때문입니다. API 키도 화면 코드에 넣지 않습니다.

rtcom-configurator 머리글의 "AV Portal에서 제품 찾기" 링크는 AV Portal이 비공개가 되면 일반 방문자에게 로그인 화면을 보여 주게 됩니다. 전환 시점에 이 링크를 뺄지, "사내용" 표시를 붙일지 rtcom-configurator 쪽에서 정합니다.

## 6. 변경 관리

- **0.33 선택 필드 추가**(제품정보 글래스 디자인, `docs/handoff/PRODUCT_GLASS_REDESIGN_SPEC.md` 6-A): `lead`(01 카드 요약, `**한 곳까지**` 굵게 허용)·`subtitle`(머리 부제)·`portMap`(`{image:"Rear"|"Front", items:[{n,label,desc,x1,x2}]}`, 단자 지도 번호표 좌표)·`lineup[].rackUnits`(시리즈 메인프레임 랙 유닛 숫자)를 추가했습니다. 모두 선택 필드라 없어도 화면이 깨지지 않습니다(없으면 개요 첫 문장·io 표 기반 카드로 대신 보여줍니다). `scripts/build-product-index.cjs`가 있을 때만 형식을 검사합니다.
- **필드 추가**는 같은 `rtcom.products.v1` 안에서 합니다. 읽는 쪽은 모르는 필드를 무시합니다.
- **필드 삭제·의미 변경**은 `rtcom.products.v2`로 올립니다. rtcom-configurator `CHANGELOG.md`에 먼저 기록합니다.
- **`id`는 바꾸지 않습니다.** 부득이하면 새 `id`로 추가하고, 옛 `id`는 한 버전 동안 유지하면서 `issues`에 안내합니다.
- rtcom-configurator 쪽 갱신 방법
  1. 상세 JSON을 수정합니다.
  2. `node scripts/build-product-index.cjs`로 목록을 다시 만듭니다.
  3. 테스트를 실행합니다.
  4. PR을 올리고, 병합하고, Pages에 배포합니다.

## 7. 문의·근거 위치 (rtcom-configurator)

| 무엇 | 위치 |
|---|---|
| 결정 | `docs/audit/SITE_SCOPE_REVIEW.md` §9 |
| 구현 기록 | `docs/implementation/PUBLIC_PRODUCT_INFO.md` |
| QA 결과 | `docs/qa/PUBLIC_PRODUCT_INFO_QA.md` |
| 카탈로그 충돌 근거 | `docs/evidence/RTCOM_MATRIX_EVIDENCE_AND_GAPS.md` E23~E26, U09 |
| 검증 스크립트 | `scripts/build-product-index.cjs` (`--check`) |
