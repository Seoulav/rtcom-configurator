# 0.141.0 배포 기록 (2026-09-29)

- 사용자 요청: "우리가 사용하는 케이블로 SPX전송거리 TEST를 해봤어 결과를 내용에 별도 내용으로 추가하는게 어때?"(UTP 케이블 Belden 7814A 50m 이내, SF/UTP 케이블 Belden CI6522 70m 이내)
- 병합·배포: `CLAUDE.md` 규칙(사용자 결정 2026-09-28)에 따름
- PR: https://github.com/Seoulav/rtcom-configurator/pull/184 (squash 병합, 병합 커밋 `81b564c`)
- 배포 작업: `Deploy RTCOM to GitHub Pages` 수동 실행(run 155)

## 변경 요약

`data/products/spx-rx-tx.json`의 `specifications`에 매뉴얼 공식 사양(M1)과 별도로 서울영상테크 SI사업본부 자체 케이블 실측 결과 두 행("케이블 실측 테스트(자사)")을 추가하고 새 출처 코드 `U3`를 남겼습니다. spec `name`에 "전송거리"를 넣지 않아 02 신호 흐름 다이어그램의 자동 케이블 거리 표시(`name` 필터)에는 섞이지 않습니다.

## 검증

```
node --test tests/*.test.cjs        # 54/54 pass
node scripts/build-product-index.cjs --check   # 제품 31개 검증 통과
node scripts/package-site.cjs       # Static site prepared in dist/
node scripts/e2e-smoke.cjs          # 177/177 passed
git diff --check                    # 통과
```

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.141`
- main 빌드 산출물 336개 파일 중 335개가 공개 파일과 SHA-256 일치(다른 1개는 `.nojekyll`, 배포 제외)
- `CLAUDE.md`는 공개 주소에서 404
- 공개 `data/products/spx-rx-tx.json`에서 새 "케이블 실측 테스트(자사)" 두 행(50m/70m) 확인
