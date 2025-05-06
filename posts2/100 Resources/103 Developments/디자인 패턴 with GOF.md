---
title: 디자인 패턴 with GOF
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: GOF 디자인 패턴은 무엇이며 어떤 패턴들이 자주 사용되는가?
tags:
  - 디자인패턴
date: 2025/01/14 00:00:00
last_modified_at: 2025/01/14 00:00:00
---
> Set a goal, make a plan and just do it.
## 개요
디자인 패턴은 소프트웨어 설계 방법으로 여러개의 클래스들 간의 관계를 효과적으로 잘 맺는 방법을 정리해 놓은 것이다. 이중 GOF 는 gang of four로 코딩을 잘하는 사람 4명이 모여서 객체지향언어에서 나오는 자주쓰이는 패턴에 대해서 분류를 해놓은 것이다. 총 23개의 디자인 패턴이 있다. 대부분이 코드를 작성하면서 자연스럽게 패턴이 완료 된다.

***좋은 패턴이란 실 관리자가 쓸 수 있는 패턴이다. 실 사용자가 코딩에 대한 이해도가 낮은 상태라면 과도한 패턴보다는 그냥 if-else 혹은 switch로 표현하는 것이 나은 경우도 많다.***

## 중요하다고 판단되는 패턴들
> template, adapter, decorate 같은 패턴들은 일반적으로 코드를 짜다보면 자연스럽게 나오는 패턴들이다. 따라서 해당 내용은 생략한다.

## 객체 지향 디자인 패턴에서 고려할 사항
> 1. 클래스는 최소한의 단위 기능을 가져야함.
> 2. 큰 기능은 최소 단위 기능을 갖는 클래스들 간의 관계를 통해 개발됨.
> 3. 꼭 필요한 것들만으로 구성된 최적화된 소프트웨어 개발이 가능함.
> 4. 문제 발생 시 원인 규명이 빠름.
> 5. 최소한의 코드 수정으로 유지보수가 가능해 짐.
> 6. 기존 기능에 영향을 주지 않고 새로운 기능 추가가 가능해 짐.

## 1. GOF
> GOF(Gang of Four)로 유명한 개발자 4명이 소프트웨어 개발에서 자주 등장하는 문제를 해결하기 위한 23개의 디자인 패턴
> 크게 아래 3개의 디자인 패턴 구조를 가진다.

1. 생성(Creaational) 
	- Factory Method : 클래스를 생성객체, 들어가는 파라미터 초기값이 다양할 때 사용하면 좋다
	- Abstract Factory
	- Builder
	- Prototype
	- Singleton
2. 구조(Structural)
	- Adapter
	- Bridge
	- Composite
	- Decorator
	- Facade
	- FlyWeight
	- Proxy
3. 행위(Behavioral)
	- Interpreter
	- Template Method
	- Chain of Responsibility
	- Command
	- Iterator
	- Mediator
	- Memento
	- Observer
	- Strategy
	- Visitor


