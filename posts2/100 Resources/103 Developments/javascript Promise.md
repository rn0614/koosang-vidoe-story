---
title: javascript Promise
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: javascript Promise를 통해서 비동기 동작 수행
tags:
  - "#javascript"
date: 2024/09/29 00:00:00
last_modified_at: 2024/09/29 00:00:00
---
## 상태
- pending
- fulfilled
- rejected

## 코드
```ts
function Fn1(data){
  return new Promise((resolve, reject)=>{
    setTimeout(()=>{
      if(data){
        resolve(data)
      }else{
        reject(new Error('에러발생'))
      }
    }, 1000)
  })
}


promise
  .then((result)=>{console.log(result)})
  .catch((error)=>{console.log(error)})
  .finally(()=>{})
```

## static 함수
- all :  전체가 성공
- allSettled
- any :  하나라도 성공
- race : 가장 첫 return값 사용
```ts

Promise.all([promise1, promise2])
  .then((data)=>{})   // data =[promise1결과, promise2 결과]
  .catch((error)=>{});   // error 가장 먼저 실패한 error


Promise.allSettled([promise1, promise2])  // 모든 promise가 무조건 실행됨
  .then((data)=>{});   // data =[{status:"fulfilled", value: promise1결과}, {status:"rejected",reason:Error메세지}] 


Promise.any([promise1, promise2])  // 가장 먼저 resolve된 promise 반환
  .then((data)=>{})   // data = promise1결과 or promise2결과
  .catch((error)=>{})  // AggregateError : All promises were rejected

Promise.race([promise1, promise2])  // 가장 먼저 결과나 나온 promise 반환
  .then((data) => {})
  .catch((error)=>{})
```