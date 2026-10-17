# 0.249.0 배포 기록 (2026-10-17)

- PR: #391 "0.249.0: QMS-88UX 8분할 도해 번호 정정(4종)과 QD 오디오 입력 선택(IS) 명령"
- 병합: squash, main `c23918b` (`expectedHeadSha` 8f00e78 고정, GitHub `RTCOM checks / verify` success)
- 경위: 사용자 요청 "QMS-88Ux out9-10관련해서 제대로 된건지 검증해줘"에서 나온 두 가지를 "1·2번 진행해"로 처리했습니다. 쿼드 뷰 8분할 도해의 칸 번호가 매뉴얼 23쪽과 달랐고(윗줄 1~4·아랫줄 5~8 한 장), AMX 카드에 QD 오디오 선택(`IS`) 명령이 없었습니다.
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 39037003794, success

## 공개 주소 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 표기 | `CATALOG BASED · 0.249` |
| 공개 `src/products.js`·`data/products/qms-88ux.json`·`index.html`·`src/control-example.js` | main 파일과 SHA-256 앞 12자리 일치(`f333d9ba04cb`·`9d6b7a86dc15`·`eeb68206ae97`·`9bb3f461a5a1`) |
| 공개 `CLAUDE.md` | 404 |
| 공개 `docs/qa/` | 404 |

## 로컬 검증 메모

- 단위 테스트 183개 통과(`IS` 시험 추가), `build-product-index --check` 33개 통과, `e2e-smoke` 283/283 통과(8분할 4종 번호 배치·출력 옵션 안내·QUAD 16종·`IS` 설정 명령 화면 시험 추가, 기존 8분할 시험은 새 이름과 번호 정렬 비교로 갱신), 표기 통일 바뀔 곳 0건, `check-version` 0.248 → 0.249, `git diff --check` 통과.
- 로컬 빌드를 브라우저로 열어 8분할 4종(좌우·상하 × 비율무시·16:9)의 번호 배치와 여백 방향을 매뉴얼 23쪽과 눈으로 대조했습니다.
- 공개 사이트를 브라우저로 직접 열어 보는 시험은 이 환경의 프록시 인증서 때문에 하지 못해, 공개 파일 해시를 저장소와 비교해 확인했습니다.

## 남은 확인 사항

- 알티컴 확인 대기 질문 32번: 매뉴얼 43쪽 `*255ISQ2S3!` 예시 설명("QD 2번 INPUT 5번")과 같은 쪽 표(S3 = QD2의 INPUT 8번) 불일치, `Q1`·`Q2`가 QD 단자인지 입력 그룹인지, QD1만 정하는 형식(`ISQ1S2!`) 허용 여부(`docs/handoff/RTCOM_QUESTIONS_2026-10-16.md`, `docs/handoff/OPEN_ITEMS.md`).
- 질문 31번(0.248): 월 구성 상충(19쪽 대 35쪽), 월 2개일 때 `OW` 범위 표기, 출력 9·10번 `OT` 지원 여부.
- 8분할 도해의 칸 색은 입력 번호별 색이라 매뉴얼의 Q1(파랑)·Q2(초록) 묶음 색과 다릅니다. 번호와 배치는 일치합니다.
