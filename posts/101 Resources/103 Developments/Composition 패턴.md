---
title: Composition 패턴
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: Composition 패턴을 통해서 구조화를 하고 자주쓰는 단위를 묶어서 사용한다.
tags:
  - Front/React
  - 디자인패턴
  - react/디자인패턴
permalink: /categories2/202410152043패턴/
date: 2024/10/15 00:00:00
last_modified_at: 2024/10/15 00:00:00
---
## 개요
> Composition 패턴은 컴포넌트간에 구조를 계층적으로 표현하는 패턴이다.

## 장점
- 구조화/모듈화 : 하나의 상위 컨텍스트 안에 요소를 정의하므로서 구조적으로 깔끔하게 코딩가능, 재사용/확장에 용이하다.
- 데이터 공유 : 최상단 요소의 Context로 하위 요소에 데이터 전달이 쉬움.

## 예시 코드
```tsx
const DialogContext = createContext();

const Dialog = ({children}) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggelDialog = () => setIsOpen(pre =>!pre);

  return (
    <DialogContext.Provider value ={{ isOpen, toggleDialog }}>
      {children}
    </DialogContext.Provider>
  )
}


const DialogInput = () => {
  const { isOpen } = useContext(DialogContext);
  return isOpen ? <input /> : null;
}

Dialog.Input = DialogInput;


```


## 사용처
> MUI나 Headless UI들에서 자주 사용되는 패턴들이다. 정의해놓은 구조에서 움직인다.