---
title: React 최적화 전략
excerpt: React가 어떤 면에서 기존 rendering 방식보다 나은가?
categories:
  - Categories2
tags:
  - Front/React
permalink: /categories2/202409290139가상돔/
toc: true
toc_sticky: true
date: "2024/09/29 00:00:00"
last_modified_at: "2024/09/29 00:00:00"
---
# 배경
> 브라우저의 렌더링 부분을 가상돔을 통해 시간을 줄일 수 있다.
> 레이아웃 부분과 페인팅 부분이 전체의 절반이상의 자원을 소모한다.
## 브라우저 렌더링 과정
1. DOM 생성 : HTML 파일 다운로드(DOM트리 생성)
2. CSSOM 생성 : CSS 파일을 통해 CSSOM 트리 생성
3. 렌더 트리 생성 : DOM과 CSSOM 을 결합하여 렌더 트리 생성
4. 레이아웃 : 요소의 크기와 위치를 계산
5. 페인팅 : 레이아웃 정보를 바탕으로 화면에 요소를 그림
6. 컴포지팅 : 여러 레이어를 결합해 최종적으로 브라우저 화면에 렌더링

> REACT는 이중 레이아웃, 페인팅, 컴포지팅 부분을 개선하는 방식으로 성능을 개선했다. 
1. 가상 DOM과 비교 : 이전 가상 DOM과 새로운 가상 DOM을 비교하고, 차이점을 추출
2. 렌더 트리 생성 : 변경된 부분과 CSSOM을 결합하여, 그 부분의 렌더 트리를 생성
3. 레이아웃 : 변경된 부분의 크기와 위치를 다시 계산
4. 페인팅 : 변경된 요소를 다시 그림
5. 컴포지팅 : 여러 레이어를 결합해 변경된 부분만 새로 렌더링


## Reconciliation
> 두개의 가상 DOM을 비교(diffing)하여 변경된 부분만 실제 DOM에 반영하는 과정

## Batch Update
> 여러 상태 UPDATE 를 하나로 묶어서 리렌더링 대상을 한번에 처리하는 방법

## Memoization
- React.memo : Dom rerendering 부분에서 자식요소부분이 변경되지 않을 때 리렌더링하지 않기
- useMemo, useCallback : 불필요한 렌더링 하지 않기

## Fiber Architecture
- 렌더링 대상들을 나누고 그 대상을 비동기적으로 처리


# 최적화 사항

## 1. 상태, Props에 연동된 데이터는 따로 상태를 두지 않는다
```jsx
const Page = (props1)=>{
  const [state1, setState1] = useState();
  const [state2, setState2] = useState();

  // (x)새로 합산하는 상태를 만들지 말것
  // const [state3, setState3] = useState();
  // useEffect(()=> setState3(state1+stat2))

  // (o) state, props에만 종속된다면 해당 값을 rendering 시 그냥 사용
  const state3 = state1 +stat2 + props1

  // (o) 전처리한 내용이 참조변수면 useMemo를 사용할 것
  const state4 = useMemo(()=>({state1, state2, props1}),[state1,state2,props1]);

  useEffect(()=>{
    // state1,2 props1 이 변경될때 state4가 변경됨
    console.log(state4)
  },[state4])

  return <>
  <h1>{state3}</h1>
  </>
}

```

## 2. 사용 시점이 실시간이 아닌 경우 ref사용
> 다만 rendering이 변경된다면 ref가 아닌 state 쓸 것
```jsx
const Page = ()=>{
  // (x) 특정 시점에만 사용하는 것이라면 useRef로 충분
  //const [state1, setState1] = useState();
  const ref1 = useRef();

  const doSomething =()=>{
    const curRef1 = ref1.current.value;
    //.. 
  }

  return <>
    <div ref={ref1} onClick={doSomething}></div>
  </>
}
```


## 3. 요청시간이 길고 자주언마운트되는 경우 Aborting Content
> 비동기로 이루어지는 이벤트를 중지함으로 메모리 누수 방지
```jsx
const Page = ()=>{

  useEffect(()=>{
    const controller = new AbortController();
    setLoading(true);
    fetch(url, {signal:controller.signal})
      .then(setData)
      .catch(setError)
      .finally(()=> setLaoding(false))

    return ()=>{
      controller.abort();
    }
  },[url])
}
```