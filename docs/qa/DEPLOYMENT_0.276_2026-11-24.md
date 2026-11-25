# 0.276.0 배포 기록 (2026-11-24)

- PR: #446 "0.276.0 다크 모드 ③ 2차: EDID 로터리·딥 스위치·오디오 설정·오토 셀렉팅 그림"
- 병합: squash, main `a53172a`
  - `expectedHeadSha` 085bebe로 고정했습니다.
  - GitHub `RTCOM checks / verify`는 success였습니다.
  - 병합 직전 main은 `1b85095` 그대로였고, 열린 PR은 #446 하나뿐이었습니다.
- 경위: 사용자 요청 "2차 진행해줘"(2026-11-24).
  - 06 EDID 로터리·07 딥 스위치·오디오 설정 칸·08 오토 셀렉팅 그림의 다크 모드 흰 판을 없앴습니다.
  - 작업 중 받은 사용자 질문 "제품 사진도 다크모드 지원하게 변경하니?"에는, 실물 사진은 밝은 받침을 유지한다고 답했습니다.
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 45329909445(413번), success(build → deploy 두 작업 구조)

## 공개 주소 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 표기 | `CATALOG BASED · 0.276` |
| 공개 `index.html`·`src/products.js`·`src/styles.css` | main 빌드와 SHA-256 앞 16자리 일치(`5d65be4c75c04737`·`e78322e6204027ab`·`1f41cfd17fe92d97`) |
| 공개 `products.js`의 다크 표시 클래스 | `class="rt-pg-dark-svg"` 6곳 |
| 공개 `styles.css`의 2차 다크 규칙 | `svg.rt-pg-dark-svg` 43곳 |
| 공개 `CLAUDE.md` | 404 |
| 공개 `docs/` | 404 |

## 로컬 검증 메모

- 단위 시험 220개
- `build-product-index --check` 33개
- `e2e-smoke` 315/315
- `dark_tokens --check` 최신, 표기 통일 0건
- `check-version` 0.275 → 0.276
- 자세한 내용은 `docs/implementation/DARK_PARTS_0.276.md`에 있습니다.
- 공개 사이트를 브라우저로 직접 여는 시험은 이 환경의 프록시 인증서 때문에 하지 못했습니다. 대신 공개 파일 해시와 코드 검색으로 확인했습니다.

## 남은 확인 사항

- 다크 모드 ③ 3차(`docs/handoff/OPEN_ITEMS.md`)
