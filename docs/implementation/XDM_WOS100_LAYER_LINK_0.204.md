# WOS100 카드 상세·카드 선택 팝업의 레이어 팝업 버튼 (0.204.0)

## 요청

사용자 지적 2026-10-12: 공개 사이트(0.203) 03 카드 슬롯에서 XDM-WOS100 카드 상세 팝업을 열어 보며 "안보여". 0.203의 레이어 구성도·비교표 팝업은 02 프레임 선택의 카드에서만 열려 03 단계에서는 들어갈 길이 없었습니다.

## 처리

1. `openCardInfo()`: 카드가 `XDM-WOS100`이면 설명문(`rt-card-info-note`) 아래에 "레이어 구성도 · 비교표 보기" 버튼(`data-action="layer-compare"`)을 둡니다. 이 팝업은 03 카드 슬롯의 카드 상세와 제품정보 카드 상세가 함께 씁니다.
2. `cardChoiceModal()`: 출력 슬롯 카드 선택 팝업의 "XDM-WOS100 · 4레이어" 활용 TIP에도 같은 버튼(흰 테두리 변형 `rt-layer-open-tip`)을 둡니다.
3. 버튼은 기존 루트 클릭 위임(`b.dataset.action==='layer-compare'`)이 받아 `openLayerCompare()`를 부릅니다. 이미 열린 `<dialog>` 위에 두 번째 `<dialog>`가 `showModal()`로 겹쳐 열리고, 닫으면 초점이 누른 버튼으로 돌아가 원래 팝업이 그대로 남습니다.

## 바뀐 파일

- `src/app.js`: 두 자리에 버튼 추가, 0.204 주석.
- `src/styles.css`: `.rt-layer-cta`, `.rt-layer-open-tip`.
- `index.html`·`README.md`·`CHANGELOG.md`·`CLAUDE.md`: 0.204.0. `docs/qa/DEPLOYMENT_0.203_2026-10-12.md` 배포 기록 동봉.

## 영향 범위

저장 형식·카탈로그·슬롯 ID·주소 변경 없음. 새 배포 파일 없음.

## 되돌리기

`git revert <0.204 커밋>`.
