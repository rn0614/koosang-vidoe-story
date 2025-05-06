---
title: webClient를 이용한 외부 stream API통신
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: webClient를 이용한 외부 stream API통신 | front, back간에 데이터 핸들링
thumnail: 
tags:
  - Back/SpringBoot
  - RegEx
  - stream데이터
date: 2025/03/18 01:13:59
last_modified_at: 2025/03/18 01:46:49
---
## WebClient
webClient는 Spring WebFlux에서 제공하는 비동기, 논블록킹 방식의 클라이언트이다. 해당 클라이언트를 통해 외부 api를 비동기적으로 호출 가능하다. 

> *tip*:이 방식은 요청 후 결과를 Mono나 Flux형태로 받을 수 있어 요새 자주 쓰이는 steam 방식으로 데이터를 수신받아 사용자에게 LLM 모델을 더 효율적으로 제공 가능하다.

// ExternalApiController.java
```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ExternalApiController {

    @Autowired
    private ExternalApiService externalApiService;

    @GetMapping("/call-api-reactive")
    public Mono<ResponseEntity<String>> callExternalApiReactive() {
        return externalApiService.getData()
                .map(data -> ResponseEntity.ok(data));
    }
}
```

// ExternalApiService.java
```java
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

@Service
public class ExternalApiService {

    private final WebClient webClient;
    // 실제 사용 시에는 프로퍼티 파일이나 환경변수로 API 키를 관리하는 것이 좋습니다.
    private final String API_KEY = "your_api_key_here";

    public ExternalApiService(WebClient.Builder webClientBuilder) {
        // 외부 API의 기본 URL 설정 (예: https://externalapi.example.com)
        this.webClient = webClientBuilder.baseUrl("https://externalapi.example.com").build();
    }

    public Flux%3CString%3E callExternalApi(RequestDto requestDto) {
        return webClient.post()
                        .uri("/external-endpoint") // 외부 API의 엔드포인트
                        .header("Authorization", "Bearer " + API_KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(requestDto)
                        .retrieve()
                        .bodyToFlux(String.class);  // 스트림 형태의 문자열 데이터 반환 (필요 시 DTO나 JsonNode로 변경 가능)
    }
)
```


## FRONT에서 STREAM 데이터 받기
axios 의 경우 stream 객체를 받지 못하므로 fetch를 사용해서 수신받는다.

### 난감했던점
1. axios 의 경우 stream 객체를 받지 못하므로 fetch를 사용해서 수신받는다.
2. `while((match = 정규식.exec(문자열)) !==null )` 안의 방식의 lastIndex는 while을 벗어나면 초기화 됨
`chunkRegex.exec(chunkBuffer)`을 사용하면 손쉽게 정규식에 해당하는 요소를 골라낼 수 있다. 하지만 이렇게 실행시 while 문을 빠져나가면 `chunkRegex.lastIndex` 의 값이 0으로 초기화 돼서 이미 처리한 부분을 chunkBuffer에서 빼지 못하는 문제가 발생하였다.
따라서 `외부 변수(lastProcessedIndex)`를 두어 해당 while문에서 마지막 찾은 인덱스를 저장하고 해당 부분을 업데이트로 개선하였다.

### 코드
```js
function read() {
  reader.read().then(({ done, value }) => {
    if (done) {
      console.log('종료완료');
      return;
    }
    const chunk = decoder.decode(value);
    let lastProcessedIndex = 0;
    chunckBuffer += chunk;

    let match;
    while ((match = chunkRegex.exec(chunckBuffer)) !== null) {
      lastProcessedIndex = chunkRegex.lastIndex
      const jsonStr = match[1];
      try {
        const eventObj = JSON.parse(jsonStr);
        conversation.value[conversation.value.length - 1].content += eventObj.message;
      } catch (error) {
        console.error("JSON 파싱 오류:", error);
      }
    }
    // 처리된 부분 이후의 문자열만 남도록 chunkBuffer 업데이트
    if (lastProcessedIndex > 0) {
      chunckBuffer = chunckBuffer.substring(lastProcessedIndex);
    }

    read();
  });
}

```


## API가 이벤트 스트림으로 응답하는 방식
### 1. 복수개의 JSON 형태로 전달하는 방식
형태 : `{"role":"assistant", "content":"첫번째 메세지"} , {"role":"assistant", "content":"두번째 메세지"}` 
```java
Flux<ChatResponse> responseFlux = webClient.post()
    .uri("https://externalapi.example.com/endpoint")
    .retrieve()
    .bodyToFlux(ChatResponse.class);

Flux<String> messageFlux = responseFlux.map(ChatResponse::getMessage);
```


### 2. 단일 JSON 객체를 응답하는 경우
형태 : `{"role":"assistant", "content":["메세지1","메세지2"]}`

```java
{
  "chatRoleType": "ASSISTANT",
  "message": ["메시지1", "메시지2", "메시지3"]
}

```

## Spting boot WebClient로그 설정

### 1. properties 설정부
```properties
# WebClient 관련 로깅
logging.level.org.springframework.web.reactive.function.client.ExchangeFunctions=DEBUG
logging.level.reactor.netty.http.client=DEBUG
```

### 2. 자바 수신부
```java
responseFlux.subscribe(
    data -> System.out.println("받은 데이터: " + data),
    error -> System.err.println("오류: " + error),
    () -> System.out.println("스트림 종료")
);
```


## HTTP 오류

400 Bad Request : 클라이언트에서 보낸 요청이 올바른 형식이 아니거나 서버가 이해를 하지 못할 때 보통 body가 잘못된 경우이다.
- 이번의 경우 내가 body 쪽에 명시되지 않은 type 데이터까지 같이 보내면서 발생하였다.

401 Unauthorized:  
- 인증 인가문제인데, 외부 API를 사용할 때 인증 인가 수단을 살펴봐야한다.

400과 401의 우선순위 : 대부분이 Spring Security 에 의해서 인가된 인원인지 먼저 확인하고 보내는 양식을 확인하기 때문에 401에러가 먼저나고 400이 난다. 하지만 시스템의 방식에 따라서 바뀔 수도 있다.