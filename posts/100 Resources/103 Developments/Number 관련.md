---
title: Number 관련
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: Number 관련
thumnail: 
tags:
  - javascript
date: 2025/02/05 01:23:31
last_modified_at: 2025/03/16 21:00:45
---
> 자바스크립트의 소수점 처리는 좀 특이하다.

```ts
0.1+0.2 ===0.3 // retrun false

// 소수점까지 일치하는 Number 처리
function isEqual(a,b){
    return Math.abs(a-b) < Number.EPSIOLON //(가장작은 단위)
}

isEqaul(0.1+0.2 , 0.3) // return true

Number.MAX_SAFE_INTEGER
Number.MIN_SAFE_INTEGER

Number.isInteger(12)
Number.isNaN(NaN)  // NaN은 서로 같지 않으므로 비교할 때 반드시 isNaN을 사용

Number.toFixed()  // 소수점 아래를 반올림
Number.toPrecision() // 정확도로 몇자리까지 제대로 쓸건지 확인
(23).toString(_) // 문자열로 만드는데 _에따라 진법이 달라짐


```


## Math
```js
Math.PI
Math.abs
Math.round
Math.ceil
Math.floor
Math.sqrt
Math.random
Math.pow
Math.max
Math.min
```

## Date
```js
new Date(0) // 1970 1월 1일 00:00:00 기준

new Date('2025/01/31/10:00:00')  //  soqnsms Date.parse로 변환 가능한 format

Date.now()

Date.getFullYear()

Date.setFullYear()

Date.getMonth()
Date.setMonth()

Date.getDate()
Date.setDate()

// 요일 0~6
Date.getDay();

today.toString();
today.toISOString();
today.toLocaleString()'ko-KR';
```