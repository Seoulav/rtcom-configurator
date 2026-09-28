# 인치·lbs 등 병기 삭제 + OBHD-2C·OBUX-1C 입력단자/출력단자 행 삭제 QA (2026-09-28)

## 배경

- 사용자가 OBHD-2C "04 제품 사양" 화면을 캡처해 "입력 출력단자 Female male이런거 전부 지워줘"라고 요청. 이어서 "모든 제품에 인치, lbs등등 있으면 다 지워"라고 범위를 전체 제품으로 넓힘.
- 사용자 확인: 입력단자/출력단자 행 삭제는 OBHD-2C·OBUX-1C 두 제품 모두에 적용(같은 패턴의 제품이 이 둘뿐임을 확인 후 질문으로 범위 확정).

## 변경 내용

### 1. 입력단자/출력단자 행 삭제 (Female/male 표기 포함)

`data/products/obhd-2c.json`, `data/products/obux-1c.json`의 04 제품 사양(`specifications`)에서 "입력단자"·"출력단자" 행을 통째로 삭제했습니다. 이 두 제품에만 있던 행이며(`grep '"name": "입력단자"'` 확인), 03 단자 지도(Port Map)는 그대로 두어 실제 단자 구성 정보는 남아 있습니다.

### 2. 인치(in)·파운드(lbs) 병기 삭제 (전 제품)

`data/products/*.json` 전체에서 mm/kg(미터법) 옆에 괄호나 병기로 붙어 있던 인치·lbs 값을 지웠습니다. 모델명이나 "공통"·"각각"·"단독" 같은 구분 표시는 그대로 남기고, 숫자+단위 부분만 제거했습니다.

- 조건 칸이 인치/lbs 값뿐이던 행은 빈 문자열로 정리: `obhd-2c`(크기·무게), `obux-1c`(크기·무게), `mr-4s`(크기), `xdm-ctr100`(무게), `xdm-ctr100-pse`(크기·무게), `hd-210u`(크기)
- 모델명 등 다른 정보와 같이 있던 행은 인치/lbs 부분만 제거:
  `spx-rx-tx`, `ct101-u-cr101-u`(크기 2행·무게), `ct103-u-h-cr103-u`(크기·무게), `ct104-u-cr104-u`(크기·무게 2행), `ft101-u-fr101-u`(크기·무게), `ft103-u-h-fr103-u`(크기·무게), `mr-4s`(무게), `xdm-ct103-cr103`(무게 2행)
- Pull up 저항력(당김 강도) 수치에 lbs·Newtons·kg 세 단위가 함께 있던 `hoc-ux`·`lhoc`·`ahoc`는 lbs만 지우고 Newtons(SI 단위, 인치·lbs와 무관)는 남겼습니다(`text`, `specifications` 조건 칸 각각).

인치·lbs가 전혀 없던 제품(HD-104U·HD-108U·HD-D102U·QMS-88UX·HDS-21U 등)은 손대지 않았습니다.

## 검증

```
node --test tests/*.test.cjs        # 39/39 pass
node scripts/build-product-index.cjs --check   # 제품 29개 검증 통과
node scripts/package-site.cjs       # dist/ 생성 성공
node scripts/e2e-smoke.cjs          # 139/139 passed
git diff --check                    # 공백 충돌 없음
```

추가로 아래 정규식으로 잔여 인치·lbs 병기가 없는지 확인했습니다.

```
grep -rnE "\\blbs\\b|in×|['\"]×|″" data/products
```

## 롤백 방법

이 커밋만 되돌리면 원래 병기가 복원됩니다(`git revert <commit>`). 별도 스키마·호환성 계약 변경 없음(`specifications` 배열 구조·필드는 그대로, 값만 수정/행 삭제).
