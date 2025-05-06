---
title: Fragment 사용방법
excerpt: 설명란
categories:
  - Categories2
tags:
  - Front/React
permalink: /categories2/202409290127Fragment/
toc: true
toc_sticky: true
date: "2024/09/29 00:00:00"
last_modified_at: "2024/09/29 00:00:00"
---
# 개요
`<></>` 이 React.Fragment의 축약어이다.

단 list의 key값이나 다른 props를 넘기려면 축약어가 아닌 상태로 사용해야한다.
```tsx
itemList.map((todo, idx)=>{
  <React.Fragment key={idx}>
    <td></td>
    <td></td>
  </React.Fragment>
})

```