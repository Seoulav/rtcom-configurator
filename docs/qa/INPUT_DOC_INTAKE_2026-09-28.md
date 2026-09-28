# input_doc 첫 정리 기록 (2026-09-28)

## 요청

- 사용자 요청(2026-09-28): "폴더 안에 자료 들어가 있으니까 점검해서 작업 진행해봐. 이어서 진행하다가 막히는 부분이 있으면 물어보고 스스로 해결할 수 있는 부분은 스스로 해결해"
- 절차: `.claude/skills/input-doc/SKILL.md`, `docs/implementation/LOCAL_INPUT_DOC_WORKFLOW.md`

## 분류 결과

원본은 `input_doc/`에만 있고 Git에 올리지 않습니다. 이동 기록(sha256 앞 16자리 포함)은 로컬 `input_doc/INDEX.md`에 있습니다.

| 원래 이름 | 새 위치(`input_doc/RTCOM/…`) | 사이트 반영 |
|---|---|---|
| RTcom_Manual_HD-104U KV Ver.1.1.pdf | manual/RTcom_Manual_HD-104U_Ver1.1.pdf | 같은 판이 이미 근거(변경 없음) |
| RTcom_Manual_HD-108U KV Ver.1.1.pdf | manual/RTcom_Manual_HD-108U_Ver1.1.pdf | 같은 판(변경 없음) |
| RTcom_Manual_HD-13U KV Ver.1.2.pdf | manual/RTcom_Manual_HD-13U_Ver1.2.pdf | 같은 판(변경 없음) |
| RTcom_Manual_HD-210U KV Ver.1.2.pdf | manual/RTcom_Manual_HD-210U_Ver1.2.pdf | 같은 판(변경 없음) |
| RTCom_Manual_HDS-21U Ver.1.0.pdf | manual/RTcom_Manual_HDS-21U_Ver1.0.pdf | 같은 판(변경 없음) |
| RTCom_Manual_HDS-42MU Ver.1.0.pdf | manual/RTcom_Manual_HDS-42MU_Ver1.0.pdf | 같은 판(변경 없음) |
| RTcom_Manual_HEXA-01_Rev.02.pdf | manual/RTcom_Manual_HEXA-01_Rev02.pdf | 사이트 30종에 없는 제품(HDMI 오디오 추출기) — 보관만 |
| RTCom_Manual_HS-88M-U_KV03.pdf | manual/RTcom_Manual_HS-88M-U_KV03.pdf | AV Portal과 같은 제외 모델 — 보관만 |
| RTcom_Manual_OBHD-2C Ver.2.1.pdf | manual/RTcom_Manual_OBHD-2C_Ver2.1.pdf | 같은 판(변경 없음) |
| RTcom_Manual_OBUX-1C KV Ver.2.2.pdf | manual/RTcom_Manual_OBUX-1C_Ver2.2.pdf | 같은 판(변경 없음) |
| RTcom_Manual_QMS-44UX_KV.04.pdf | manual/RTcom_Manual_QMS-44UX_KV04.pdf | 같은 판(M-Q44, 변경 없음) |
| RTcom_Manual_QMS-88UX_KV.04.pdf | manual/RTcom_Manual_QMS-88UX_KV04.pdf | 사이트 근거(KV.03)보다 새 판. 6쪽 사양표·20~23쪽 멀티뷰가 사이트 값과 일치. 아래 확인 2 |
| RTcom_Manual_SPX-M810_프로토콜.pdf | manual/RTcom_Manual_SPX_Protocol.pdf | 표지 "SPX-M24 series", 5·6장 제어 커맨드. 커맨드는 공개 범위 밖 — 보관만 |
| RTCom_Manual_VDM_KV07_251219.pdf | manual/RTcom_Manual_VDM_KV07.pdf | 구성기 VDM 도면 근거와 같은 판. 카드 사양 보완에 사용 |
| RTcom_Manual_XDM KV08_250902 .pdf | manual/RTcom_Manual_XDM_KV08.pdf | 구성기 XDM 근거와 같은 판(변경 없음) |
| RTcom_Manual_XDM-CR103 KV Ver.1.1.pdf | manual/RTcom_Manual_XDM-CR103_Ver1.1.pdf | 같은 판(변경 없음) |
| RTcom_Manual_XDM-CT103 KV Ver.1.4.pdf | manual/RTcom_Manual_XDM-CT103_Ver1.4.pdf | 같은 판(변경 없음) |
| RTcom_Manual_XDM-CTR100 KV Ver.1.4.pdf | manual/RTcom_Manual_XDM-CTR100_Ver1.4.pdf | 같은 판(변경 없음) |
| RTcom_Manual_XDM-CTR100 Ver.1.3.pdf | manual/RTcom_Manual_XDM-CTR100_Ver1.3.pdf | Ver1.4 이전 판 — 보관만 |
| RTcom_Manual_XDM-FT101_FR101 KV Ver.1.3.pdf | manual/RTcom_Manual_XDM-FT101-FR101_Ver1.3.pdf | 같은 판(변경 없음) |
| 사양서_VDM-HOS카드.png | sheet/RTcom_ProductSheet_VDM-HOS4-U_KV07-p30.png | HOS4-U 카드 사양 반영 |

"같은 판"은 `data/products/*.json`의 `sources`와 `src/*.js` 주석에 적힌 판 번호가 같다는 뜻입니다. 이전 세션의 `.source-materials/` 원본은 이 PC에 없어 파일 내용(해시)까지 같은지는 비교하지 못했습니다.

## 사이트 반영

- `src/card-specs.js`
  - HOS4-U: 비어 있던 사양을 KV07 30쪽 값으로 채웠습니다(`missing` 삭제, `source` 추가). 매뉴얼의 "Input Equalization"(출력 보드에 적힌 입력 보정 값)은 출력 카드 설명과 맞지 않아 옮기지 않았습니다.
  - CIS4-U(22쪽)·COS4-U(34쪽): 커넥터, 지원 케이블(CAT5/5e, CAT6/6e, CAT6a, CAT7), 최대 전송거리 100m, HDCP 2.0, 무게 0.45kg을 더했습니다. 매뉴얼의 호환 전송기 목록에 있는 CT/CR-102-U는 0.24.0 결정으로 사이트에서 제외한 모델이라 옮기지 않았습니다(연동 전송기 행은 기존대로 구성기 규칙에서 만듭니다).
  - QOS4S-U(43쪽): 입력 신호(VDM 매트릭스 입력 중 4개), 규격, HDCP, 무게를 더했습니다.
- `src/app.js`: 카드 정보 창 아래 출처 줄이 카탈로그 쪽과 매뉴얼 쪽(`source`)을 함께 보여 줍니다.
- `tests/site.test.cjs`: 카탈로그 쪽이 없더라도 `source`가 있으면 사양이 있어야 하고 `missing`이 없어야 한다는 검사를 더했습니다.
- `scripts/input_doc.py`: Windows 콘솔(cp949) 출력 오류, 파일 이름의 모델명을 찾지 못하던 문제를 고치고, pypdf가 없을 때 `pdftotext`를 쓰게 했습니다.

## 확인 방법

- 알티컴 국문 매뉴얼은 한글 글꼴에 글자 정보가 없어 `pdftotext`로 한글이 나오지 않습니다. 영문 사양표(VDM KV07)는 글자로 읽었고, QMS-88UX 한글 쪽은 로컬 전용 보기 페이지(pdf.js, 127.0.0.1)로 쪽 그림을 열어 확인했습니다. 보기 페이지는 작업 폴더 밖 임시 폴더에만 두었습니다.
- 구성기 화면: VDM → VDM-16X → 03 카드 슬롯에서 HOS4-U·COS4-U·QOS4S-U·HOS4S-UW 카드 정보 창을 열어 사양 행과 출처 줄을 확인했습니다(내장 브라우저 723px 폭). 스크린샷 파일은 남기지 않았습니다.

## 사용자 확인이 필요한 항목

1. **VDM HOS4S-UW 최대 해상도**: 카탈로그 46쪽판 20쪽은 "최대 3840×2160@30Hz", 매뉴얼 KV07 44쪽(표 제목 VDM-HOS4SW)은 "Up to 1920x1080@60Hz"입니다. 사이트는 카탈로그 값을 유지했습니다.
2. **QMS-88UX 멀티뷰 16:9 비율 8분할**: KV.04 22~23쪽 Output Option 5·6은 8분할을 16:9 비율로 유지하는 방식입니다. 사이트 06 화면 구성 모드에는 "8분할(비율무시)"만 있습니다.

## 검증

- `node --test tests/*.test.cjs`: 42개 통과
- `node scripts/build-product-index.cjs --check`: 제품 30개 통과
- `node scripts/package-site.cjs`: 통과
- `node scripts/e2e-smoke.cjs`: playwright가 없어 건너뜀
- `git diff --check`: 통과

## 되돌리기

- 사이트 변경은 이 PR 커밋을 revert하면 됩니다. `input_doc/` 이동은 `INDEX.md`의 원래 이름으로 다시 옮기면 됩니다(파일은 지우지 않았습니다).
