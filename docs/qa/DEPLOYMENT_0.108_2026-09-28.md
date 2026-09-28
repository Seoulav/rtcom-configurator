# 0.108.0 배포 기록 (2026-09-28)

- 요청: "카달로그는 팝업형태 보이면 어때? 1장짜리라서 파일다운받아서 다시 열기 불편해" → "샘플로 HD-13U만 적용해줘", "순서 대로 장착과 닫기 버튼을 장착으로 통합해줘", "다른 출력 슬롯으로 이동 탭은 없애도 될거 같아 내가 직접 드래그 이동이 가능하니까", "HOS100의 정사분할은 그냥 최대 4분할 명칭 변경", "XTR100 시리즈 동등사양 제품 모두 04 제품사양에... 최대 전송거리100 m (*S/FTP CAT6A필수) 변경해줘"
- PR: https://github.com/Seoulav/rtcom-configurator/pull/121 (squash 병합)
  - 병합 커밋: `8f0c2a0537546760eb2861ed7c24f0df4cae771a`
  - PR head: `d10235a`(작업 중 origin/main이 0.105~0.107.0으로 두 차례 앞서 나가 병합 커밋 두 개로 반영: origin/main 병합, 그리고 다른 세션이 같은 브랜치명(`claude/relaxed-euler-mq1di9`)에 남긴 이미 병합된 내용과의 병합. 두 경우 모두 내용 충돌 없이 버전 이력 줄만 겹쳐 안전하게 해소)
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 97 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36432066751)
  - 결과: success (13:55:08Z → 13:55:39Z)

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.108`
- 공개 파일 대조: `8f0c2a0`에서 `node scripts/package-site.cjs`로 만든 `dist/` 파일과 공개 파일의 SHA-256을 비교했습니다. 274/274 일치했습니다(`.nojekyll` 제외).
- 비공개 파일 4개는 모두 404였습니다: `CLAUDE.md`, `CHANGELOG.md`, `.claude/settings.json`, `docs/qa/DEPLOYMENT_0.107_2026-09-28.md`
- 병합 전 검증 결과
  - `node --test tests/*.test.cjs`: 45/45
  - `build-product-index --check`: 30개 통과
  - `package-site`: 통과
  - `e2e-smoke`: 153/153
  - `git diff --check`: 통과

## 미해결 사항

XDM-CTR100 PSE 02 Port Map의 5번(TX/RX DIP 스위치)·6번(상태 LED) 위치를 사용자가 "안 맞는다"고 지적했으나, 픽셀 단위 재측정(사진 실제 텍스트·부품 경계와 portMap 좌표 비교) 결과 현재 좌표가 사진과 정확히 일치해 문제를 재현하지 못했습니다. 이번 배포에는 포함하지 않았으며, 사용자가 다시 스크린샷으로 정확한 위치를 짚어주면 후속 세션에서 확인합니다.

## 되돌리기

- main에서 `8f0c2a0`을 revert한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다.
