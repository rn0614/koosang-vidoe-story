> useEffect 는 효과적으로 상태값이나 Props의 변경에 의해 리렌더링 시켜주는 react의 필수 Hook 이지만 생각보다 사용할 때 주의가 필요하다.

- Deps 에 관하여
1. deps가 변하면 useEffect가 동작하는 것이 아닌 rerendering 후 deps 에 변한게 있으면 useEffect를 실행
2. 따라서 rerendering을 발생시키지 않는 ref의 경우 변하더라도 rerendering이 발생하지 않음. 이는 ref.current 가 변하더라도 동일.


```ts
const Component = ({props1}:ComponentProps)=>{
    const [state1, setState1] = useSate<boolean>(false);
    const ref1 = useRef<HtmlDivElement>(null);

    useEffect(()=>{
        console.log('리렌더링 실행');
    }, [state1, props1, ref1]);

    return (
        <div>
            <p>실행할까 말까</p>
        </div>
    )
}
```

