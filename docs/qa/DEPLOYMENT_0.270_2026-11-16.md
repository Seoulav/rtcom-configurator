# 0.270.0 배포 기록 (2026-11-16)

- PR: #435 "0.270.0 HDS 개선 펌웨어 Priority 확인 반영"
- 병합: squash, main `527a579` (`expectedHeadSha` 7d2f490 고정, GitHub `RTCOM checks / verify` success, e2e 단계 포함)
  - 병합 직전 main은 `d8b26ae` 그대로였고 열린 PR은 다른 세션의 #431(0.269.0 번호 사용, 초안)뿐이었습니다. #431은 병합 전에 main을 합치고 번호를 0.271.0으로 옮겨야 합니다(그 세션의 몫).
- 경위: 사용자가 "HDS-42MU, HDS-21U 개선 펌웨어 적용해서 TEST까지 완료했어"(2026-11-16)라고 알렸고, 확인 질문에 "딥 스위치 2번은 매뉴얼과 같음"·"펌웨어 버전 번호는 적지 않음"으로 답했습니다. 상세는 `docs/implementation/HDS_PRIORITY_CONFIRM_0.270.md`입니다.
- Pages 배포: `Deploy RTCOM to GitHub Pages` main `527a579` 기준 success

## 공개 주소 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 표기 | `CATALOG BASED · 0.270` |
| 공개 `data/products/hds-42mu.json`·`hds-21u.json`·`index.html` | main 파일과 SHA-256 앞 16자리 일치(`src/products.js`도 일치) |
| 두 제품 JSON의 새 출처 문구("사용자 시험 2026-11-16") | 각 1곳 반영 |
| 공개 `CLAUDE.md` | 404 |
| 공개 `docs/implementation/HDS_PRIORITY_CONFIRM_0.270.md`·`docs/handoff/OPEN_ITEMS.md` | 404 |

## 로컬 검증 메모

- 단위 테스트 210개, 화면 시험 294/294, `build-product-index --check` 33개, 표기 통일 바뀔 곳 0건, `check-version` 0.269 → 0.270, `git diff --check` 통과.
- 확인 중 로컬 `origin/main`이 병합 전 값이라 해시가 처음에 "불일치"로 보였으나, `git fetch` 뒤 다시 비교하니 모두 일치했습니다(배포 문제가 아님).

## 남은 확인 사항

- 개선 펌웨어 버전 번호와 이미 출고된 제품의 업데이트 필요 여부는 알티컴 재요청 메일 E-3 회신 뒤 사이트에 적을지 다시 판단합니다.
- 저장소 공개 상태(2026-11-16 확인: public)에서 `docs/`·`CLAUDE.md`의 AV Portal·AV 빌더 언급 정리 여부와 공개 데이터 `slots`·`io` 필드 유지 여부는 사용자 결정 대기입니다.
