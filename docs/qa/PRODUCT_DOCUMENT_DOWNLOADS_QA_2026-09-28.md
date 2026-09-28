# 제품 상세 카탈로그·매뉴얼 PDF 버튼 QA (2026-09-28)

## 미리보기 확인

- 방법: `dist`를 작업용 임시 폴더(scratchpad)로 복사했습니다. 그 복사본에서만 HD-13U에 빈 샘플 PDF 2개(`hd-13u-catalog.pdf`, `hd-13u-manual.pdf`)를 등록하고 확인했습니다. 저장소와 공개 사이트에는 PDF를 넣지 않았습니다.
- 1280px
  - 버튼이 `← 제품 목록 | 카탈로그 PDF ⤓ | 매뉴얼 PDF ⤓ | 제조사 원본 다이어그램 | 인쇄 / PDF` 순서로 나왔습니다.
  - 이름 부분을 누르면 새 탭(popup)에서 `output/design/assets/docs/hd-13u-catalog.pdf`가 열렸습니다.
  - 화살표를 누르면 `hd-13u-manual.pdf`가 내려받아졌습니다.
- 390px: 버튼이 줄바꿈되고, 페이지 가로 넘침은 없었습니다(scrollWidth 390).
- 스크린샷: `docs/qa/product-docs-screens/hd-13u-docs-1280.png`, `hd-13u-docs-390.png`

## 권한 검사로 막힌 작업

- 비공개 원본 `.source-materials/RTcom_Manual_HD-13U_Ver1.2.pdf`를 공개 폴더로 복사하는 명령이 자동 권한 검사에서 거부됐습니다.
- 그 뒤 사용자가 "모든 제품들 카다로그와 메뉴얼 내가 직접 올릴꺼야"로 정했습니다. 그래서 PDF는 사용자가 직접 올리고, Claude는 등록·검증만 합니다.

## 검증

- `node --test tests/*.test.cjs`: 40/40
  - 새 검증 규칙 테스트: 없는 파일, 이름 형식, 다른 제품 id, 허용되지 않은 종류, "배포 제외" 표기, 같은 종류 두 개일 때 label
- `node scripts/build-product-index.cjs --check`: 30개 통과
- `node scripts/package-site.cjs`: dist에 PDF·README 없음(등록 파일 0개)
- `node scripts/e2e-smoke.cjs`: 143/143 (HD-13U·HD-104U 문서 버튼 수 = 등록 파일 수)
- `git diff --check`: 통과
