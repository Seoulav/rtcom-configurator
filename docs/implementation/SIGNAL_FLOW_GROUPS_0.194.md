# 0.194 Signal Flow 출력 묶음·범례·그림 설명

사용자 요청 2026-10-01("GPT에서 개선한 시그널 플로우야 보고 개선해줘"): AV Portal 공통 렌더러 검토안(AV-Portal PR #140, QMS-88UX 비교 fixture)을 보고 RTCOM "03 Signal Flow"를 개선했습니다. AV Portal 코드·데이터를 옮겨 온 것이 아니라, 검토안의 배치 원칙만 RTCOM의 기존 그림 함수(`src/products.js`의 `ioFlowDiagram`)에 반영했습니다.

## 적용 범위

`ioFlowDiagram`을 쓰는 분배기·선택기·일체형 매트릭스 9종: QMS-44UX, QMS-88UX, HD-13U, HD-104U, HD-108U, HD-210U, HD-D102U, HDS-21U, HDS-42MU. 전송기(`extenderDiagram`)·XDM-PSU·SPX-R6 전용 그림과 케이블 그림은 바꾸지 않았습니다(범례가 비어 있으면 목록을 그리지 않는 것만 공통 변경).

## 바뀐 점

| 항목 | 이전 | 0.194 |
|---|---|---|
| 출력 배치 | 멀티뷰(위) · 주 출력(가운데) · AUDIO OUT 칩(아래), 캡션은 패널 밖 | 주 출력 → 멀티뷰 → 오디오 추출 순서로 세로로 쌓은 묶음. 묶음마다 제목(OUT 1–8 · 멀티뷰 9·10 · 오디오 추출)과 설명을 묶음 안에 적음 |
| 경로 | 멀티뷰·오디오 점선, 주 출력은 띠 화살표만 | 띠 끝에서 주 출력은 실선, 멀티뷰·오디오 추출은 점선(보조 경로)으로 갈라짐 |
| 매트릭스 | 입력선이 상자 테두리에서 끝남, 격자가 왼쪽 정렬 | 입력선 끝 화살촉, 격자 가운데 정렬, 상자 아래 "출력마다 입력 선택", 상자에서 띠까지 선으로 이음, 띠 길이 280 → 220 |
| 띠 아래 문구 | "… · 오디오 추출" 포함 | 추출은 오른쪽 "오디오 추출" 묶음 제목으로 보이므로 뺌. 병합·추출 중 하나를 고르는 제품(audioMux select, HDS 선택형)의 "선택" 문구는 유지 |
| 범례 | 없음 | 영상(띠 색) · 오디오(점선) · 멀티뷰 분기(점선), 있는 것만 |
| 그림 설명 | 없음 | 펼치는 "그림 설명"(입력 → 처리 → 신호 → 출력·보조 경로). 같은 내용을 SVG `aria-label`에도 넣음 |
| 키보드·휴대폰 | 그림 칸에 초점 없음, 휴대폰 최소 폭 560px | 그림 칸이 초점을 받아 좌우 방향키로 이동(초점 테두리 표시). 휴대폰에서는 그림 폭의 90%를 최소 폭으로 두고 그림 칸 안에서 가로 스크롤(페이지 가로 넘침 0). 데스크톱 폭은 그대로 |

모니터 아이콘, 멀티뷰 4분할 표시, 크로스포인트 선택 예시 점(출력 수만큼 `r=5`), AUDIO IN "병합" 표시는 그대로 둡니다(e2e 검사 기준 유지).

## 새 데이터 항목 `audioOutFlow`

QMS-88UX "오디오 추출" 묶음에 `QD1 · QD2`와 `QD1: IN 1–4 / QD2: IN 5–8 중 선택`을 적기 위해 선택 항목을 더했습니다. 새 사실이 아니라 입출력 표 오디오 출력 행 조건(근거 M1, 매뉴얼 KV.03 25~26·43쪽, VERIFIED)을 줄인 문구입니다.

```json
"audioOutFlow": {"tag": "QD1 · QD2", "caption": "QD1: IN 1–4 / QD2: IN 5–8 중 선택", "source": "M1"}
```

`scripts/build-product-index.cjs` 검사: `caption` 필수, `source`는 제품 `sources`에 있어야 함, `tag`는 있으면 비어 있지 않은 문자열, 입출력 표에 오디오 출력(OUT·Audio)이 있는 제품에만 씀.

## AV Portal 검토안과 다르게 둔 것

- 출력은 글자 칩(`OUT 1`) 대신 RTCOM 모니터 아이콘을 유지했습니다(멀티뷰 4분할 표시가 아이콘에 있음).
- 데이터 전체를 `signalFlow` 객체로 옮기지 않았습니다. 기존처럼 `io`·`specifications`·`videoModes`에서 뽑고, 입출력 표에서 뽑을 수 없는 짧은 표기만 `audioOutFlow`로 더했습니다.

## 검증

- 1280px·390px에서 9종 캡처 확인, 페이지 가로 넘침 0.
- `node --test tests/*.test.cjs` 83 통과, `build-product-index --check` 32종 통과, `unify_notation.cjs` 바뀔 곳 0건, `e2e-smoke` 219/219 통과.

## 되돌리기

`src/products.js`의 `diagramWrap`·`ioFlowDiagram`, `src/styles.css`의 0.194 블록, `data/products/qms-88ux.json`의 `audioOutFlow`, `scripts/build-product-index.cjs`의 `audioOutFlow` 검사를 이 PR 이전으로 되돌리면 됩니다(`git revert <병합 커밋>`). 다른 제품 데이터는 바꾸지 않았습니다.
