# 구성기 단일 사이트 QA (0.7.0)

- 실행일: 2026-09-25
- 환경: Linux 클라우드 컨테이너, Node 22, Chromium(Playwright)

## 자동 검사

| 명령 | 결과 |
|---|---|
| `node --test tests/*.test.cjs` | 20/20 통과 (core 14 + site 6) |
| `node scripts/package-site.cjs` | 성공, `dist/` 약 784KB (0.6: 약 4.3MB) |
| `node scripts/e2e-smoke.cjs` | 12/12 통과 |
| `git diff --check` | 통과 |

## 브라우저 검사 항목 (390px, `/rtcom-configurator/` 하위 경로)

| 항목 | 결과 |
|---|---|
| 첫 화면에 구성기 표시 | PASS |
| XDM → XDM-144 → 슬롯 선택 → 카드 장착 후 카드 이미지 표시 | PASS |
| XDM-144 후면 사진 로드 | PASS |
| 깨진 이미지 0개 | PASS (0.6 앱 내 이동 시 7개) |
| 주소가 바뀌지 않음 | PASS |
| 페이지 가로 넘침 없음 | PASS (0px) |
| 새로고침 후 자동 저장 복원 | PASS |
| `/tools/matrix-configurator/`, `/products/`, `/tools/matrix-configurator` → 첫 화면 이동, `#matrix-configurator` 유지 | PASS |
| 404 요청 0건 | PASS (0.6 앱 내 이동 시 12건) |
| 자바스크립트 오류 0건 | PASS |

## 스타일 정리 회귀 확인

정리 전 `styles.css`와 정리 후 파일을 같은 배포본에 각각 넣고, 1280px·390px 화면에서 구성기 6단계(제품군, 섀시, 카드 장착 전후, 전송기, 검토, 출력) 총 14개 화면의 모든 요소(2,906개)에 계산된 스타일을 비교했습니다.

- 결과: 3회 반복 모두 14/14 동일
- 참고: 픽셀 스크린샷 비교는 같은 버전끼리도 전환 효과·이미지 로딩 시점 때문에 결과가 흔들려 판정에 쓰지 않았습니다.

## 미검증

- 실제 GitHub Pages 배포 후 확인: 배포는 사용자 승인 뒤 진행하므로 아직 하지 않았습니다.
- JSON·CSV 다운로드 파일 내용, 실제 인쇄 결과, Safari·Firefox 동작: 이번 변경에서 구성기 코드는 바뀌지 않았지만 브라우저에서 다시 확인하지 않았습니다.
