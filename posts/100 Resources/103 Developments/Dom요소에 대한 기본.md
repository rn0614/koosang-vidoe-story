---
title: DOM이란 무엇인가?
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: dom에 대한 기본적인 내용을 가지고 확인할 수 있다.
thumnail: 
tags:
  - Front/Browser
date: 2025/02/09 22:34:45
last_modified_at: 2025/03/18 22:00:58
---
## DOM(Document Object Model)
- 마크업 언어로 작성된 문서를 프로그래밍 언어가 조작할 수 있도록 하는 객체. html로 작성된 dom요소의 상태, 이벤트 등을 js가 인지할 수 있도록 하여 컨트롤 할 수 있도록 한다. 
- js에서 dom 요소는 `document` 변수에 담겨서 사용된다.
- dom은 tree구조로 이루어져 있어 구조탐색 및 이벤트 처리과정에서 상위, 하위요소로의 접근이 용이하다.

dom요소를 제어하기 위해서는 dom요소를 먼저 선택 정의해야하는데 이걸 selector(선택자)라고 한다. 우리가 보는 html 의 dom 요소를 선택하고 어떤 트리거의 시작점 혹은 끝점으로 만들어서 실 사용자와 상호작용할 수 있다. 이런 선택하는 방식을 [css선택자](posts/100%20Resources/103%20Developments/css선택자.md)라고 하고 [이벤트](posts/100%20Resources/101%20Temp/dev(구)/Front/이벤트위임(Event%20Delegation).md)를 통해서 각 dom 요소에 적용된 이벤트를 직접적으로 다룰 수 있다. 

ex) `classname`의 클래스를 가진 객체가 클릭하면 doThis를 실행한다. 
```js
document.querySelector('.className').addEventHandler("click",()=>{
    doThis();
})
```


## 이벤트 버블링
> 하위요소에서 발생한 이벤트가 상위요소로 전파하는 것

- onClick 혹은 onDrag등의 html의 attribute(속성)에 정의된 이벤트에 사용할 함수를 넣으면 실행되는 함수의 이벤트 개체로 전달된다.

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
