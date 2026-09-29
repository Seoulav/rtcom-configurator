# 제품별 카탈로그 PDF (0.97.0)

## 요청과 결정 (2026-09-28)

- 요청: "카탈로그를 전부 잘라서 해당 제품 목록에서 해당 제품만 보이게 잘라줄 수 있어?"
- `CLAUDE.md`에는 "AI 세션은 새 PDF를 만들지 않는다(쪽 발췌 포함)"는 지시가 있어 먼저 물었습니다. 사용자 답: "제품별로 잘라 공개". 이 작업을 그 규칙의 예외로 `CLAUDE.md`에 적었습니다.

## 구현

- `scripts/tools/split_catalog_by_product.py`: 공개 중인 `output/design/assets/docs/rtcom-catalog-2026.pdf`(46쪽판)에서 `data/products/<id>.json`의 `catalogPages` 쪽만 뽑아 `output/design/assets/docs/<id>-catalog.pdf`로 저장합니다. `insert_pdf`로 쪽을 그대로 복사하고(내용·이미지 재압축 없음), 문서 제목 메타데이터만 넣습니다. `--check`는 쪽 수와 쪽 글자가 원본과 같은지 확인합니다.
- 쪽 범위 예외(`PAGE_OVERRIDES`):
  - `xdm`: 0.97~0.150에는 10~12쪽(XDM 전송기) 쪽을 빼고 4~9쪽만 썼습니다. 0.151부터는 사용자 요청(2026-09-29 "SPX Series에서 카달로그를 누르면 SPX전체내용이 다 나오게해줘 VDM,XDM도 동일하게")에 따라 `catalogPages` 그대로 **4~12쪽**(시리즈 구역 전체)을 씁니다.
  - `vdm`: 0.151부터 전송기 21~25쪽까지 넣은 **17~25쪽**을 씁니다(`catalogPages`는 17–20 그대로 두고 덮어쓰기 값으로 지정).
  - `spx-rx-tx`: 15쪽은 SPX 메인프레임 사양 쪽이라 **16쪽**만 씁니다(기존 버튼도 16쪽을 열었습니다).
- 결과 29개: 1쪽 24개, SPX 13~16쪽, UMC 44~45쪽, VDM 17~25쪽, XDM 4~12쪽(0.151부터, 이전 17~20쪽·4~9쪽). XDM-CTR100·XDM-CTR100 PSE는 같은 10쪽입니다. XDM-PSU는 카탈로그에 없어 만들지 않았습니다. 합계 약 6.6MB입니다(파일마다 글꼴이 들어가 원본 3.2MB보다 큽니다).
- `data/products/*.json` 29개: Catalog 문서의 `file`을 `rtcom-catalog-2026.pdf` → `<id>-catalog.pdf`로 바꾸고 `page`를 지우고, `note`를 "카탈로그 46쪽판 N쪽 발췌 · 제품별 공개본"으로 바꿨습니다. `qms-88ux.json`은 줄바꿈 형식이 달라 글자만 바꿨습니다.
- `scripts/package-site.cjs`: 제품 데이터에 더 이상 등록되지 않는 46쪽 공용 파일을, 제품 목록 "전체 카탈로그" 버튼용으로 배포 목록에 따로 넣었습니다.
- `src/products.js`는 바꾸지 않았습니다. `page`가 없으면 버튼이 파일을 그대로 엽니다.

## 검증

- `python3 scripts/tools/split_catalog_by_product.py --check`: 29개 모두 OK.
- `node --test tests/*.test.cjs`, `build-product-index --check`, `package-site`, `e2e-smoke`(HD-13U 카탈로그 버튼 검사를 제품별 파일 기준으로 변경), `git diff --check`.

## 되돌리는 방법

- 이 커밋을 `git revert` 하면 버튼이 다시 46쪽 공용 파일의 해당 쪽을 엽니다. 이미 공개한 제품별 PDF는 Git 기록과 공개 사이트 캐시에 남을 수 있습니다.
- 카탈로그 원본이 바뀌면 `rtcom-catalog-2026.pdf`를 바꾼 뒤 스크립트를 다시 실행합니다.

## 0.151 다시 만들기

```bash
python scripts/tools/split_catalog_by_product.py xdm vdm
python scripts/tools/render_doc_previews.py
python scripts/tools/split_catalog_by_product.py --check
```

`--check`는 29개 모두 OK였습니다. 새 미리보기는 `xdm-catalog-p7~p9.webp`, `vdm-catalog-p5~p9.webp`입니다.
