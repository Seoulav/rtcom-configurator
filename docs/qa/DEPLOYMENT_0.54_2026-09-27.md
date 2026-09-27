# 0.54.0 GitHub Pages 배포 기록

- 배포일: 2026-09-27
- 사용자 요청: "1)XDM-CTR100, CTR100 PSE 04 사양에 딥스위치는 빼줘 그리고 05 주요 기능을 압축요약해줘 2) 전 제품 05 주요기능 설명에 늘어져있다면 압축요약해줘 3) 02 신호흐름 추천 케이블은 보라색사각버튼 출력 오른쪽에 표기해줘 4) 모든 전송기는 MATRIX COS,CIS,FIS,FOS 연결하면 통합제어(AMX)--> MATRX--> 전송기--> RS232신호가 나와" + "여기까지 다 끝나면 지금까지 업데이트 상황을 병합배포해줘"
- 소스 병합: PR #33 → `main` 병합 커밋 `cce0aa601801b724298669c4edfe2f7ed48f35b9`
- 배포 방법: `Deploy RTCOM to GitHub Pages`(`.github/workflows/pages.yml`)를 `main`에서 실행
- GitHub Actions run: `36318750799`(실행 번호 29), `completed / success`
- 공개 URL: `https://seoulav.github.io/rtcom-configurator/`

## 이번에 공개된 버전

| 버전 | 내용 | 병합 |
|---|---|---|
| 0.53.0 | QMS-88UX 오디오 설명 정리·신호 흐름 점선 정돈·조건 칸 출처 문구 삭제·05 주요 기능 한 줄 요약(다른 세션, 0.52.0 이후 계속 작업) | PR #33 |
| 0.54.0 | XDM-CTR100·CTR100 PSE 04 사양 딥 스위치 행 삭제, 전 제품 05 주요 기능 추가 압축, 전송기 3종(XDM-CTR100·CTR100 PSE·FT101/FR101) RS-232+ 패스스루 안내 추가, "02 신호 흐름" 케이블 최대 전송거리 표기를 범례 "출력" 오른쪽으로 이동 | PR #33 |

- 이번 세션에서 작업을 시작할 때 원격 브랜치가 `c67d93f`(0.53.0 추가 커밋, 조건 칸 출처 문구 삭제·05 주요 기능 간결화, 다른 세션 작업)만큼 앞서 있었습니다. 로컬 0.54.0 작업을 커밋한 뒤 병합해 8개 파일(`hd-13u`·`hd-210u`·`hds-21u`·`hds-42mu`·`qms-88ux`·`xdm-ct103-cr103`·`xdm-ctr100-pse`·`xdm-ctr100`)에서 충돌이 났습니다.
- 충돌 해소 원칙: (1) 이번 세션의 명시적 요청(XDM-CTR100·CTR100 PSE 04 사양 딥 스위치 행 삭제)은 다른 세션이 같은 행을 0.53.0에서 되살렸더라도 다시 뺐습니다. (2) 05 주요 기능 문구가 양쪽에서 겹치면, 더 구체적인 사실(딥 스위치 번호, 제품 호환 관계, "07 오디오 설정" 참고 등)이 남아 있는 쪽으로 합쳤습니다. (3) QMS-88UX videoModes의 QUAD `detail` 필드(다른 세션이 추가한 12가지 레이아웃 요약)는 그대로 살렸습니다.
- 병합된 브랜치를 이 세션에서 다시 검증했습니다: 37/37, 28종, e2e 88/88, `git diff --check` 통과.

## 병합 전 검증(`1eddcbc`, PR #33 head)

- `node --test tests/*.test.cjs`: 37/37
- `node scripts/build-product-index.cjs --check`: 28종 검증 통과
- `node scripts/package-site.cjs`: 통과
- `node scripts/e2e-smoke.cjs`: 88/88
- `git diff --check`: 통과
- 스크린샷으로 "02 신호 흐름" 케이블 표기 위치 변경(범례 "출력" 오른쪽)을 XDM-CTR100(조합형 다이어그램)과 CT104-U/CR104-U(단순형 다이어그램) 양쪽에서 확인했습니다.

## 배포 뒤 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 | `CATALOG BASED · 0.54` |
| `CLAUDE.md` 공개 여부 | HTTP 404(비공개, `dist/`만 배포됨 확인) |
| 브랜치 배포(`pages build and deployment`) | 이번에도 확인 대상(0.47부터 계속 돌지 않는 추세) — 별도로 재확인하지 않았으면 다음 배포 때 함께 점검 |

## Rollback

병합 커밋 `cce0aa601801b724298669c4edfe2f7ed48f35b9`를 revert하는 PR을 만들면 `main`이 0.53.0 상태로 돌아갑니다. Pages만 되돌리려면 직전 배포 커밋(0.53.0, `c67d93f` 계열)에 태그를 만들고 그 태그로 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다.
