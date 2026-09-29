# 0.136.0 배포 기록 (2026-09-29)

- 사용자 요청: "프레임 실물 이미지는 사용하지 말자 전부 그래픽이미지로 변경해줘", "전부 작업해서 올려줘"
- 병합·배포: `CLAUDE.md` 규칙(검증된 PR은 Claude가 병합·배포, 사용자 결정 2026-09-28)에 따름
- PR: https://github.com/Seoulav/rtcom-configurator/pull/177 (squash 병합, 병합 커밋 `5cd2da0`)
- 배포 작업: `Deploy RTCOM to GitHub Pages` 수동 실행, 공개 주소가 0.136으로 바뀐 것을 확인

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.136`
- main 빌드 산출물 336개 파일의 SHA-256을 공개 파일과 비교해 335개 일치(다른 1개는 배포 시 붙는 `.nojekyll`)
- 삭제한 실물 사진(`xdm.jpg`, `frames/xdm-12-front.webp`)과 `CLAUDE.md`는 404, 새 `xdm-lineup-art.webp`는 200
- 참고: 01 제품군 그래픽 대표 그림은 0.137.0에서 예전 카탈로그 사진으로 되돌림
