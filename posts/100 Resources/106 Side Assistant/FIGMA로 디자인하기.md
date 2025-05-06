---
title: FIGMA로 디자인하기
CMDS: 
- "[[106 Design]]"
excerpt: Figma를 통해서 디자인 하는 방법
tags:
  - Design/Figma
date: 2025/01/07 00:00:00
last_modified_at: 2025/01/07 00:00:00
---
> Set a goal, make a plan and just do it.

## 왜 피그마?
> 사이드 프로젝트를 진행하면서 혼자 1인개발을 하다보면 UI/UX 디자인을 어떻게 해야하는지 고민이 되곤 합니다. 이 과정에서 개발자가 디자이너만큼 독특한 디자인은 아니더라도 기초적인 UI, UX 디자인을 따라가야할 일이 생기고. 개발생산성을 높이기 위해 디자인 툴로서 피그마를 사용합니다.
>  아이디어를 상세화 하기위한 IDEATION 과정으로 FIGJAM 기능을 이용하기도 합니다.

## 피그마 작업구조
> 하나의 FRAME 내부에 하나의 페이지가 들어가고 이 FRAME들이 모여서 SECTION을 구성한다,

## 컴포넌트
> 우리같은 개발자들이 재사용이 가능한 디자인 요소를 만들기 위한 요소이다. 컴포넌트를 지정하면 해당 디자인요소는 마스터 컴포넌트로 등록된다. 이 요소를 복제된 인스턴스들을 실제 화면을 구성하는데 사용한다. 

## FIGMA DEV(유료모드에서)
- ASSET을 FIGMA DEV 모드로 추출해서 색상, 폰트 등을 추출해서 사용할 수 있다.
- 요소를 개발자용으로 스니펫이 만들어짐/ 다만 이렇게 작업할 경우 색상이나 다른 요소들은 FIGMA와 개발환경에서 동기화하지 않는다면 사용이 오히려 힘들 수 있음.
- vs code에서 확장프로그램을 사용할 수 있다.

## 개발자 필수 플러그인
> 나는 주로 anima, figma to react 두가지 플러그인을 사용한다.
1. anima : 텍스트를 디자인요소로 만든다.
2. figma to react : 디자인요소를 react-component로 만든다.


즉 string 을 통해서 figma요소로 바꾸는 작업을 한다.
** v0.dev 도 vercel에서 낸 string to react-code가 가능하지만 둘다 써본바 성능이 거의 비슷하다.
content real, Lorem ipsum 을 통해 더미데이터를 만들수도 있다.

## 가이드
> 디자인요소를 체계적으로 정리한 UI COMPONENT를 만들어 놓은 것이다. 디자이너는 가이드라고 많이 부르는걸로 안다. 이 가이드는 FRONT-END 의 ATOMIC DESIGN 의 디자이너 파트이고 이 가이드가 변할 때 ATOMIC 으로 만든 1대1 대응되는 컴포넌트를 바꾸는 식으로 개발하는게 편하다.

## 피그마 라이브러리
> 위의 가이드를 정리해서 이미 만들어둔 라이브러리들이 있다. MUI 와 같은 역할을 하고 MUI는 기는적인 부분을 미리 구현해 놓고 외적인건 기본 DEFAULT 하나가 있고 나머지 스타일은 개발자가 구현을 해야한다. 
> 반대로 FIGMA 라이브러리는 스타일을 여러 VAUNNDARY로 구현을 해놓았다. 1인 개발을 하는데 디자인이 크게 중요하지 않다면 이런 라이브러리를 통해서 구현하는 것이 더 낫다.


내 피그마 코드
https://www.figma.com/design/HGWVKOQvTAFUxNWRX4veaU/Untitled?node-id=1-3&m=dev
