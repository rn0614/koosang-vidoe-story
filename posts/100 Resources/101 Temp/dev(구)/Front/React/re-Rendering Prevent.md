---
title: re-Rendering Prevent
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: 리렌더링을 예방하여 프로그램을 최적화 하는 기법
tags:
  - Front/React
  - Optimization
date: 2024/10/11 00:00:00
last_modified_at: 2024/10/11 00:00:00
---
## 어떤 문제를 해결했나?
> react는 특정 컴포넌트가 리렌더링되면 하위 컴포넌트도 리렌더링된다. 그 과정에서 의도치 않은 리렌더링을 통해 성능이 저하되곤 한다. 이를 방지하기 위해서 React.memo를 사용하지만 해당 방식을 사용하는 것 보다 컴포넌트의 구조를 잘 설계하면 memo가 아니더라도 성능을 최적화 할 수 있다.

### 1. 자식요소로 상태 위임
> react의 기초지만 중요한 것은 상태값을 최대한 하위 컴포넌트에 구성하는 것이다. Parent Component의 상태를 자식요소로 위임하여 부모요소가 아닌 자식요소가 리렌더링 되도록 변경한다. 혹은 사용하는 요소들은 따로 자식요소로 구분한다.

```tsx
// as-is
const Parent = ()=>{
  const [state, setState] = useState();
  return (<>
    {state && <Child1 />}
    <Childe2 state={state}/>
    <Child2/>
  </>)
}

// to-be
const Parent = ()=>{
  return (<>
    <ChildState/>
    <Child2/>       //Child2는 더이상 리렌더링 대상이 아님
  </>)
}

const ChildState = ()=>{
  const [state, setState] = useState();
  return (
  <>
    {state && <Child1 />}
    <Childe2 state={state}/>
  </>
  )
}
```

### 2. Component로 사용
> 오래걸리는 요소를 children 요소로 빼서 Props 로 이용하는 방식 
```tsx
//as-is
const Component = ()=>{
  const [frequentState,setFrequentState] = useState();
  return (
    <div onChange ={()=>setFrequentState(pre=>!pre)}>
      <SlowComponent/>
    </div>
  )
}

//to-be
const Component = ()=>{
  return (
    <ComponentWithState>
      <SlowComponent/>
    </ComponentWithState>
  )
}

const ComponentWithState = ({children})=>{
  const [frequentState,setFrequentState] = useState();
  return (
  <div onChange ={()=>setFrequentState(pre=>!pre)}>
    {children}
  </div>)
}

```

### 2-ex. tip
> 복수개의 children은 Props로 전달가능
```tsx
const Comp = ()=>{
  return (
    <Layout
      comp1={<Comp1/>}
      comp2={<Comp2/>}
    />
  )
}

const Layout =({comp1, comp2})=>{
  return(
  <div>
    <div classname ={styles.comp1}>
      {comp1}
    </div>
    <div classname ={styles.comp2}>
      {comp2}
    <div>
  <div>
  )
}
```
