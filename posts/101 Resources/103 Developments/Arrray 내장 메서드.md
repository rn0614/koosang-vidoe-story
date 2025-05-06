---
title: Arrray 내장 메서드
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: js 의 내장 메서드
tags:
  - javascript
permalink: /categories2/202409290620내장/
date: 2024/09/29 00:00:00
last_modified_at: 2024/09/29 00:00:00
---
## javascript에서 배열은
실제 배열이 아니고 배열의 동작을 흉내낸 특수한 객체이다. 실제로는 아래와 같이 숫자값을 key로 갖는 배열이다. 이 배열의 최대 길이는 2<sup>32</sup> -1 이므로 너무 긴 배열의 경우 주의하도록 하자

*객체이므로 자바스크립트로 강제로 중간값을 없애는 empty를 만들 수 있는데 웬만하면 이런 특징을 사용하지 않도록 한다.*

### 실제 JS 배열 내부의 모습
```ts
console.log(Object.getOwnPropertyDescriptor([1,2,3]));
/*
{
  '0':{value:1, writable:true, enumerable: true, configurable: true},
  '1':{value:2, writable:true, enumerable: true, configurable: true},
  '2':{value:3, writable:true, enumerable: true, configurable: true},
  length:{value:3, writable:true, enumerable: false, configurable: false},
}
*/
```

## JS 메서드 사용시 주의점
빠르게 만들어진 언어다보니 원본 객체의 보장을 하지 않는 메서드들이 일부 있다. 따라서 JS를 쓸때는 2가지를 중점적으로 봐야한다. `1.원본배열의 변화유무`, `2.반환값` #추가작성필요 

mutator method : 원본배열 변경메서드
splice, push

accessor method : 새 배열 생성메서드
concat, 


```ts
// 배열의 생성
const list = (new Array(10)).fill(0); 
/* new Array(1,2,3) = [1,2,3]
   Array.of(1) => [1]
   Array.from({length} ,(_ , i) => i)  => [0, 1, 2]
*/

// list는 object객체임.
typeof list  // retun 'object' 

//length
list.length // 배열의 길이


// isArray
Array.isArray(list) // true

// indexOf , inclueds
[1,2,3,4].indexOf(2, _) // 1 _는 시작위치
[1,2,3,4].includes(3) // true


[2,23,4].push('test')  /// return list.length =4 

[2,23,4].pop()  // return 2

[2,23,4].unshift('test','te')  /// return list.length =5

[2,23,4].shift()  /// return list.length =2

[1,2,3].concat([4,5,6],7)  // [1,2,3,4,5,6,7]  , 될수있으면 spread쓸것

// join
['가','나','다'].join(":")  // return "가나다"


// fill *원본배열변경*
[1,2,3,4,5].fill(0)  // [0,0,0,0,0]


// splice *원본배열변경*
const originArr = [1,2,3,4,5]
const targetItem = originArr.splice(1,1) //return [2], originArr = [1,3,4,5]
// 하나만 제거시 요소를 indexOf로 특정하고 splice로 제거
// filter는 전체 요소 제거

// slice
const originArr = [1,2,3,4,5]
const targetItem = originArr.slice(1,1) //return [2], originArr = [1,2,3,4,5]
const reverseItem = originArr.slice(-1) //return [5], originArr = [1,2,3,4,5]

// flat
[1,[2,3,[4,[5]]]].flat(2)  // return [1,2,3,4,[5]] , dept에 따라서 깊이, default는 1

// sort *원본배역*
[2,8,1,5].sort((a,b)=> a-b) // return undefined , originArr =[1,2,5,8]

// find
const targetItem = list.find((item)=>{return item.id == targetId})   // return Item


// findIndex
const targetItem = list.findIndex((item)=>{return item.id == targetId})   // return index as number


// some
const targetItem = list.some((item)=>{return item.id == targetId})  // return boolean


// every
const targetItem = list.every((item)=>{return item.id == targetId})  // return boolean

// filter
const targetItem = list.filter((item)=>{return item.id == targetId})  // return Item[]
const usefullFilter = list.filter((val, i, self)=>self.indexOf(val)===i); // 일반적인 중복제거 방법이지만 객체의 요소를 비교해서 중복을 제거해야할 때 사용하면 좋다

// map
const targetItem = list.map((item)=>{return {...item, value:item.value+1}})  // return Item[]


// flatMap  = map().flat(1) 과 동일
list.map((item)=>item.split('')).flat();



// reduce
const targetItem = list.reduce((acc,cur)=>(acc+cur), 0)  // return 최종값
const usefullReduce = list.reduce((arr, cur)=>{
    acc[cur] = (acc[cur]|| 0) + 1
    return arr
}, {}) // 최종적으로 list에 있는 요소들의 숫자를 {key:value} 형태로 가지고 있음

```


forEach는 undefined 반환
map은 callback 함수 return 값 반환