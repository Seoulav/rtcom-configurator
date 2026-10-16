# 색 변수화 0.232 (다크 모드 B단계 ①)

## 무엇을 했나
- `src/styles.css`에 직접 적혀 있던 면(`background`)·글자(`color`)·선(`border`·`outline`·옅은 그림자 테두리) 색 426곳을 `--rt-bg-<색>`·`--rt-fg-<색>`·`--rt-ln-<색>` 변수 182개(면 65·글자 89·선 28)로 바꿨습니다.
- 변수 값은 원래 색과 같으므로 라이트 화면은 그대로입니다. 다크 값 연결은 다음 PR(0.233, B②)입니다.

## 제외한 것
`#rtcom-design` 밖 규칙, 인쇄(`@media print`)·보고서(`.rt-rp*`·`#print-report`·`.rt-report`), `::backdrop`, 흰색·아주 옅은 글자, 어두운 면, 채도 높은 강조·신호 색, 투명도 있는 색(흰 유리 배경 제외), 옅은 회색 1px 테두리 외 그림자(건너뛴 선언 60개).

## 검증
- `node scripts/tools/tokenize_colors.cjs --verify <변경 전 CSS>`: 변수를 되돌리면 원본과 완전히 같음(통과).
- 단위 테스트 131 통과, 제품 색인·패키징 통과, e2e 253/253 통과.

## 되돌리기
이 PR을 되돌리면 됩니다. 도구 `scripts/tools/tokenize_colors.cjs`는 점검(기본)·`--apply`·`--verify` 방식이 있습니다.
