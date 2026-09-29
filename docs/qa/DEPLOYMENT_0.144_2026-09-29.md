# 0.144.0 배포 기록 (2026-09-29)

- 사용자 요청: "CTR100 이거 대폭 압축요약정리해줘"
- 병합·배포: `CLAUDE.md` 규칙(사용자 결정 2026-09-28)에 따름
- PR: https://github.com/Seoulav/rtcom-configurator/pull/192 (squash 병합, 병합 커밋 `92dca41`)
- 배포 작업: `Deploy RTCOM to GitHub Pages` 수동 실행(run 162)

## 변경 요약

XDM-CTR100 제품 상세 "05 주요 기능" 7개 항목의 긴 괄호 설명을 짧게 정리했습니다. TX/RX 카드 연동과 Long Reach를 한 줄로 합치고, PD 모드 설명에서 XDM-PSU·CIS100·COS100 직결 조건을 빼고, HDMI 연결·상태 LED 항목의 세부 설명을 뺐습니다(세부 내용은 03 Port Map·06 딥 스위치 설정에 이미 있어 정보 손실 없음). 04 제품 사양·다른 제품은 그대로입니다.

## 검증

```
node --test tests/*.test.cjs        # 62/62 pass
node scripts/build-product-index.cjs --check   # 제품 31개 검증 통과
node scripts/package-site.cjs       # Static site prepared in dist/
node scripts/e2e-smoke.cjs          # 188/188 passed
git diff --check                    # 통과
```

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.144`
- main 빌드 산출물 338개 파일 중 337개가 공개 파일과 SHA-256 일치(다른 1개는 `.nojekyll`, 배포 제외)
- `CLAUDE.md`는 공개 주소에서 404
- 공개 `data/products/xdm-ctr100.json`에서 압축된 "05 주요 기능" 7줄 확인
