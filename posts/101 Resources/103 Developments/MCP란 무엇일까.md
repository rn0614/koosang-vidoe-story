## MCP
MCP란 model Context Protocol 이다. 쉽게 말하면 모델이 이해할 수 있게 정의해 놓은 프로토콜이다. 넓은 개념으로는 기존의 FUNCTION CALL하는 역할을 이제 규약으로 해놓음으로 LLM이 할 수 있는 업무 범위를 넓히는 일이다.

## 무엇을 할 수 있을까?
사용자로부터 프롬프트를 받아서 그 프롬프트 내부의 내용을 기반으로 BACKEND 단에서 발생하는 무엇이든 할 수 있다. 나는 이것을 BACKEND의 LLM화가 진행된게 아닌지 생각한다. LLM이 처음 나왔을 때 AI가 많이 발전하면 굳이 논리적 설계 필요없이 AI가 백엔드의 실행을 해주면되지 않는가에 대한 말이 있었다. 나는 그 초기 모델이라고 생각한다.

## 세팅방식
기본적으로 사용단에서는 아래와같이 `filesystem` 이라는 모듈의 큰 명칭을 정해주고 해당 모듈을 실행시킬 명령어를 넣는다.
### 사용할 IDE에서의 세팅
```JSON
"mcpServers": {
		"filesystem": {
			"command": "npx",
			"args": [
				"-y",
				"@modelcontextprotocol/server-filesystem",
				"C:\\work\\cursor",
				"C:\\work\\mcp"
			]
		}
}

```

### 커스텀 세팅
아래와같이 특정 내부 특정 port로 mcp 서버를 실행하고 해당 메세지를 선언한다.
여기서 중요한 점은 주석을 꼼꼼히 달아야 llm이 이 주석을 읽고 어떤 코드인지 빠르게 파악할 수 있다는 점이다. swagger 같은 느낌으로 주석을 달아주도록 하자.

// python 코드
```python
from mcp.server.fastmcp import FastMCP
import sys
 
# MCP 서버 생성
mcp = FastMCP(name="tutorial_1", host="127.0.0.1", port=5000, timeout=30)
 
 
# 간단한 에코 도구
@mcp.tool()
def echo(message: str) -> str:
    return message + " 라는 메시지가 입력되었습니다. 안찍어 볼 수 없죠! hello world!"
 
 
# 서버 실행
mcp.run()
```

// js 코드
```js
import { FastMCP } from "fastmcp";
import { z } from "zod"; 

const server = new FastMCP({ name: "My Server", version: "1.0.0", });

server.addTool({ 
    name: "add", 
    description: "Add two numbers", 
    parameters: z.object({ a: z.number(), b: z.number(), }), 
    execute: async (args) => { return String(args.a + args.b); }, 
});

server.start({ transportType: "stdio", });

```


## 우려점
LLM이 FUNCTION 을 실행시키다보니 보안상 문제가 생길 수가 있다. 그래서 CLAUDE는 FUNCTION을 실행할 때마다 질문을 꼭 넣도록 강제하였다. 남이 올린 MCP를 사용할 때는 코드에 대해서 대충은 살펴보는것이 매우 중요하다.


## 사용방안
나는 이 MCP를 통해서 질문하다가 끝났을때 이제까지 질문했던 내용들의 정리하여 문서로 남기는 작업에 사용하는것.
[n8n](n8n.md)을 통해서 단순로직이 아닌 상세로직의 실행을 하도록 하는게 필요하다.