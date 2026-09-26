# VDM 전면 도면 (0.15.0)

- 요청(2026-09-26): "VDM 프레임 이미지 없는거는 알티컴 홈페이지에서 받아서 처리해줘" → "메뉴얼에 안에 있으면 그걸 활용해줘"
- 기준 커밋: `87f50e1` (main, 0.14.0 병합)

## 알티컴 홈페이지 조사 결과 (2026-09-26)

| 위치 | 내용 | 활용 |
|---|---|---|
| `rtcomav.com/kor/bbs/board.php?bo_table=pro01_01_2&wr_id=33` (VDM MAIN) | 9종 라인업 단체 사진 1장(900×399) | 모델 구분이 확실하지 않아 잘라 쓰지 않음(이미 제품군 사진으로 사용 중) |
| 같은 페이지의 Google Drive 링크 | VDM 국문 사용자 매뉴얼 PDF(103쪽) — 저장소에서 쓰는 KV07 매뉴얼과 같은 이미지 | 이미 사용 중 |
| 영문 사이트 `rtcomav.com/eng/`, tradekorea | 350×180 썸네일, 48×160 이미지 | 해상도 부족 |
| `vdm_extender` 게시판 | VDM용 전송기 14종: CT101-U·CR101-U·CT102-U·CR102-U·CT103-U-H·CR103-U·CT104-U·CR104-U, FT101-U·FR101-U·FT102-U·FR102-U·FT103-U-H·FR103-U | 후속 작업 후보(VDM 카드-전송기 연동) |

- `www.rtcom.co.kr` 등은 이 작업 환경의 네트워크 정책으로 접속이 막혀 있었고, 실제 홈페이지는 `rtcomav.com`(HTTP)이었습니다.

## 변경

- `scripts/tools/extract_vdm_assets.py`: `FRONT_DRAWINGS`(쪽, 원본 이미지 크기, 전면 영역)로 7종 전면 도면을 `output/design/assets/frames/vdm-<모델>-front.webp`로 저장합니다(폭 최대 700px).
- `src/app.js`: `frameFronts`에 7종 추가, `frontDrawings` 집합으로 이미지 설명을 "전면 도면"으로 표시합니다.
- 한계: 도면은 예전 상표("DVI Link", "Digital Extender")가 그려진 선 도면입니다. 실물 사진을 받으면 같은 파일 이름으로 바꾸면 됩니다.

## 되돌리는 방법

이 PR의 병합 커밋을 revert하면 7종은 제품군 사진으로 돌아갑니다.
