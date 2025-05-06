---
title: HTTP
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: HTTP기본 내용
tags:
  - "#Network"
  - "#HTTP"
date: 2024/09/22 00:00:00
last_modified_at: 2024/09/22 00:00:00
---
# HTTP
## 짤막지식
> 정의는 mozilla에서 찾아서 보는게 낫다.
 https://developer.mozilla.org/ko/docs/Web/HTTP

### 1. 전송과정
1. HTTP는 OSI 7 계층에서 전송되는 규약이다. HEADER와 BODY로 나뉘는데 BODY는 내가 전달/ 수신받는 데이터고 송신 GET에는 BODY가 없다.
2. 6층에서 암호화/ 복호화를 하는데 SSL처리를 여기서 한다.
3. 5계층에서는 SOCKET을 만드는 역할을 하는데 TCP/IP 기반 통신을 한다.(보통 이때 데이터를 분할해서 보내는데 MTU 를 1500으로 보내는데 레거시에서 간혹 1400이 있다. 1400인 라우터를 지나면 1400으로 변환한다.)


## 2. 버전
대표적으로 3가지가 있다.
- HTTP/1.0     => 레거시
- HTTP/1.1     => keep-alive 해결 , 동시연결 수 6개 제약
- HTTP/2        => 헤더압축


### 3. Header parameter
웹상에서는 같은 ORIGIN(프로토콜, 도메인 , 포트)이 아니면 사이트의 접근을 막는다. 이 정책을 SOP(SAME-ORIGIN-POLICY)라고 부른다.

CORS는 이 SOP를 해소하기 위해 다른 사이트로부터 요청을 허가하는 정책이다.

보통 chrome으로 보면 간단한 header 구성은 다음과 같이 볼 수 있다.
여기서 요청Header의 Origin 부분이 수신측 주소와 맞지 않으면 CORS에러가 난다.
![](_github_open/asset/images/Pasted%20image%2020240922023124.png)

이런 부분은 각자 서버스펙에 따라서 처리하는 로직이 다르다.

1. SpringBoot - SPRING-SECURITY에서 처리 [Spring Security](_github_open/Back/SpringBoot/Spring%20Security/Spring%20Security.md)
```java
  // CORS 설정
  @Bean
  CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(Arrays.asList("http://spring.koosang-project.com","https://spring.koosang-project.com"));
    config.setAllowedMethods(Arrays.asList("GET","POST","PUT","DELETE","PATCH"));
    config.setAllowCredentials(true);
    config.setExposedHeaders(Arrays.asList("Authorization", "Authorization-refresh"));
    config.setAllowedHeaders(Arrays.asList("Authorization", "Authorization-refresh", "Cache-Control", "Content-Type"));
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
  }
```


2. node.js [Socket.io](_github_open/Front/Library/Socket.io.md)
```js
// Socket.IO 초기화
io = new SocketIOServer(server, {
  path: "/socket", // 소켓 경로 설정
  cors: {
    origin: "*", // CORS 전체 허용
    methods: ["GET", "POST"], // 허용하는 method
  },
});
```


## 3. status
- **1xx**: 정보성 응답. 요청이 수신되었으며 중간상황 응답
- **2xx**: 성공
- **3xx**: 리다이렉션
- **4xx**: 클라이언트 오류. 클라이언트가 잘못된 요청을 했거나, 권한이 없음
- **5xx**: 서버 오류. 서버가 요청을 처리하는 중에 오류가 발생



## 4. 참조는 RFC 9110 확인.


## 5. HEADER 부분 상세 확인
### 송신 header 중요항목
- ACCEPT : text/html  내가 원하는 데이터 형태를 미리 확인
- Cache-Control : 주고받는 데이터에 대한 캐싱유무
- Cookie : 송수신 데이터를 저장하는 위치.(보통 로그인 등을 많이 저장)

### 수신 header 중요항목
- Strict-Transport-Security : HSTS
- Cross-Origin-Opener-Policy : CORS정책설정
- Referrer-Policy : 
- Content-Type/Encoding/Length : Accept와 매칭돼서 사용
- Etag: 캐시랑 같이 사용