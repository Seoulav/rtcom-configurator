# Extron·Analog Way 벤치마크 감사

- 확인일: 2026-09-20
- 범위: 공식 공개 페이지의 정보구조와 사용자 흐름
- 목적: RTCOM 기존 디자인과 기능을 보존하면서 후속 정보구조 결정에 참고한다.

## 1. 확인한 공식 페이지

- [Extron Products](https://www.extron.com/product/)
- [Extron Extenders & Line Drivers](https://www.extron.com/Extenders-Line-Drivers/prodtype-38?t=driverextender)
- [Extron HDMI Extenders](https://www.extron.com/HDMI-Extenders/prodsubtype-384)
- [Analog Way Products](https://www.analogway.com/products)
- [Analog Way Configurator](https://www.analogway.com/configurator)

## 2. Extron 관찰 결과

Extron 제품 홈은 제품을 단일 목록으로만 제공하지 않는다. DTP/XTP/AV over IP 같은 시스템, signal processor, distribution amplifier, switcher, matrix switcher, extender, 케이블·어댑터, 설치 액세서리 등 여러 진입점을 제공한다. 같은 제품이 시스템 관점과 신호 관점에서 다시 발견될 수 있는 구조다.

Extenders & Line Drivers는 HDMI, DVI, DisplayPort, SDI, USB, wireless처럼 신호 유형을 하위 분류로 사용한다. HDMI Extenders 설명은 전송 매체를 HDMI, CATx, fiber로 구분한다. 이 구조는 사용자가 “익스텐더”라는 모델군을 알지 못해도 신호와 전송 방식으로 범위를 줄이게 한다.

Extron은 Training, Resources, Download를 전역 수준에서 제공하며 일부 설계 리소스는 계정 접근과 연결된다. RTCOM에는 문서와 설계 도구를 제품 옆에 배치하는 원칙을 적용할 수 있지만, 계정 장벽과 매우 깊은 제품 계층은 현재 제품 규모에 맞지 않는다.

## 3. Analog Way 관찰 결과

Analog Way 제품 페이지는 Video Switchers, Media Servers, Integration Essentials를 상위 제품군으로 제시하며 Aquilon, Alta 4K, Midra 4K, extenders, cables, software로 내려간다. 산업별 진입과 제품군별 진입을 함께 제공하고, 제품 목록에서 기술자료·사양·문헌·영상으로 이어지는 방향을 명시한다.

Configurator는 다음 순서를 사용한다.

1. chassis를 선택한다.
2. processing unit과 multiviewer card를 선택한다.
3. chassis의 빈 영역을 클릭해 input/output card를 선택한다.
4. 완성된 구성을 확인하고 export한다.

카드 선택 단계는 실제 카드 이미지, 포트 수, part number를 함께 보여준다. 마지막에는 구성을 계속 편집하거나 내보낼 수 있다. PDF 수신 단계에는 이름, 이메일, 전화번호, 회사 등 개인정보 입력이 요구된다.

## 4. RTCOM 적용 결정

| 관찰 항목 | 결정 | RTCOM 적용 방식 |
|---|---|---|
| Extron의 제품 taxonomy | 적용 | 2~3단계 안에서 제품군, 신호, 매체, 역할을 제공한다. |
| 신호별 익스텐더 탐색 | 적용 | CAT/Fiber를 분리하고 신호, 거리, TX/RX, 전원 조건을 구조화한다. |
| 제품과 기술자료 연결 | 적용 | 제품 상세에서 공식 문서, 페이지, 검증 상태로 연결한다. |
| 제품과 설계 도구 연결 | 적용 | 제품 상세에서 해당 설계 도구로 진입한다. |
| Analog Way의 단계형 구성 | PRESERVE | 현행 RTCOM 6단계 구성기와 실제 슬롯 선택 흐름을 유지한다. |
| chassis의 빈 슬롯 직접 선택 | PRESERVE | 현재 후면 기반 슬롯 클릭과 카드 이미지 장착을 유지한다. |
| 구성 결과 요약과 export | PRESERVE | JSON·CSV·인쇄/PDF를 유지하고 후속 단계에서 범위를 확장한다. |
| 제품군과 산업별 진입 | ADD | 제품 데이터와 정보구조가 안정된 뒤 solutions 진입점을 추가한다. |
| 개인정보 입력 후 PDF | 제외 | RTCOM은 로그인과 연락처 없이 내보내기를 유지한다. |
| Extron 수준의 깊은 메가 메뉴 | 제외 | 31개 제품 규모에서는 탐색 비용이 더 크다. |
| 경쟁사 고유 VPU/IPU·생태계 용어 | 제외 | RTCOM 공식 제품과 기능만 사용한다. |
| 경쟁사 시각 디자인 복제 | 제외 | 현재 RTCOM 밝은 배경, 블루·퍼플 강조색, 둥근 패널을 보존한다. |

## 5. PHASE 1에 주는 제약

- 벤치마크는 새 디자인을 만드는 근거가 아니라 기존 기능의 위치를 정하는 근거로만 사용한다.
- 현행 제품 카드와 상세 dialog는 그대로 보존하고 새 `/products` view에서 재사용한다.
- 현행 구성기는 내부 로직을 바꾸지 않고 `/tools/matrix-configurator` view에서 마운트한다.
- 제품 taxonomy 확장과 구조화 필터는 PHASE 2 범위로 남긴다.
- 독립 제품 상세, 비교, 문서 센터는 각각 후속 PHASE 범위로 남긴다.

## 6. 결론

RTCOM은 Extron의 정보 깊이와 Analog Way의 단계형 구성 흐름을 참고할 수 있다. 그러나 현재 단계의 올바른 적용은 기능 추가가 아니라 정보구조의 분리다. 제품 라이브러리와 구성기를 별도 view로 이동하되 기존 렌더링, 상태, 저장, 내보내기 계약을 그대로 유지하는 것이 PHASE 1의 최소 범위다.
