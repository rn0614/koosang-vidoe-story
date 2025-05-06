## n8n이란?

n8n은 **"workflow automation tool"**, 즉 **자동화 워크플로우 도구**로, 다양한 서비스 및 앱 간의 작업을 **코드 작성 없이 또는 코드와 함께 연결하고 자동화**할 수 있는 **오픈소스 기반의 도구**입니다. 이름은 “**n8n**”으로, “**nodemation**(node + automation)”의 줄임말입니다.

---

## 2.기본 개념

### 1) 워크플로우(Workflow)

- 하나 이상의 **노드(Node)** 들이 연결되어 실행 순서를 구성한 것
- 각 노드는 특정 작업(ex. 이메일 전송, HTTP 요청, 데이터베이스 조회 등)을 수행

### 2) 노드(Node)

- 각각의 노드는 하나의 단일 작업을 수행하는 모듈
- 예: Google Sheets 노드, HTTP Request 노드, Function 노드, MySQL 노드 등

### 3) 트리거 노드(Trigger Node)

- 워크플로우를 **시작**하는 역할
- 예: Cron (정기 실행), Webhook (외부 이벤트), Gmail (새 이메일 수신 시)

---

## 3.주요 기능

### 1) 시각적인 워크플로우 빌더
- 드래그 앤 드롭 방식으로 워크플로우 구성 가능

### 2) 수백 개의 노드 통합
- Slack, Discord, Google Drive, AWS, MySQL, PostgreSQL, Airtable 등 **300개 이상의 서비스와 통합**

### 3) 조건 분기 및 반복 처리
- IF, SWITCH, LOOP 같은 조건 제어 가능

### 4) 사용자 정의 코드 실행
- **Function 노드**에서 JavaScript로 직접 로직 구현 가능

### 5) Credential 관리
- 외부 API 연동을 위한 인증 정보는 n8n 내부에 안전하게 저장 및 관리

### 6) 자체 호스팅 가능
- n8n은 오픈소스로, **서버에 직접 설치 가능**
- 클라우드 서비스(n8n.cloud)도 존재

---

## 4.사용 예시

### 1) Google Sheets → Slack 알림

- Google Sheets에 새로운 행이 추가되면 Slack으로 메시지 발송

### 2) 웹 크롤링 자동화

- HTTP Request → HTML Extract → Discord 알림

### 3) 데이터 통합

- MySQL에서 데이터 가져와 → Notion에 삽입 → 이메일 전송

### 4) 상태 모니터링

- 주기적으로 API 요청 → 특정 응답값 조건 충족 시 Telegram 알림

---

## 5.설치 방법 (Docker 기준)

```yaml
version: "3"

services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=admin123
    volumes:
      - ~/.n8n:/home/node/.n8n
```

→ 브라우저에서 `http://localhost:5678` 접속

---

## 6.구조 및 동작 방식

### 1) 실행 방식

- 트리거 노드가 발동되면 → 이후 노드가 순차적으로 실행되며 → 각 노드의 출력이 다음 노드의 입력으로 전달됨

### 2) 데이터 흐름

- 각 노드는 `JSON` 데이터를 받아 → 변형하거나 → 전달하거나 → 외부 API와 통신

---

## 7.장단점

### ✅ 장점

- 직관적인 UI/UX
- 오픈소스 및 자체 서버 설치 가능
- JavaScript로 고급 로직 구현 가능
- 다양한 플러그인 및 노드 지원

### ❌ 단점

- 워크플로우 복잡도가 높아질 경우 시각화 어려움
- UI가 무거워질 수 있음
- 기능 추가 시 JavaScript 지식 필요

---

## 8.활용 팁

### 1) Webhook으로 외부 시스템과 실시간 연동
→ GitHub PR 생성 시 → Notion 자동 정리

### 2) Function 노드를 통해 간단한 계산 및 필터링 가능
→ SQL 못 쓰는 상황에서 JS로 필터 조건 작성

### 3) `.n8n` 폴더로 모든 설정 백업
→ Docker 볼륨 마운트 시 유지 가능


https://www.youtube.com/watch?v=Fk5pQ0fQkJ0&t=56s

https://github.com/n8n-io/self-hosted-ai-starter-kit

![](public/image/Pasted%20image%2020250416013509.png)