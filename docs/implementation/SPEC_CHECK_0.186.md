# 사양값 확인 8그룹 정리 (0.186)

근거 표: `docs/audit/NOTATION_REVIEW_2026-09-30_spec_check.csv`(ChatGPT 검수 2026-09-30). 사용자 답변(2026-10-01)과 매뉴얼 확인 결과대로 고쳤습니다.

| 그룹 | 사용자 답변·근거 | 바꾼 곳 |
|---|---|---|
| C01 VDM 프레임 9종/10종 | "진행" → 라인업(VDM-256X 포함) 기준 10종 | `vdm.json` seriesNote·overview·features |
| C02 채널 목록 256 누락 | C01과 같은 이유(10종에 맞춤) | `vdm.json` 04 사양 입력·출력 채널 |
| C03 SPX 출력 카드 3종/4종 | "수정" → SPX 매뉴얼 250805 p.3: HOS10·HOS12·COS12 3종, HOS10은 M810·M1620만 | `src/core.js` 구성 검토 문구 |
| C04 FT103-U-H 해상도 | "4K/30, 1080p 모두 가능" | `ft103-u-h-fr103-u.json` overview·features·사양 |
| C05 XDM-FT101 5핀/3핀 | 매뉴얼(xdm-ft101-fr101-manual.pdf) 4쪽 "5p Phoenix for RS-232+ & Stereo Audio", 6~7쪽 "오디오 입력 Phoenix 3p"·"⏚ Tx Rx RS-232C": 5핀 단자 하나를 오디오 L·R·⏚ 3핀과 RS-232 Tx·Rx가 접지 공용으로 나눠 씀 | `xdm-ft101-fr101.json` overview·edidSwitch |
| C06 QMS-88UX 9·10번 | "멀티뷰로도, 일반 라우팅으로도 쓸 수 있음" | `qms-88ux.json` features·사양·io·videoModes QUAD·portMap, `src/products.js` 멀티뷰 번호 읽기 규칙(`전용|에서`) |
| C07 HD-D102U | "2.0으로 변경" | `hd-d102u.json` features |
| C08 VDM HDCP | "둘 다 되는 걸로" | `vdm.json` features "HDCP 1.x·2.0 지원" |

## 검증
- 기본 검증 명령(단위 테스트·색인 검사·build·e2e·`git diff --check`), `unify_notation.cjs` "바뀔 곳: 0건".

## 되돌리기
- 이 PR의 squash 커밋을 revert하면 됩니다. 데이터 문구만 바뀌었고 저장 형식(schema 3)·LocalStorage 키는 그대로입니다.
