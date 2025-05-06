---
title: Javascript this에 관해
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: javascript this에 관한 내용
tags:
  - javascript
date: 2024/09/29 00:00:00
last_modified_at: 2024/09/29 00:00:00
---
## 개념
1. 초기 this 는 window이다.
2. 메서드로 호출 시 this는 해당 function을 호출한 객체이다.
3. bind는 bind 안에 있는 객체를 강제로 this로 만드는 메서드이다.
4. 두번 bind되어도 뒤에 bind를 무시하고 앞에 bind만을 적용된다.
5. Event 처리시는 event를 처리한 element , 이때 e.target = this 인거임.
```tsx
  element.addEventListener('click',function(){} )  // this는 elemnent

  element.addEventListener('click',()=>{} )  // this는 상위 스코프
  

```
6. arrow function의 this는 외부 스코프(렉시컬)에 의해서 결정됨. 즉 선언된 위치에 따라 다름