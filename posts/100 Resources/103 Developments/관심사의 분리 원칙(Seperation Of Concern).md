---
title: 관심사의 분리 원칙(Seperation Of Concern)
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: 관심사의 분리를 통해서 수정시 봐야할 코드의 부분을 분리하여 더 유지보수하기 용이하게 하도록 한다.
tags: 
date: 2025/01/28 00:00:00
last_modified_at: 2025/01/28 00:00:00
---
## 관심사 분리 원칙이란?
> 한번에 한가지 일만 처리할 수 있도록 나눈 것

코드가 단위별로 하나의 관심사에만 충실하게 만드는 것.
- 코드 파악을 위해 읽어야하는 코드의 단위가 적어 수정 시 신경써야할 코드 수가 적음
- 낮은 결합도/ 높은 응집도로 수정시 변경점을 줄일 수 있고 연관있는 코드가 모여있음.

가장 대표적인 예시로 VIEW 와 BUISINESS LOGIC 간의 분리임.

VIEW부분은 BUISINESS LOGIC으로 부터 데이터를 받아서 해당 데이터를 표시하는 역할만 학고 해당 데이터에 대한 로직 및 관리는 VIEW MODEL에 일임함.

대표적으로 HEADLESS UI를 들 수 있고 CUSTOM HOOK 으로 내부 비지니스 로직은 다른 코드로 빼는 것과 동일함.

