# RTCOM 메인프레임 샤시 단자(`lineup[].io`) 추가 요청

- 요청: AV Portal / AV System Builder 담당 (2026-10-30)
- 대상 저장소: `Seoulav/rtcom-configurator` — `data/products/xdm.json`, `vdm.json`, `spx.json`
- 목적: AV System Builder에서 XDM·VDM·SPX 메인프레임을 놓았을 때 **카드와 상관없이 프레임 본체에 달린 단자**(LAN·RS-232·USB·전원·오디오 매트릭스 등)가 기본으로 생기게 한다.
- 선행 요청: [모듈형 장비 슬롯·카드 데이터 추가 요청](AV_PORTAL_MODULAR_SLOTS_REQUEST_2026-10-13.md), 회신 [AV_PORTAL_MODULAR_SLOTS.md](AV_PORTAL_MODULAR_SLOTS.md)

## 1. 배경

사용자 요청(2026-10-30): "슬롯을 커스텀하는 제품이라도 결국 기본 샤시에 달린 포트가 있어서 그 포트에 대한건 기본 제공해야해."

AV Portal은 이 저장소의 공개 제품정보를 단일 원본으로 동기화하고 **RTCOM 데이터를 직접 고치지 않는다.** 2026-10-13 요청으로 메인프레임에 `slots`, 카드에 `slotType`·`compatibleFrames`·`io`가 들어와 Builder에서 카드를 꽂고 결선할 수 있게 됐다. 그런데 메인프레임 항목에는 단자 행이 없다(main `26a4232` 기준).

| 시리즈 | 최상위 `io` | 메인프레임 `lineup[].io` | Builder에서 프레임 본체 단자 |
|---|---|---|---|
| XDM | 0행 | 없음 | 없음 |
| VDM | 0행 | 없음 | 없음 |
| SPX | 0행 | 없음 | 없음 |

참고로 같은 모듈형인 `spx-r6.json`은 최상위 `io`에 IR·전원 행이 있어 Builder에 본체 단자가 이미 나온다.

본체 단자 정보는 이 저장소에 이미 있다. 다만 단자 행이 아니라 다른 곳에 흩어져 있다.

- `controlExample.serial`·`controlExample.lan`: RS-232 통신 설정, LAN TCP 23 포트(알티컴 회신). 단자 개수·커넥터는 없다.
- 매뉴얼 후면 설명(`output/design/assets/docs/`):
  - `spx-manual.pdf` 6쪽 "Rear view": MCU 보드 — LAN 제어용 **RJ-45**, RS-232 제어용 **DB-9**, **펌웨어 업데이트 포트**. ④ Power Switch 100~240 VAC 50/60Hz. ⑤ 3.5mm 스테레오 오디오 추출 포트.
  - `vdm-manual.pdf` 7쪽(본문 6쪽) "Rear View": ③ 오디오 매트릭스 라우터(5-pin 피닉스), ④ 통신 연결 단자, ⑤ 전원 포트. 11쪽: 후면 **USB 포트**로 펌웨어 업그레이드, 조작은 터치스크린·RS-232·LAN.
  - `xdm-manual.pdf` KV08: 페이지가 이미지라 글자를 뽑지 못했다. 7~11쪽 후면 그림으로 확인을 부탁한다.

## 2. 요청 내용 — 필드 추가만

**기존 키는 이름·값·순서를 바꾸지 않는다.** 메인프레임 항목(`kind: "메인프레임"`)마다 `io`를 **추가**한다. 형식은 10-13에 카드 `io`로 넣은 것, 그리고 단품 제품 `io[]`와 같은 9개 키다.

```json
{
  "model": "SPX-M3236",
  "kind": "메인프레임",
  "summary": "…기존 그대로…",
  "rackUnits": 7,
  "slots": { "…": "기존 그대로" },
  "io": [
    { "group": "Control", "connector": "RJ-45", "signal": "LAN", "direction": "BIDIR", "quantity": "1", "protocol": "TCP/IP", "condition": "MCU 보드 · LAN 제어", "source": "M", "verification": "VERIFIED" },
    { "group": "Control", "connector": "DB-9", "signal": "RS-232", "direction": "BIDIR", "quantity": "1", "protocol": "", "condition": "MCU 보드 · RS-232 제어", "source": "M", "verification": "VERIFIED" },
    { "group": "Power", "connector": "AC 인렛", "signal": "AC 100~240V", "direction": "IN", "quantity": "1", "protocol": "", "condition": "", "source": "M", "verification": "VERIFIED" }
  ]
}
```

위 값은 **형식 예시**다. 실제 커넥터·개수·출처 기호는 매뉴얼·카탈로그로 확인한 대로 넣어 달라.

### 2.1 반드시 메인프레임 항목마다 넣는다

- AV Portal의 Builder 라이브러리 생성기(`beta/builder-library.mjs`)는 메인프레임 `lineup[].io`를 **그 모델의 단자**로 만든다.
- 시리즈 최상위 `io`에 넣으면 어느 모델의 단자인지 알 수 없어 Builder에서 「확인 필요」로 빠진다. 모델마다 같아도 **각 항목에 반복**해 달라.

### 2.2 넣을 단자

카드를 꽂지 않아도 본체에 있는 단자를 모두 넣는다. 매뉴얼 기준 후보:

| 시리즈 | 후보 |
|---|---|
| SPX | LAN(RJ-45), RS-232(DB-9), 펌웨어 업데이트 포트, 전원, 3.5mm 오디오 추출(본체 단자인지 확인) |
| VDM | 오디오 매트릭스 라우터(피닉스 5핀, 입력·출력 개수), 통신 연결 단자(LAN·RS-232), USB(펌웨어), 전원 |
| XDM | 매뉴얼 후면 그림으로 확인(LAN·RS-232·USB·전원 등) |

- **카드 단자는 넣지 않는다.** 카드 단자는 카드 항목 `io`에서 이미 온다.
- 전원이 모듈형 파워 여러 개면 개수를 그대로 적는다. Builder는 `quantity`만큼 단자를 만든다.

### 2.3 모르는 값은 지어내지 않는다

- 매뉴얼 후면 사진·도면이 한 모델(VDM-16X 등)뿐이라 다른 모델의 개수를 확인할 수 없으면, 행은 넣고 `verification: "REVIEW REQUIRED"`로 둔다. 근거가 전혀 없는 모델(예: XDM-216 후면 사진 없음)도 같은 방식이다.
- 개수를 모르면 `quantity`를 빈 문자열로 두고 지어내지 않는다.
- 방향을 모르면 `BIDIR`로 단정하지 말고 `REVIEW REQUIRED`로 둔다. 제어 단자(LAN·RS-232)는 양방향(`BIDIR`)이 기본이다.
- 같은 단자를 두 용도로 쓰면(예: 오디오·제어 공용) 기존처럼 `connector`·`condition`에 적는다.

## 3. AV Portal 쪽에서 할 일

반영되면 AV Portal은 다음만 한다. 코드 변경은 필요 없다.

1. `node beta/sync-rtcom.mjs`로 동기화
2. 검색 인덱스·읽기용 목록 재생성과 검사
3. Builder 라이브러리 생성 결과로 XDM·VDM·SPX 프레임에 본체 단자가 생겼는지 확인

Builder에서는 같은 시기에 슬롯형 장비에도 「단자」 탭을 추가한다(AV Portal B-20261030-10). 데이터가 오기 전에는 구성도별로 직접 본체 단자를 더해 쓸 수 있다.

## 4. 회신 부탁

10-13 요청 때처럼 `docs/handoff/` 아래에 회신 문서를 남겨 달라. 모델별로 확인한 단자, `REVIEW REQUIRED`로 둔 행과 이유, 알티컴에 확인이 필요한 항목을 적어 주면 된다.
