# 0.134.0 배포 기록 (2026-09-29)

- 사용자 요청: "분배기를 제외한 영역 색상 조금만 어둡게해줘"
- 병합·배포: `CLAUDE.md` 규칙(검증된 PR은 Claude가 병합·배포, 사용자 결정 2026-09-28)에 따름
- PR: https://github.com/Seoulav/rtcom-configurator/pull/173 (squash 병합, 병합 커밋 `1905c1b`)
- 배포 작업: `Deploy RTCOM to GitHub Pages` https://github.com/Seoulav/rtcom-configurator/actions/runs/36512229807, 결과 success

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.134`
- 공개 `hd-d102u-rack-front-art.webp`의 SHA-256 앞 16자리(`2c56c5007864c188`)가 main 파일과 일치
- 비공개 파일: `CLAUDE.md` 404
- 병합 전 검증: `node --test` 54/54(처음 1건 실패 — 0.121 테스트가 예전 몸체 색을 검사하던 것이라 새 색 기준으로 고침), `build-product-index --check` 31개, `package-site`, `git diff --check` 통과. `e2e-smoke`는 playwright 브라우저가 없어 건너뜀
- 공개 파일 전수 대조는 하지 않음(그림 1개 교체)

## 영향

- HD-D102U Rack마운트 정면 그림의 몸체·랙 귀·위아래 레일이 조금 어두워지고 분배기 12칸은 밝게 유지. 배치·좌표 불변

## 되돌리기

- main에서 `1905c1b`를 revert한 뒤 다시 배포합니다.
