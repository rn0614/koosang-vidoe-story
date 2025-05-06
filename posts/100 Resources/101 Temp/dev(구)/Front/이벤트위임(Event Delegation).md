---
title: 이벤트위임(Event Delegation)
excerpt: 설명란
categories:
  - Categories2
tags:
  - Front/Browser
permalink: /categories2/202410212036Delegation)/
toc: true
toc_sticky: true
date: "2024/10/21 00:00:00"
last_modified_at: "2024/10/21 00:00:00"
---
# 개념
> 자식요소의 이벤트를 부모요소로부터 물려받을 때 이것을 이벤트 위임이라고 한다.
> -이벤트 버블링을 이용하여 한번에 처리하는 방식

# Event단계
1. capturing
2. targeting
3. bubbling

# React의 Event위임은
> 


# 코드
```js

// (o) 부모요소로부터 이벤트 위임
parent.addEventListenr("click", e=>{
  if(e.target.matches(".child"){
    console.log("click, e")
  }
})


// (x) 비효율적인 코드
childrens.forEach(child =>{
  child.addEventListenr("click",(e)=>{
    console.log("clcik", e)
  })
})

```

