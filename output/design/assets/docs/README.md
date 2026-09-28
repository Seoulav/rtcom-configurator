# 제조사 문서 PDF 폴더

제품 상세 화면의 "카탈로그 PDF"·"매뉴얼 PDF" 버튼이 여는 파일을 두는 곳입니다(사용자 결정 2026-09-28).

**이 폴더의 PDF는 사용자가 제공한 파일입니다.** 사용자가 GitHub로 직접 올리거나, 로컬 `input_doc/`에 넣은 파일을 사용자가 공개를 승인한 뒤 Claude가 이 폴더로 복사합니다(2026-09-28 사용자 결정 "1번": input_doc 매뉴얼 17개 공개). AI 세션은 PDF를 새로 만들지 않습니다(카탈로그 쪽 발췌 포함).

**공개 중(2026-09-28, 0.88.0):** 매뉴얼 17개 — `hd-13u`·`hd-104u`·`hd-108u`·`hd-210u`·`hds-21u`·`hds-42mu`·`obhd-2c`·`obux-1c`·`qms-44ux`·`qms-88ux`·`xdm-ctr100`·`xdm-ctr100-pse`·`xdm-ft101-fr101`·`xdm`·`vdm`의 `-manual.pdf`, `xdm-ct103-cr103-manual-ct103.pdf`·`-manual-cr103.pdf`. 카탈로그 발췌본은 아직 없습니다.

**전체 카탈로그(2026-09-28, 0.95.0):** `rtcom-catalog-2026.pdf`(46쪽판, 사용자 결정 "전체 카탈로그 공개해도 돼"). 29개 제품의 카탈로그 버튼이 이 파일을 함께 쓰고 `page`로 제품 쪽을 엽니다. 새 판이 나오면 같은 이름으로 덮어쓰고, 쪽 번호가 바뀌면 각 제품의 `page`·`catalogPages`도 고칩니다. 제품별 발췌본을 올리면 그 제품만 발췌본으로 바꿉니다.
구조 설명은 `docs/implementation/PRODUCT_DOCUMENT_DOWNLOADS.md`에 있습니다.

## 올리는 방법 (GitHub 웹)

1. GitHub에서 저장소를 열고 작업 브랜치(예: `claude/relaxed-euler-mq1di9`)를 고릅니다. `main`에 바로 올리지 않습니다.
2. 이 폴더(`output/design/assets/docs/`)로 들어가 **Add file → Upload files**를 누릅니다.
3. 아래 표의 이름으로 바꾼 PDF를 끌어다 놓고 커밋합니다.
4. Claude에게 "올렸어"라고 알려 주면 제품 데이터(`data/products/<id>.json`의 `documents[].file`)에 연결하고 검증합니다.

- **파일 이름에 버전을 넣지 않습니다.** 새 판이 나오면 같은 이름으로 덮어써서 올리면, 사이트 주소가 바뀌지 않고 버튼도 그대로입니다. 버전은 화면의 문서 제목(`title`)에 적습니다.
- 이 폴더에 파일을 올리기만 해서는 공개 사이트에 나가지 않습니다. `documents[].file`에 등록한 파일만 배포됩니다(`scripts/package-site.cjs`).
- 파일 하나는 15MB 이하로 올립니다.
- **이 저장소는 공개 저장소입니다.** 한 번 커밋한 PDF는 나중에 지워도 Git 기록에서 받을 수 있습니다. 공개해도 되는 최종판만 올립니다.

## 파일 이름 표 (제품 30종)

- 카탈로그: 제품 쪽만 잘라 낸 PDF (예: HD-13U는 46쪽판 34쪽)
- 매뉴얼: 제조사 사용자 매뉴얼
- 제품 안내서가 따로 있으면 `<id>-sheet.pdf`
- 없는 문서는 올리지 않으면 됩니다. 버튼은 파일이 있는 문서만 보입니다(케이블은 카탈로그만).

| 제품 | 카탈로그 | 매뉴얼 |
|---|---|---|
| AHOC | `ahoc-catalog.pdf` | `ahoc-manual.pdf` |
| CT101-U / CR101-U | `ct101-u-cr101-u-catalog.pdf` | `ct101-u-cr101-u-manual.pdf` |
| CT103-U-H / CR103-U | `ct103-u-h-cr103-u-catalog.pdf` | `ct103-u-h-cr103-u-manual.pdf` |
| CT104-U / CR104-U | `ct104-u-cr104-u-catalog.pdf` | `ct104-u-cr104-u-manual.pdf` |
| FT101-U / FR101-U | `ft101-u-fr101-u-catalog.pdf` | `ft101-u-fr101-u-manual.pdf` |
| FT103-U-H / FR103-U | `ft103-u-h-fr103-u-catalog.pdf` | `ft103-u-h-fr103-u-manual.pdf` |
| HD-104U (HD-14U) | `hd-104u-catalog.pdf` | `hd-104u-manual.pdf` |
| HD-108U (HD-18U) | `hd-108u-catalog.pdf` | `hd-108u-manual.pdf` |
| HD-13U | `hd-13u-catalog.pdf` | `hd-13u-manual.pdf` |
| HD-210U | `hd-210u-catalog.pdf` | `hd-210u-manual.pdf` |
| HD-D102U | `hd-d102u-catalog.pdf` | `hd-d102u-manual.pdf` |
| HDS-21U | `hds-21u-catalog.pdf` | `hds-21u-manual.pdf` |
| HDS-42MU | `hds-42mu-catalog.pdf` | `hds-42mu-manual.pdf` |
| HOC-UX | `hoc-ux-catalog.pdf` | `hoc-ux-manual.pdf` |
| LHOC | `lhoc-catalog.pdf` | `lhoc-manual.pdf` |
| MR-4S | `mr-4s-catalog.pdf` | `mr-4s-manual.pdf` |
| OBHD-2C | `obhd-2c-catalog.pdf` | `obhd-2c-manual.pdf` |
| OBUX-1C | `obux-1c-catalog.pdf` | `obux-1c-manual.pdf` |
| QMS-44UX | `qms-44ux-catalog.pdf` | `qms-44ux-manual.pdf` |
| QMS-88UX | `qms-88ux-catalog.pdf` | `qms-88ux-manual.pdf` |
| SPX-TX / SPX-RX | `spx-rx-tx-catalog.pdf` | `spx-rx-tx-manual.pdf` |
| SPX Series | `spx-catalog.pdf` | `spx-manual.pdf` |
| UMC | `umc-catalog.pdf` | `umc-manual.pdf` |
| VDM Series | `vdm-catalog.pdf` | `vdm-manual.pdf` |
| XDM-CT103 / XDM-CR103 | `xdm-ct103-cr103-catalog.pdf` | `xdm-ct103-cr103-manual-ct103.pdf`, `xdm-ct103-cr103-manual-cr103.pdf` |
| XDM-CTR100 PSE | `xdm-ctr100-pse-catalog.pdf` | `xdm-ctr100-pse-manual.pdf` |
| XDM-CTR100 | `xdm-ctr100-catalog.pdf` | `xdm-ctr100-manual.pdf` |
| XDM-FT101 / XDM-FR101 | `xdm-ft101-fr101-catalog.pdf` | `xdm-ft101-fr101-manual.pdf` |
| XDM-PSU | `xdm-psu-catalog.pdf` | `xdm-psu-manual.pdf` |
| XDM Series | `xdm-catalog.pdf` | `xdm-manual.pdf` |
