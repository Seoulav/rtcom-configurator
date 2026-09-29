# 프레임 실물 사진 → 그래픽 이미지 (0.136.0)

사용자 요청(2026-09-29): "프레임 실물 이미지는 사용하지 말자 전부 그래픽이미지로 변경해줘".

## 바꾼 것

| 구분 | 이전 | 이후 |
|---|---|---|
| XDM 6종 정면 | 카탈로그 실물 사진 | `frames/xdm-*-front-art.webp` 평면 그림 |
| SPX 5종 정면 | 실물 사진 | `frames/spx-*-front-art.webp` |
| VDM-16X·48X 정면 | 실물 사진 | `frames/vdm-16x-front-art.webp`, `vdm-48x-front-art.webp` |
| 01 제품군 대표 그림 | `xdm.jpg`·`spx.jpg`·`vdm.jpg` | `{xdm,spx,vdm}-lineup-art.webp` (프레임 그림을 겹쳐 세움) |
| 제품정보 03 메인프레임 카드 | `*-front.webp` | `*-front-art.webp` |
| 02 아래 바 "다음" 버튼 | 01·02 모두 표시 후 02는 미리보기 버튼과 중복 | 03부터만 표시 |

- 그림 크기(가로:세로)는 제품 데이터의 mm 값을 그대로 쓰고, 화면에 보이는 높이는 0.132의 랙 높이(U) 로그 눈금과 같습니다.
- 예전 사진 26장(XDM·SPX 후면 포함, VDM-16X 후면·48X 정면·후면)과 jpg 3장은 `git rm`으로 삭제했습니다. `package-site.cjs`가 폴더 목록을 그대로 배포하므로 남기면 공개됩니다.
- 그대로 둔 것: 제품정보의 제품 사진(`data/products/*`, `output/design/assets/products/*`, XDM-PSU 전원 장치 사진 포함).

## 다시 만드는 방법

```bash
NODE_PATH=$(npm root -g) node scripts/tools/draw_vdm_frames.cjs            # VDM
NODE_PATH=$(npm root -g) node scripts/tools/draw_xdm_spx_front_frames.cjs  # XDM·SPX 정면
NODE_PATH=$(npm root -g) node scripts/tools/draw_family_lineups.cjs        # 제품군 대표 그림
```

## 검증

- `tests/site.test.cjs`: 그림 파일 존재, 실물 사진이 공개 폴더에 없음, 대표 그림 3장 존재.
- `scripts/e2e-smoke.cjs`: 02 미리보기가 -art 그림으로 바뀌는지, 404 요청 없음, 02 아래 바 버튼 숨김.
- 화면 확인: `docs/qa/frame-graphic-fronts-screens/`

## Rollback

이 PR의 병합 커밋을 되돌리면 사진 파일과 이전 화면이 복원됩니다.
