# 0.248.0 배포 기록 (2026-10-17)

- PR: #389 "0.248.0: QMS-88UX 비디오 월 설정 월 2개 이어 쓰기와 일관성 검사"
- 병합: squash, main `733f3fb` (`expectedHeadSha` 6031845 고정, GitHub `RTCOM checks / verify` success)
- 경위: 사용자 요청 "QMS-88Ux out9-10관련해서 제대로 된건지 검증해줘" → "amx커맨드 부분을 이야기하는거야" → "1번 진행해줘". 검증에서 AMX 카드의 월 설정이 월 1개만 만들어 매뉴얼 35쪽 첫 예시(월 2개)를 만들 수 없음을 확인해 보강했습니다.
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 39035911370, success

## 공개 주소 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 표기 | `CATALOG BASED · 0.248` |
| 공개 `src/control-example.js`·`data/products/qms-88ux.json`·`index.html` | 저장소 파일과 SHA-256 앞 12자리 일치(`9bb3f461a5a1`·`26484db4b5a5`·`fa3ebacd71a7`) |
| 공개 `CLAUDE.md` | 404 |
| 공개 `docs/qa/` | 404 |

## 로컬 검증 메모

- 단위 테스트 182개 통과(월 2개 예시·검사 2건 추가), `build-product-index --check` 33개 통과, `e2e-smoke` 282/282 통과(월 2개 이어 쓰기·경고 화면 시험 1건 추가, 버전 표기 변경 뒤 재실행), 표기 통일 바뀔 곳 0건, `check-version` 0.247 → 0.248, `git diff --check` 통과.
- 공개 사이트를 브라우저로 직접 열어 보는 시험은 이 환경의 프록시 인증서 때문에 하지 못해, 공개 파일 해시를 저장소와 비교해 확인했습니다.

## 남은 확인 사항

- 알티컴 확인 대기 질문 31번: 매뉴얼 19쪽과 35쪽 월 구성 상충, 월 2개일 때 `OW` 범위 표기, 출력 9·10번 `OT` 지원 여부(`docs/handoff/RTCOM_QUESTIONS_2026-10-16.md`, `docs/handoff/OPEN_ITEMS.md`).
- 같은 검증에서 발견했으나 이번 요청 범위가 아니라 하지 않은 항목: 쿼드 뷰 8분할 도해 칸 번호(매뉴얼 23쪽과 다름), QD 오디오 선택 `IS` 명령 추가.
