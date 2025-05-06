---
title: Clean Code(Try Catch)
excerpt: 설명란
categories:
  - Categories2
tags: 
permalink: /categories2/202410212113Code(Try/
toc: true
toc_sticky: true
date: "2024/10/21 00:00:00"
last_modified_at: "2024/10/21 00:00:00"
---
# Try /Catch를 좀더 꼼꼼히 사용하는 법
> try/catch를 이용함에 있어 오류부분을 처리하는 것은 좋지만 어떤 오류인지 명확하지 않을 때가 있다. 이럴때는 실 사용부를 밖으로 빼는 방식으로 이용한다


```ts
// (basic) try-catch로 검증할 로직만 try 내부에 정의한다.
let user
try{
  user = await getUser();
} catch(error){
  console.log("there was an Error")
}
console.log(user)


function catchError<T>(promise:Promise<T>):Promise<[undefined, T]| [Error]>{
  return promise
    .then(data => {
      return [undefined, data] as [undefined, T]
    })
    .catch(error=>{
      return [error]
    })
}


```