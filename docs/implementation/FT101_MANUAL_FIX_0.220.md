# 0.220 FT101-U/FR101-U 정정 매뉴얼 반영

## 배경

0.215에 공개한 FT101-U/FR101-U 매뉴얼 Ver.1.4(2026-10-07판)는 표지·구성품만 FT-101-U였습니다. 4~12쪽의 사양표·앞면 설명·주요 특징·사용 방법·보증서는 FT-103-U-H 매뉴얼 내용이었습니다(알티컴 질문 14번).

- **사용자 결정(2026-10-14):** "내가 직접보고 메뉴얼 다시줄께"
- **사용자 제공(2026-10-16):** "메뉴얼 다시 올린다". 파일은 `RTcom_Manual_FT_FR101-UH_…_Ver.1.4_261007.pdf`, 13쪽입니다.

## 정정본 확인

쪽별로 모델 표기를 대조했습니다.

| 쪽 | 첫 공개본 | 정정본 |
|---|---|---|
| 1 | 부제 "HDMI over Fiber(2LC) Wall Plate Extender" | "HDMI over Fiber(2LC) Extender" |
| 4~5 | 사양표 모델명 FT-103-U/FR-103-U, 91.44×107.95mm | FT-101-U/FR-101-U, 144.78×114.3×31.75mm |
| 6~7 | FT-103-U-H 앞면(EDID 로터리·SET 토글) | FT-101-U·FR-101-U 사진과 번호 1~8(전원 스위치, LED, Mini USB, DC IN, HDMI, AUDIO, RS-232C, FIBER) |
| 9~12 | FT/FR-103 기준 | FT/FR-101-U 기준 |

FT-103 표기는 0건입니다. 남은 오기는 1건입니다.
- **4쪽 TX 입력 "HDMI 2 Ports":** 6쪽 사진과 설명에는 HDMI IN이 1개입니다. 오기로 보고 사이트는 1개를 유지합니다.

## 반영 내용

판단 기준은 "매뉴얼 기준"입니다(0.86 "새로준 자료 기준으로", 0.215와 같은 방식).

| 항목 | 이전(카탈로그) | 0.220(매뉴얼) |
|---|---|---|
| 전원 | DC +12V 2A | DC +12V 1A 이상(04 사양, 단자 지도 DC IN) |
| 규격 | FT·FR 두 행 "DVI 1.0, HDMI 1.4b" | 한 행 "DVI 1.0, HDMI 1.4", 단자 표 HDMI 1.4 |
| 크기 | FT101-U 행 | 송·수신기 공통 144.78×114.3×31.75mm |
| 무게 | FT101-U 0.65kg | FT101-U 0.24kg, FR101-U 0.23kg(매뉴얼 0.53lbs·0.50lbs, 송·수신기 값이 달라 복사 오타가 아님) |
| RS-232 단자 | 피닉스(핀 수 미기재) | 피닉스 3핀 |
| 펌웨어 포트 | 없음 | 송·수신기 Mini USB 행 추가 |
| 05 주요 기능 | — | 오디오 병합(입력이 DVI 신호일 때)·추출, VDM FIS4-U·FOS4-U 연동 |

반영하지 않은 값은 아래와 같습니다.
- **해상도 "Up to Ultra 4K, 4096x2160p 24/25/30Hz":** 0.182 기준대로 `최대 4K/30 (3840x2160 @ 24/25/30Hz)`를 유지합니다.
- **"RS232/422":** 사이트는 RS-232로 적습니다(단자 실크는 RS232C).

구성기 04 전송기 카드(`src/app.js`)도 고쳤습니다.
- **전원 문구:** CT104-U·CR104-U·FT101-U·FR101-U의 "전원: DC 12V 2A"를 "DC 12V 1A 이상"으로 맞췄습니다. CT104-U·CR104-U는 0.215에서 데이터만 바뀌고 구성기 문구가 남아 있었습니다.
- **규격 문구:** FT101-U·FR101-U의 "HDMI 1.4b"를 "HDMI 1.4"로 바꿨습니다.

## 공개 PDF

`output/design/assets/docs/ft101-u-fr101-u-manual.pdf`를 정정본으로 교체했습니다.
- **제목:** 문서 속성 제목은 "FT101-U / FR101-U 사용자 매뉴얼 Ver.1.4"만 남겼습니다.
- **삭제한 정보:** 작성자("user"), 만든 프로그램, 날짜, XMP를 지웠습니다(PyMuPDF).
- **결과:** 13쪽, 670KB입니다.

## 검증

- `node --test tests/*.test.cjs`
- `node scripts/build-product-index.cjs --check`
- `node scripts/package-site.cjs`
- `node scripts/e2e-smoke.cjs`
- `node scripts/tools/unify_notation.cjs`(바뀔 곳 0건)
- `node scripts/check-version.cjs --against origin/main`
- `git diff --check`

`tests/site.test.cjs`에 0.220 검사를 추가했습니다.
- 전원·규격·무게 값
- Mini USB와 피닉스 3핀 단자 각 2행
- 매뉴얼 설명에서 FT103 문구 삭제
- 구성기 전송기 4종의 전원·규격 문구

## 되돌리기

`git revert <0.220 커밋>`을 실행한 뒤 Pages 배포를 다시 실행합니다. 이렇게 하면 공개 PDF가 첫 공개본(FT103 사양표)으로 돌아가고, 사양은 카탈로그 값으로 돌아갑니다.
