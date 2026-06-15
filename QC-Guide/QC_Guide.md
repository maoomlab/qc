---
title: "조건문 (테스트)"
description: "조건을 나열할 때는 When, If를 반복하기보다, 상태·행위 자체를 간결하게 명시하는 것이 더 직관적이고 일관적이며, 가독성과 정확성이 향상됨 (테스트) (테스트) (테스트) (테스트) (테스트) (테스트)"
---


# 1. 조건문

조건을 나열할 때는 **When, If를 반복하기보다**, 상태·행위 자체를 간결하게 명시하는 것이 더 직관적이고 일관적이며, 가독성과 정확성이 향상됨

## ■ 불필요한 반복 제거
각 항목이 이미 조건임이 명확하므로 when, if 반복 사용을 줄여 문장을 간결하게 정리

<pre>예시: When the smart key is in the vehicle → The smart key is in the vehicle</pre>

## ■ 가독성 향상
문장 구조를 단순화하여 읽는 속도를 높이고 조건이 한눈에 들어오도록 개선

## ■ 일관성과 간결성 유지
상황·조건만 직설적으로 명시하여 매뉴얼 스타일의 통일성과 명확성을 강화

<pre>예시: If you step on the brake pedal → You engage the brake pedal</pre>
<br>

<조건문 개선 사례>

<div align="left">

| AS-IS | TO-BE | 
|---|-------------------|
| When the smart key is in the vehicle | `The smart key is in the vehicle` |
| When the vehicle is in the ACC or ON position | `The vehicle is in the ACC or ON position.` |
| When 1 or more doors, the hood, or the liftgate are open | `1 or more doors, the hood, or the liftgate are open` |
| When the accelerator pedal is gently depressed | `You gently engage the accelerator pedal for more than 6 seconds while driving.` |
| When your Kia stops | `You stop the vehicle.` |
| If you drive more than a certain distance into the next lane | `You drive more than a certain distance into the next lane.` |
| If you move away from the direction where there is a risk of collision | `You move away from the direction where there is a risk of collision.` |
| If you turn the steering wheel rapidly | `You turn the steering wheel rapidly.` |
| If you engage the brake pedal | `You engage the brake pedal.` |
| If Forward Collision-Avoidance Assist activates | `Forward Collision-Avoidance Assist activates` |

</div>



# 2. might, may, can

## ■ might
가능한 위험을 설명하는 경우, 이는 반드시 발생하는 결과가 아니므로 문맥상 및 법적 관점에서 더 안전한 표현인 **‘might’** 를 사용

## ■ may
허용 의미와 가능성 의미가 섞여 있어 안전 경고 문맥에서는 혼란을 줄 수 있어 권장되지 않음
1. 허용 (permit): ~해도 된다
2. 가능성 (possibility): ~할 수도 있다

## ■ can
직접적인 기계적 결과를 설명할 때 사용

<pre>예시: 
- Do not use the accelerator pedal to hold your vehicle on an incline. This can cause the transmission to overheat.
- 변속기의 과도한 사용 → 과열을 나타내므로 can 사용 가능</pre>



# 3. BER 공통문구

## ■ 유럽 수평전개
  Have your vehicle inspected by a professional workshop. Kia recommends visiting an authorized Kia dealer or service partner.
1. 점검 유도 표현: consult, contact, call, ask, checked, serviced → **inspect로 통일**
2. 방문 권유 표현: ~that you visit, ~to visit, ~checked → **visiting으로 통일**

## ■ 북미 수평전개
  Have your vehicle inspected by an authorized Kia dealer.
- 점검 관련 용어 모두 inspect로 통일 후, "Kia recommends visiting~" 이하 방문 권유 문구 삭제

<pre>예외 문구: 
- 연구소 요청으로 공통 문구 적용이 어려운 경우, 용어별 의미 구별하여 문장 작성
- 공통 문구 적용 시 문맥상 의미 변경이 발생할 경우 수정대상에서 제외
- 스마트키 교체 문구 제외 (공식 딜러에서만 할 수 있는 작업) </pre>



# 4. 조작 및 제어

## 인터페이스별 동작 동사 구분
물리 버튼(**Press**), 가상 터치(**Tap**), 다이얼(**Turn**) 등 인터페이스 특성에 맞는 동사를 사용해 사용자 조작을 직관적이고 일관되게 표현

### ■ Press

- 물리적 버튼일 경우
- 문맥상 자연스러운 경우 ENGINE START/STOP 버튼 또는 EV 버튼에는 **press**를 사용
- 버튼을 누르는 동작 없이 위치/상태를 설정하도록 안내할 때는 **set**을 사용하거나 동사를 생략

| 잘못된 예 | 올바른 예 | 
|---|---|
| Press the ENGINE START/STOP button ON. | `Press the ENGINE START/STOP button in the ON position.` |
| Turn the ENGINE START/STOP button ON. | `With the ENGINE START/STOP button pressed in the OFF position` |
| Turn the ENGINE START/STOP button to the ON position. | `Set the ENGINE START/STOP button to the ON position without pressing it.` |

### ■ Tap
- 화면상의 가상 버튼 또는 항목에는 **tap**을 사용
- 사용자가 화면상의 가상 버튼을 조작하는 동작에는 **select**를 사용하지 않음

<pre>예외문구: 
- 아이콘을 탭한 후 메뉴 항목을 선택하도록 안내할 때는 tap, then select 사용 가능</pre>

| 잘못된 예 | 올바른 예 | 
|---|---|
| Touch the [XYZ icon] | `Tap [XYZ icon] and select [XYZ menu item] on the infotainment system screen.` |
| Select the [XYZ button] | `With EV selected, you can…` |

### ■ Turn / Switch

- 스위치 및 다이얼에는 문맥상 가장 자연스러운 동사를 사용
- 인터페이스 특성에 따라 **push, turn, set** 등을 구분하여 사용

| 잘못된 예 | 올바른 예 | 
|---|---|
| Press the dial clockwise. | `Turn the dial clockwise.` |
| Tap the switch. | `Push the switch down.` |
| Select the control knob. | `Set the control to AUTO.` |



# 5. 구동 및 제동

## 기능별 동사 매칭
Brake (**Engage**), EPB (**Apply**), Gear (**Shift**) 등 기능 특성에 맞는 동사를 사용하여 조작 의미를 명확하고 일관되게 표현

### ■ Engage / Disengage
- 브레이크 또는 브레이크 페달에는 **engage, disengage**를 사용

<pre>예외문구: 
- 차량 경고 메시지에 “press brake pedal”이 표시되는 경우에는 차량 문구와 일치시키기 위해 사용 가능</pre>

| 잘못된 예 | 올바른 예 | 
|---|---|
| Press the brake pedal. | `Engage the brake pedal.` |
| Depress the brake pedal. | `Disengage the brake pedal.` |
| Step on the brake pedal. | `The driver engaged the brakes.` |

### ■ Apply
- 주차 브레이크 또는 전자식 주차 브레이크(EPB)에는 **apply, release**를 사용

| 잘못된 예 | 올바른 예 | 
|---|---|
| Press the parking brake. | `Apply the parking brake.` |
| Depress the EPB switch. | `Release the EPB.` |

### ■ Shift
- 기어 조작에는 **shift the gear to + 위치** 형식을 사용
- 기어 위치 표현은 **to D(Drive)** 형식으로 통일

| 잘못된 예 | 올바른 예 | 
|---|---|
| Shift to D (Drive). | `Shift the gear to D (Drive).` |
| Move the gear to D (Drive). | `Shift the gear to P (Park).` |



# 6. 알림 및 상태
시스템 상태 및 반응 표현은 기능별 표준 용어를 사용하여 일관성 있게 표기

## ■ Displays / Illuminates
- Indicator light 및 warning message에는 **displays, illuminates**를 사용
- 경고메세지 및 표시등에는 "appears" 또는 "turns on/ON" 표현을 사용하지 않음

| 잘못된 예 | 올바른 예 | 
|---|---|
| The warning message appears. | `The warning message displays on the cluster.` |
| The indicator light turns ON. | `The indicator light illuminates.` |
| The message turns on. | `The message displays when the system is activated.` |

## ■ ON / OFF / OK
- 차량 상태를 나타내는 경우에는 **ON, OFF, OK**를 모두 대문자로 표기
- 차량 상태 표현을 강조하기 위해 모든 문자를 대문자로 사용
- 해당 규칙은 차량 자체의 상태 표현에만 적용

<pre>예외문구:
- Indicator light, warning message, 개별 기능/모드에는 turn ON, turn OFF 표현을 사용하지 않음</pre>

| 잘못된 예 | 올바른 예 | 
|---|---|
| The vehicle is in the on position. | `The vehicle is in the ON position.` |
| Turn ON the indicator light. | `Check that the system status is OK.` |
| The ignition is off. | `The ignition is OFF.` |



# 7. 부품 및 명칭
Trunk/Cargo area 구분, Light/Lamp 명칭 통일 등 차량 유형 및 기능에 따라 용어를 명확하게 구분하여 사용

## ■ Trunk / Cargo area
- 세단의 후방 적재 공간은 **trunk** 사용
- SUV 및 Hatchback의 후방 적재 공간은 **cargo area** 사용
- luggage compartment, rear cargo area 사용 지양

| 잘못된 예 | 올바른 예 | 
|---|---|
| Store the luggage in the rear cargo area. | `Store the luggage in the cargo area.` |
| Open the luggage compartment. | `Open the trunk before loading cargo.` |

## ■ Light / Lamp
- 현지화된 관용적 표현을 사용하여 한 문장 내 lamp와 light를 혼용해 사용 시, 일관성이 부족해 보인다는 기아 정보팀 의견

#### <유형 사례>

<div align="left">

<table>
<thead>
  <tr>
    <th>구분</th>
    <th>AS-IS</th>
    <th>TO-BE</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td rowspan="8">Exterior</td>
    <td>Headlamp</td>
    <td>Headlight assembly</td>    
  </tr>
  <tr>
    <td>Headlight</td>
    <td>Headlights</td>    
  </tr>
  <tr>
    <td>Tail lamp</td>
    <td>Taillight assembly</td>    
  </tr>
  <tr>
    <td>Tail light</td>
    <td>Taillights</td>    
  </tr>
  <tr>
    <td>Backup lamp</td>
    <td>Reverse light assembly</td>    
  </tr>
  <tr>
    <td>Backup light</td>
    <td>Reverse lights</td>    
  </tr>
  <tr>
    <td>Brake lamp</td>
    <td>Brake light assembly</td>    
  </tr>
  <tr>
    <td>Brake lamp</td>
    <td>Brake lights</td>    
  </tr>
  <tr>
    <td rowspan="4">Interior</td>
    <td>Interior lamps</td>
    <td>Interior lights</td>
  </tr>
  <tr>
    <td>Interior lihgt</td>
    <td>Interior lights</td>    
  </tr>
  <tr>
    <td>Map lamp</td>
    <td>Map lights</td>    
  </tr>
  <tr>
    <td>Map light</td>
    <td>Map lights</td>
  </tr>
  </tbody>

</table>

</div>



# 8. 문체 및 구조
능동태 사용, 직접 지칭(**you**), 상황 기술(**While you are driving**)등 사용자 중심으로 명확하게 문장을 작성

## ■ Active voice
- 수동태 보다 **능동태(active voice)**를 사용하여 주체와 동작을 명확하게 표현
- 사용자가 해야 하는 동작이나 시스템 반응을 직접적이고 간결하게 작성

| 잘못된 예 | 올바른 예 | 
|---|---|
| You are warned by the system. | `The system warns you.` |
| The settings can be adjusted manually. | `You can adjust the settings manually.` |
| The brakes are automatically applied by the system. | `The system applies the brakes automatically.` |

## ■ You
- 운전자를 제 3자로 표현하지 않고 **you**로 직접 지칭
- the driver는 사용자가 아닌 제 3자를 지칭하는 느낌을 줄 수 있으므로 사용자 안내 문맥에서는 지양

| 잘못된 예 | 올바른 예 | 
|---|---|
| The system warns the driver. | `The system warns you.` |
| Safe driving is the driver's responsibility. | `Safe driving is your responsibility.` |

## ■ While you are driving~
- While driving은 일부 문맥에서 차량이 스스로 운전하는 것처럼 모호하게 들릴 수 있음
- 주체를 명확히 하기 위해 **while you are driving**을 사용

| 잘못된 예 | 올바른 예 | 
|---|---|
| Do not adjust the settings while driving. | `Do not adjust the settings while you are driving.` |
| Keep both hands on the steering wheel while driving. | `Keep both hands on the steering wheel while you are driving.` |



# 9. 서식 및 규칙
숫자 표기, 속도 표현, 단위 간 공백, 기능명 표기 등 기술 문서에서 반복적으로 등장하는 서식 규칙을 일관되게 적용

## ■ 숫자 표기: Numerals/Words
- 기술 문서에서는 숫자의 가독성과 빠른 인식을 위해 일반적으로 numerals (1, 2, 3) 사용
- 측정값, 기술 데이터, 부품 수량, 절차 반복 횟수에는 숫자 크기와 관계없이 numerals 사용
- 일반 개념을 설명하거나 숫자 표기가 문맥상 어색한 경우에는 wrods (one, two, three) 사용 가능

<표현 기준>
| Category | Rule | Example |
|---|---|---|
| Measurements & Technical Data | 숫자가 10 미만이어도 항상 numerals 사용 | 5mm <br>12V <br>3 seconds|
| Counting Items / Components | 부품 수량 및 절차 반복 횟수는 시각적으로 잘 보이도록 numerals 사용 권장 | 2 clips <br>15 bolts <br>Press the button 3 times|
| General Text | 일반 개념 설명에서는 필요 시 words 사용 가능 | one side <br>one of the following <br>third party|

## ■ 차량 속도 표현: above/below
- 차량 속도를 설명할 때는 above 또는 below 사용
- higher than/lower than, faster than/slower than은 사용하지 않음

| 잘못된 예 | 올바른 예 | 
|---|---|
| The vehicle speed is higher than 6 mph. | `The vehicle speed is above 6 mph.` |
| The vehicle speed is slower than 10 mph. | `The vehicle speed is below 10 mph.` |

## ■ 숫자 + 단위: Number + Unit
- 대부분의 단위는 숫자와 단위 사이에 공백 사용
- 금액, 온도, 전압, 전류는 예외적으로 공백을 사용하지 않음

<예외단위>
| Type | Example | 
|---|---|
| Money | `$100` |
| Temperature | `100°F` |
| Volts | `9V` |
| Amps | `10A` |

| 잘못된 예 | 올바른 예 | 
|---|---|
| 130–200cm | `130–200 cm` |
| $ 100 | `$100` |
| 9 V | `9V` |
| 10 A | `10A` |

## ■ 문장 표현
- 차량 전방 대상을 설명할 때는 vehicle ahead 사용
- vehicle in front는 사용하지 않음
- ahead of you와 같은 변형 표현에도 동일하게 적용

| 잘못된 예 | 올바른 예 | 
|---|---|
| The vehicle in front stops suddenly. | `The vehicle ahead stops suddenly.` |
| The vehicle in front of you changes lanes. | `The vehicle ahead of you changes lanes.` |
