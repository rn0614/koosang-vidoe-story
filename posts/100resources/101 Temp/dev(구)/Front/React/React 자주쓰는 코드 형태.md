---
title: React 팁
excerpt: List 나 Object를 다룰때 자주나오는 코드 형태
categories:
  - Categories2
tags: 
permalink: /categories2/202409282241기법/
toc: true
toc_sticky: true
date: "2024/09/28 00:00:00"
last_modified_at: "2024/09/28 00:00:00"
---
# 리스트 삭제 기법
> 보통 list의 id를 받아서 filter로 삭제
```ts
const [state, setState] = useState<Item[]>([]);

const dleleteHandler = (deleteId)=>{
  setState(itemList.filter((item)=> item.id !== deleteId))
} 
```

# Object리스트의 상태값 업데이트
```ts

const [list, setList] = useState<Item[]>([]);

const updateHandler = (updatedItem) => {
  setList((prev) => prev.map((item) => {
    if (item.id === updatedItem.id) {
      return { ...item, ...updatedItem, name: item.name }; // name은 업데이트 못하게 막음.
    }
    return item;
  }));
};

```


# Falsy한 값의 의도치 않은 표기 피하기
> falsy한 값이 간혹 의도치 않는데 표기되는 경우가 있다. jsx의 표기하는 평가값은 false, undefined, null 셋중에 하나가 나와야 제대로 동작하는 것을 기억하지

```jsx
const Page = ()=>{
  
  //(x) array.length가 0 이나올경우 0을 그대로 출력 문제 발생
  return <>
    {array.length &&(
        array.map((item)=> (<div key={item.id}>{item.id}</div>))
      )
    }
  </>


  //(x) array.length가 0 이나올경우 0을 그대로 출력 문제 발생
  return <>
    {array.length!==0 &&(<div>
      <h1>here</h1>
    </div>)
    }
  </>
  
  //(x) array.length가 0 이나올경우 0을 그대로 출력 문제 발생
  return <>
    {array.length!==0 &&(<div>
      <h1>here</h1>
    </div>)
    }
  </>
}



```