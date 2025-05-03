---
title: Spring Security
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: spring-security 초기세팅방법
thumnail: 
tags:
  - Back/SpringBoot
  - SpringSecurity
date: 2025/02/05 01:23:31
last_modified_at: 2025/03/16 22:09:34
---
## 동작원리
application에 요청을 보내면 Container 안에 있는 Filter를 거쳐서 인증작업을 진행함
그런데 이런 인증작업을 하는 filter를 Spring Security Config를 통해서 만드는 것을 자동으로 해주는 library

요청 -> (filter -> controller)  : ()는 spring Container


```java
@Configuration     // 환경설정
@EnableWebSecurity // 자동설정 클래스 비활성화됨
public class SecurityConfiguration {

  @Bean
  SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
	http.authorizeHttpRequests(auth-> auth
	  .requestMatchers("/api/d1/login").permitAll()    // 로그인요청은 누구나 가능	
	  .requestMatchers("/api/d1/member/**").authenticated() // 로그인만 돼 있으면
	  .requestMatchers("/api/d1/manager/**").hasAnyRole("MANAGER","ADMIN") //권한들 가능
	  .requestMatchers("/api/d1/admin/**").hasRole("ADMIN") // 특정 권한 가능
	  .requestMatchers("/api/d1/denied/**").denyAll()
	  .anyRequest().authenticated();
	)
  }
}

```



## 단방향 해시 암호화
- BCrypt Password Encoder 사용할 예정
- 암호화만 가능하고 복호화는 못하는 암호화
```java
  // CORS 설정

  @Bean
  CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://spring.koosang-project.com"));
    config.setAllowedMethods(Arrays.asList("GET","POST","PUT","DELETE","PATCH"));
    config.setAllowCredentials(true);
    config.setExposedHeaders(Arrays.asList("Authorization", "Authorization-refresh"));
    config.setAllowedHeaders(Arrays.asList("Authorization", "Authorization-refresh", "Cache-Control", "Content-Type"));
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
  }


```



```java

@Bean
  SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    //CORS 설정변경
    http.cors(corsConfigurer ->
      corsConfigurer.configurationSource(corsConfigurationSource())
    );
  
    //CSRF 토큰을 비활성화 한다
    http.csrf(csrfConfigurer -> csrfConfigurer.disable()); // scrf 토큰을 받지 않겠다.

    // 인증/인가 설정
    http.authorizeHttpRequests(authorize ->
      authorize
        // URL 경로 member 에는 인증 성공필요
        .requestMatchers("/api/d1/member/**").authenticated()
        // // URL 경로 manager 에는 인증 성공 + MANAGER 권한
        .requestMatchers(new AntPathRequestMatcher("/api/d1/manager/**"))
        .hasAnyRole("MANAGER", "ADMIN")
        // .requestMatchers(new AntPathRequestMatcher("/api/d1/admin/**"))
        // .hasRole("ADMIN")
        // 나머지 모든 권한에 한해 모두 접근 허용
        .anyRequest().permitAll()
    );

  

    // 로그인 설정
    http.formLogin(auth ->
      auth
        .successHandler(new MyAuthenticationSuccessHandler())
        .failureHandler((request, response, authentication) -> {
          System.out.println("인증실패");
          response.setStatus(401);
        })
        .loginProcessingUrl("/api/d1/login")
    );

  

    // 권한 없음 페이지
    http.exceptionHandling(exception ->
      exception.authenticationEntryPoint(
        new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)
      )
    );

  

    // 로그아웃 설정

    http.logout(auth ->
      auth
      .logoutSuccessHandler((request, response, authentication) -> {
        System.out.println("logout성공");
        response.setStatus(200);
      })
      .invalidateHttpSession(true)
      .deleteCookies("JSESSIONID")
      .logoutUrl("/api/d1/logout")
      .permitAll()
    );
  
    // 사용자 정의 UserDetailsService 적용
    http.userDetailsService(detailsService);

    // 다중로그인 허용여부 설정
    http.sessionManagement(auth ->
      auth.maximumSessions(1).maxSessionsPreventsLogin(true)
    );

    http.sessionManagement(auth -> auth.sessionFixation().changeSessionId());
 
    return http.build();

  }


```

#추가작성필요 