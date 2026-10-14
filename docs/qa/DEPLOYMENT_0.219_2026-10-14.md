# 0.219.0 배포 기록(2026-10-14)

- PR: #333 (`0.219.0: 03 카드 슬롯 시안 C(채널 범위 태그·신호 색 완성도 막대·연동 전송기 묶음)`) → main 병합, squash 커밋 `e3cf7ff`
- 병합 전 검사: `RTCOM checks / verify` 성공(head `0c31649`, run 38650794246)
- 병합 방식: GitHub 연결 도구로 `expectedHeadSha`를 고정해 squash 병합(병합 직전 main `28adaa7` 변경 없음 확인)
- Pages 배포: `Deploy RTCOM to GitHub Pages`(`pages.yml`) 수동 실행, run 38651453487, 결과 success, main `e3cf7ff`
- 공개 주소 확인:
  - `https://seoulav.github.io/rtcom-configurator/`에 `CATALOG BASED · 0.219` 표기
  - 공개 `src/app.js`에 시안 C 코드(`rt-slot-tag-ch`·`rt-summary-links`) 반영
  - `CLAUDE.md` 공개 주소 HTTP 404(비공개 유지)
- 함께 기록한 문서 변경: FT101-U/FR101-U 매뉴얼은 사용자가 직접 검토한 뒤 다시 제공하기로 함(사용자 결정 2026-10-14 "내가 직접보고 메뉴얼 다시줄께"). `docs/handoff/OPEN_ITEMS.md`와 `docs/RTCOM_MANUFACTURER_DATA_REQUEST.md` 질문 14번 답 칸에 고칠 쪽(4~7·9~12쪽, 표지 부제)을 적음
- 되돌리기: `git revert e3cf7ff` 후 Pages 배포를 다시 실행하면 슬롯 태그의 CH 범위, 슬롯별 완성도 막대, 연동 전송기 묶음이 빠지고 0.218 화면으로 돌아갑니다.
