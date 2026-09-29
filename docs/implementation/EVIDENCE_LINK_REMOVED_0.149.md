# 0.149.0 검토 결과 근거 문서 링크 삭제

## 배경
구성기 검토 결과 아래 "제품 근거 및 확인 필요 사항 보기 ↗"를 누르면 `docs/evidence/RTCOM_MATRIX_EVIDENCE_AND_GAPS.md`가 브라우저에서 서식 없는 텍스트(검은 배경)로 열렸습니다. 이 문서는 카탈로그 사양의 근거 여부(DOCUMENTED·CANDIDATE·CONFLICT·MISSING)를 적은 내부 검토 기록이라 사용자에게 보여 줄 화면이 아닙니다.

## 변경
- `src/app.js`, `src/workspace.inc.js`: 검토 결과 템플릿에서 링크 삭제
- 근거 문서 파일과 `catalog.js` 머리 주석의 문서 경로는 그대로 둠

## 되돌리는 방법
두 파일의 검토 결과 템플릿 끝에 `<a href="docs/evidence/RTCOM_MATRIX_EVIDENCE_AND_GAPS.md" target="_blank" rel="noopener">제품 근거 및 확인 필요 사항 보기 ↗</a>`를 다시 넣습니다.

## 남은 사항
`scripts/package-site.cjs`가 근거 문서를 공개 폴더에 계속 복사하므로 주소를 직접 입력하면 열립니다. 공개에서 완전히 빼려면 사용자 결정이 필요합니다.
