# 0.262.0 배포 기록 (2026-10-26)

- PR: #417 "0.262.0 알티컴 회신 반영 (VDM 쿼드뷰·월 끄기, QMS-88UX·QMS-44UX 설정 명령)"
- 병합: squash, main `c17dc27` (`expectedHeadSha` 64e6d94 고정, GitHub `RTCOM checks / verify` success)
  - 병합 직전 main은 `c1acb9c` 그대로였고 열린 PR은 이 PR 하나뿐이었습니다. 병합 근거는 최신 커밋 `64e6d94`의 검사 성공만 썼습니다.
- 경위: 사용자가 알티컴 통합 메일(2026-10-18 발송) 회신을 번호별 질문 아래에 붙여 전달했습니다(2026-10-26). 답이 온 질문(22번 ②③, 24·25·29·30·31·32번)을 반영했고, 답이 없는 질문(16·21·22 ①·26·27번)은 대기로 남겼습니다. 반영 내용과 이전 결정과 달라진 점은 `docs/implementation/RTCOM_REPLY_0.262.md`에 있습니다.
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 40282427691, success

## 공개 주소 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 표기 | `CATALOG BASED · 0.262` |
| 공개 파일 8개(`index.html`·`src/control-example.js`·`src/vdm-wall.js`·`src/quad-view.js`·`src/products.js`·`data/products/qms-88ux.json`·`qms-44ux.json`·`vdm.json`) | main 파일과 SHA-256 앞 16자리 모두 일치(`89c8ea147444ee89`·`00130de4a5f8d3a2`·`bb4f26dd134910ae`·`b5de40b7ba787c20`·`6d269c0342a2f879`·`dd61954effbdb510`·`6adbf55cd9c82308`·`70b87aa034f71f9f`) |
| 공개 `vdm-wall.js`의 월 끄기(`W10`) 코드 | 6곳 확인 |
| 공개 `qms-88ux.json`의 "멀티뷰 사용자 레이어 배치" | 확인 |
| 공개 `qms-44ux.json`의 "IP 주소 설정" | 2곳 확인 |
| 공개 `CLAUDE.md` | 404 |
| 공개 `docs/` | 404 |

## 로컬 검증 메모

- PR 병합 전 단위 테스트 207개, `build-product-index --check` 33개, 표기 통일 바뀔 곳 0건, `dark_tokens --check` 최신, `check-version` 0.261 → 0.262, `git diff --check`를 통과했습니다. `e2e-smoke`는 292/292 통과했습니다.
- 라이트·다크 캡처는 `docs/qa/rtcom-reply-0.262/`에 있습니다.
- 공개 사이트를 브라우저로 직접 열어 보는 시험은 이 환경의 프록시 인증서 때문에 하지 못해, 공개 파일 해시와 새 문구 존재 여부로 확인했습니다.

## 남은 확인 사항

- 알티컴 회신이 오지 않은 5건(16·21·22 ①·26·27번)은 `docs/handoff/OPEN_ITEMS.md`에 대기로 있습니다.
- VDM 월 끄기는 `W10` 외 형식을 모르는 상태라 화면에 장비 확인 안내가 있습니다(구현 문서 §4).
