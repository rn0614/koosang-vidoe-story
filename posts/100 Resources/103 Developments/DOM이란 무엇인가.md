---
title: DOM이란
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: DOM이란 무엇인지 확인
thumnail: 
tags:
  - Front/Browser
date: 2025/02/09 22:34:45
last_modified_at: 2025/03/18 22:00:58
---
## DOM(Document Object Model)
> 마크업 언어로 작성된 문서를 프로그래밍 언어가 조작할 수 있도록 하는 객체.  계층적 구조로 이루어짐. 

[css선택자](posts/100-Resources/103%20Developments/css선택자.md)
[DOM이벤트종류](posts/dev/Front/DOM이벤트종류.md)
```js
document.querySelector('.className').addEventHandler("click",()=>{
    doThis();
})
```


## 왜 DOM은 tree 형태를 채택했을까?
> 노드간의 관계가 명확하고 Event 처리에 유리한 구조


## 이벤트 버블링
> 하위요소에서 발생한 이벤트가 상위요소로 전파되는 방식

event.target : 이벤트가 발생한 가장 안쪽 요소
this : 현 이벤트가 발생하는 주체
- 버블링돼서 발생한 경우 target은 내부요소, this는 외부 부모요소가 될 수 있음.
- 버블링을 중단하고 싶은 경우 event.stopPropagation() 을 사용함. / 단 이 경우는 조심해서 사용할 것. 

```html
<!DOCTYPE HTML>
<html>

<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="example.css">
</head>

<body>
  클릭하면 <code>event.target</code>과 <code>this</code>정보를 볼 수 있습니다.

  <form id="form">FORM
    <div>DIV
      <p id="p">P</p>
    </div>
  </form>

  <script src="script.js"></script>
</body>
</html>
```


```js
form.onclick = function(event) {
  event.target.style.backgroundColor = 'yellow';

  // chrome needs some time to paint yellow
  setTimeout(() => {
    alert("target = " + event.target.tagName + ", this=" + this.tagName);
    event.target.style.backgroundColor = ''
  }, 0);
};

// event가 발생하는 위
p.onclick = function(event) {
  event.target.style.backgroundColor = 'yellow';

  // chrome needs some time to paint yellow
  setTimeout(() => {
    alert("target = " + event.target.tagName + ", this=" + this.tagName);
    event.target.style.backgroundColor = ''
  }, 0);
};


```



## 이벤트 캡처링
> 이벤트가 최상위 조상에서 아래로 전파되는 과정.

dom에서 이벤트가 발생하는 과정은
1. capturing : 이벤트가 하위 요소로 전파
2. target : 이벤트가 실제 타깃 요소에 전달되는 단계
3. bubbling : 이벤트가 상위요소로 전파

```js
// 캠처링 단계에서 동작하려면 따로 설정 필요
event.addEventListener(..., {capture: true})  // true 대신 {capture: true} 로 쓰는게 명시적
```

```js

// capturing을 지울거면 같은 옵션 필요
event.removeEventListener(..., {capture: true}) 

```



