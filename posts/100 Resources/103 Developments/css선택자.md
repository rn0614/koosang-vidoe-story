---
title: css선택자
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: querySelector란 무엇인가
thumnail: 
categories: posts/dev/Front
tags:
  - Front
  - CSS
date: 2025/02/08 16:37:32
last_modified_at: 2025/02/09 19:40:38
---
CMDS:## 쿼리셀렉터란?
> js에서 dom요소를 특정하기 위한 방식 중 하나. getElementId나 getElementName등 도 있지만 querySelector의 효응성이 높고 같은기능을 수행할 수 있기 때문에 개인적으로는 하나로 통일해서 사용하는 방식을 선호한다.

*단, querySelec는 호출시점에서 해당 요소들을 가져오는거기 때문에, 추가 삭제가 된다면 다시 요소를 찾아와야한다.*

- document는 html문서 전체를 가르킨다.
- document.documentElement 는 `<html>` 요소이다

## 쿼리셀렉터(css선택자)
> 쿼리셀렉터는 일반적으로 2개로 모든 선택이 가능하다.

1. document.querySelector('선택자') => Node, undefined
2. document.querySelectorAll('선택자')=> NodeList
   
*NodeList는 iterator 객체는 맞지만 Array는 아니다 따라서 list로 사용하려면 spread 문법으로 푼다. 단순 반복이면 forEach를 사용하자. [...nodeList]*


## 선택자의 종류

1. `#선택자` : id선택자
2. `.선택자` : 클래스 선택자
3. `선택자` : 태그선택자
4. `선택자1선택자2` : 같이쓰면 둘다 만족하는 태그
5. `선택자1 선택자2` : 띄어쓰면 선택자1 안에 선택자2
6. `선택자1 > 선택자2` : 선택자1의 직계자식 선택자2
7. `[type="text"]` : 속성을 가진 요소
8. `a:hover` : a에 마우스 올리면
9. `li:first-child` : 첫번째 li요소
10. `p::first-letter` : `<p>`의 첫 글자