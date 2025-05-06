---
title: 프로젝트 생성 과정
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: 프로젝트를 실행하면서 어떤 부분을 고려했는지에 대한 고민
tags:
  - swagger
date: 2025/01/01 00:00:00
last_modified_at: 2025/01/01 00:00:00
---
> Set a goal, make a plan and just do it.
## 0. 가정
1. 프로젝트 idea 수립완료 (figjam)[[private/100 Resources/103 Developments/Figma의 jambot 으로 ideate 과정]]
2. 프로젝트 기획 완료 (figjam,  github) 
3. 프로젝트 design 수립완료 (v0.dev) https://v0.dev/    (figma) [[posts/100-Resources/106 Side Assistant/FIGMA로 디자인하기]]

## 1. 기술스택 선택
### 1) 웹만을 고려했을 때
1. React/Nextjs + SpringBoot : 큰 기업에서 가장 많이 쓰는 형태, 레퍼런스 다수
2. React + Express(Node) : 소규모 1인에서 많이 쓰는 형태, 해외에서 많이 사용
3. React + Flask : 백단이 Python으로 강제되는 경우 사용

### 2) 모바일 웹뷰까지 고려
1. react-native, Flask 이용해서 사용
2. android, ios 각자 개발

### 3) 어떤 기술로 체험을 하는게 나은가?
1. 원하는 기술스택으로 하되 체험하지 않을 기술스택은 최소화된 환경이 좋음
2. SAAS(software as a Service)를 통해서 가장 원하는 형태의 서비스를 구현하는게 좋음.

### 4) 배포서비스
1. cafe24 : 무료
2. netlify : 무료
3. AWS : 유료(학생 1년)
4. vercel : 무료
5. firebase, supabase : 무료(백엔드 서비스 플랫폼)

### 5) 선정 기준
1. 초기세팅없이 빠르게 프로젝트 생성 할 수 있는 것(세부설정도 하면 좋겠지만 기능에 집중할 수 있는 환경)
2. ts/js 기반 코딩 (한가지 언어에 집중)
=> github + aws( react + springboot )
=> github + vercel( nextjs `front+ back` )  + supabase(saas) + aws( socket.io, fastApi )   

## 2. 개발 설계 및 명세서 관리
>  개발에서 중요한 점은 무엇을 개발할 건지 명확하게 하는거라고 생각한다. 단순하게 어떻게 해야지라고 한순간 생각하고 코드만 작성하고 끝나게 되면 나중에 보거나 혹은 협업자가 질문했을 때 본인도 다시 코드를 봐야하는 불상사가 발생할 수 있다. 이를 위해 설계와 명세서를 공식 문서로 남겨놓으면 좋다.
### 0) 가정
1. '무엇'을 개발할지는 나와있는 상태고 사용자의 얘기를 듣고 이미 어떤 데이터가 필요한지 정리는 한 상태 (참고 : https://www.youtube.com/watch?v=VdZj1VZL8A8&t=1227s)
2. 프론트에서는 디자인 시안관련은 FIGMA로 제작완료된 상태로 가정
3. back api 명세서에는 url + method + 기능 등을 명시 (  RestDOC)

### 1) ERD 작성과정
> vscode의 erdEditor : 테이블을 생성시 해당 생성 sql 및 constraint에 대해서 직접적으로 확인 가능
> dbeaver의 엔티티구조도 : 실제 생성된 테이블의 erd를 보여줘서 확인가능
1. vscode확장프로그램 erd Editor 로 ERD 작성과정
2. 어느정도 만들 것에 대한 테이블에 대한 내용은 우선 정하는게 좋음. 아니면 나중에 재설계 시 프로그램 수정본수가 많음.



#### VSCODE의 ERD EDITOR로 만든 구조도
![](_md파일/Pasted%20image%2020250105155516.png)

#### 자동생성된 DDL
![](_md파일/Pasted%20image%2020250105155542.png)

### 2) API 명세서 관련
> swagger, restDocs를 통해서 api 명세서를 작성할 수 있음. 각기 장단점이 있는데 restDocs는 정확한 대신 테스트코드가 작성돼야하고 swagger는 annotation으로 편하게 작성하는 대신 실제와 괴리가 있을 수 있음.

backEnd 입장에서 Front에서 빠르게 데이터를 달라고 할 때 혹은 미리 function 을 만들어두고 이 function의 input과 output을 미리 정하라고 할 때 annotation을 미리 적어서 api가 어떻게 만들어질지 공유가 가능함.

swagger로 작성된 코드 [SWAGGER](_github_open/Back/SWAGGER.md)

아래와 같이 코드가 완성됨을 알 수 있다.
![](_md파일/Pasted%20image%2020250105161214.png)

