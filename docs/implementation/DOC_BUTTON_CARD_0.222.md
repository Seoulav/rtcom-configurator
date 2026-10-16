# 문서 버튼 카드형 개편 (0.222.0)

## 요청과 결정

- 사용자 요청 2026-10-16: "카타로그, 메뉴얼 보기 이쪽 디자인 변경하고 싶어 개선 시안을 보여줘".
- 시안 3종(A 카드형·B 메뉴 한 개·C 문서 타일)을 비교한 뒤 사용자가 "시안 A (추천)하자"로 선택했습니다.

## 바뀐 내용

- 대상: 제품 상세 상단의 카탈로그·매뉴얼·제품 안내서 버튼(`docButtons`, 공식 홈페이지 버튼은 제외).
- 왼쪽 칸: 종류별 색 아이콘(카탈로그 파랑 `--pg-accent`, 매뉴얼 보라 `--pg-purple-ink`, 제품 안내서 남색 `--pg-accent-2`) + 굵은 "○○ 보기" + 보조 줄. 보조 줄은 `page`가 있으면 "N쪽", 문서 제목에 `Ver.N`이 있으면 그 판 번호, 없으면 "PDF"입니다(`docSub`).
- 오른쪽 칸: "↓ 다운로드"(아이콘은 문서 종류 색). 480px 이하에서는 기존대로 글자를 숨기고 화살표만 둡니다.
- 툴바 세로 정렬을 가운데로 맞췄습니다(카드가 다른 알약보다 높아졌기 때문).

## 바뀌지 않은 것

- `documents[]` 데이터, 팝업(`data-doc-preview`)·새 탭·다운로드 동작, 호환성 계약 항목(LocalStorage key, schema 3, catalogVersion 등).
- 기존 클래스 `rt-pg-doc`·`rt-pg-doc-open`·`rt-pg-doc-save`·`rt-pg-doc-save-text`와 `data-doc` 속성은 그대로 두고 `rt-pg-doc-card`를 더했습니다.

## 검증

- `node --test tests/*.test.cjs` 102개 통과(0.222 단위 테스트 추가).
- `node scripts/build-product-index.cjs --check` 통과, `node scripts/package-site.cjs` 통과.
- `node scripts/e2e-smoke.cjs` 239/239 통과. XDM 문서 버튼 확인 줄은 카드 안 `<b>` 글자를 읽도록 고쳤습니다.
- 화면 확인: `docs/qa/doc-button-card-0.222/ft101-pc.png`(PC), `ft101-phone.png`(폭 400px). 두 화면 모두 겹침·잘림이 없습니다.

## rollback

- 이 PR을 되돌리면(`git revert`) 이전 알약 모양으로 돌아갑니다. 데이터 변경이 없어 다른 되돌릴 작업은 없습니다.
