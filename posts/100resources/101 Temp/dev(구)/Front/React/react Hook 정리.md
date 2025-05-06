---
title: React Hook 정리
excerpt: React의 Hook으로
categories:
  - Categories2
tags:
  - Front/React
permalink: /categories2/202409281359lazy/
toc: true
toc_sticky: true
date: "2024/09/28 00:00:00"
last_modified_at: "2024/09/28 00:00:00"
---
# useState
##  Array, Object 객체를 update할 때
> 새로운 상태로 업데이트 필요
```tsx
const [itemList,setItemList] = useState<Item[]>([]);
const listAddHandler = (inputItem:Item)=>{
  setItemList((pre)=>{
    return [inputItem, ...pre]
  })
}

```

## 초기 상태의 계산값이 복잡한 경우
```tsx
// 초기 상태값에 바로 fnction을 넣으면 리렌더링마다 해당 함수를 실행함.
// 이를 방지하기 위해서는 callback 함수를 넣으면 
const longTimeFn= ()=>{
  let myArray =[];
  setTimeout(()=>{
    myArray = [1,2,3]
  },10000)
  return myArray
}

function Component(){
  const [state, setState] = useState(()=>longTimeFn());
}
```


# useRef
## 개요
> useRef는 current 라는 값을 가진 객체
```tsx
//이 value값을 계속 유지(렌더링시에도 동일, 언마운트 되면 초기화)
// 즉 렌더링에 관련없이 값 변경 가능, 렌더링되어도 값 유지(dom요소 접근)
const Component = ()=>{
  const targetRef = useRef<Html>(value);  // targetRef : {current: value}로 저장

  const buttonHandler = ()=>{
    targetRef?.current.value = //여기가 inputValue
  }

  return (<>
    <div>ref 테스트</div>
    <div>component가 업데이트 안되면 안변함</div>
    <input ref={targetRef}/>
  </>)

}

```

# useEffect
```tsx
const Component = ()=>{
  useEffect(()=>{
  
  }) //모든 렌더링시

  useEffect(()=>{
    // mount 시에만
    return ()=>{
      // unmount 시
    }
  }, []) 
  
  useEffect(()=>{

  }, [...dependencies]) // deoendency 변경시에만 
  
  return(<div></div>)
}



```


# useContext
## 개요
> component간의 상단 상태를 최하단 Component로 보내는 방식
> recoil을 쓰면 전역이 될 수는 있는데 전역까지는 아니고 일정 Component 아래에서 사용하기에 좋음.
```tsx
import {createContext} from 'react';

export const CustomContext = createContext(null) // 초기 밸류를 지정

export const ContextProvider = ({children}) => {
  const [state, setState] = useState();
  return (
    <CustomContext.Provider value ={{state, setState}}>  // 보통 여기서 초기값 지정
      {children}
    </CustomContext.Provider>
  )
}


export const ChildrenComponent =()=>{
  const {state, setState} = useContext(CustomContext);
}

```


# useMemo
> 결과값을 memoization
## 1. 객체타입의 요소의 memoization

```tsx

const [state, setState] = useState();

const objectTarget = useMemo(()=>{
  return {key:state?'true':'false'}
}, [state])


```

## 2. 오래걸리는 function 분리

```tsx
// inputObj가 바뀌지 않는다면 계속 같은 값 사용
const longtimeFnReturn = useMemo(()=>{
  return longtimeFn(inputObj);
},[inputObj])
```

# useCallback
>해당 함수를 memoization
## 1. 함수를 memoization
> 함수가 리렌더링되어도 내부 function 은 변경이 안되는 경우에는 하는게 좋음.
```tsx
const Component = ()=>{
  const [state, setState] = useState(); // 해당값이 자주 변경된다
  
  const callbackFn = useCallback(()=>{
    // fn
    return;
  }, [])

  return (<>
  
  </>)
}
```

## 주의사항
- memoization 했을 당시의 fnction 이므로 처음 생성 시점의 state 값을 그대로 가진다. 따라서 변경 값이 안에 있다면 변경값으로 rendering 되도록 useCallback을 쓰지 말거나, dependency에 해당 값이 들어가야함 (자주 변하는 변수를 변수로 쓰는 함수일 경우 useCallback을 써도 효과가 미미) 

## 팁
- 자주변하는 변수가 여러개고 그에 따라 종속되는 함수가 여러개일 때 각각 분리하는 방법도 있음
```tsx
const Component = ()=>{
  const [state1, setState1] = useState();
  const [state2, setState2] = useState();

  const dependedState1Fn = useCallback(()=>{
    return {}
  },[state1])
  
  const dependedState2Fn = useCallback(()=>{
    return {}
  },[state2])

  return (
  <>
    <div></div>
  </>)

}
```

# useReducer
## 개요
> dispatcher가 Action을 통해서 State를 업데이트함
> const [state, dispatcher] = useReducer(reducer, initVal)

```tsx
const reducer = (state, action)=>{
  switch(action.type){
    case 'plus':
      return state + action.diff
    case 'minus':
      return state - action.diff
    default:
      return state;
  }

};

const Component = ()=>{
  const [state, dispatch]= useReducer(reducer, 0);


  return <>
    <button onClick ={()=>{
        dispatch({type:'구분', diff: value})
      }}
    >reducer실행</button>
  </>
}

```



# React.momo
> 자식컴포넌트가 리렌더링하지 않도록 막기 / 부모컴포넌트 rendering시 Props에 변화없으면 렌더링하지 않게 변경
> 자식 내 state나 useContext로 인한 렌더링은 그대로 실행됨
```tsx
const Parant = ()=>{
  const [props1, setProps1]= useState();
  const [props2, setProps2]= useState(); 

  return <div>
    <div>부모</div>
    <Child props1={props1} props2={props2}>
  </div>
}

//child.tsx
const Child = (props1, props2)=>{
  return <div>
    <p>{props1}</p>
    <p>{props2}</p>
  </div>
}

export default React.memo(Child);
```



# ForwardRef
```tsx
const MyInput = (props, ref) =>{
  return <input ref={ref}/>
}

export default forwardRef(MyInput);
```


# useId
> 이름 생성 `:r0:`

```tsx
const ChildComponent = ()=>{
  const id= useId(); // :r0: 형태
  return (
    <div>
      <label htmlFor={`${id}-input`}>라벨</label>
      <input id={`${id}-input`}/>
    </div>
  )
}

```


# useLayoutEffect
> effect를 먼저 실행하고 화면을 업데이트
> 동기적 
> dom update요소의 경우 useLayoutEffect 가 더 좋음

```tsx
useLayoutEffect(()=>{},[])


```
