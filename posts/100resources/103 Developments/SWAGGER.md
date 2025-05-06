---
title: SWAGGER
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: Swagger란 무엇이며 무엇을 위한 글인가
tags:
  - API
date: 2025/01/05 00:00:00
last_modified_at: 2025/01/05 00:00:00
---
**공식문서 : https://swagger.io/docs/**

## API Doc란?
- 클라이언트가 서버로부터 받는 request/response를 정의한 문서
  예시) 어떤 api인지 description, Request의 url, parameter, body, header /  Response의 status등
- 자주쓰는 라이브러리로 swagger와 RestDoc 
    swagger는 단순히 annotation 위에 추가하므로 추가가 쉽다. (단순히 ANNOTATION을 추가하는걸로 anotation사용가능)
    restDoc는 테스트코드를 통과한 케이스에만 API문서가 생성된다. (따라서 모든 테스트를 작성해야함)
    ***둘의 장단점을 보완하기 위해 같이쓰는 경우도 있다.***
## Swagger란?
> API 리스트를 HTML로 문서화 및 테스트하는 라이브러리, documentation을 작성하여 공유 및 소스코드 자체에 API문서가 들어있는 점에서 개발자가 관리하기 쉬움.

전체적인 api별 기능을 정의하여 문서로 만듦. 이 과정에서 백엔드와 프론트엔드간의 소통을 원할하게 할 수 있음.
(fast-api에서는 자체적으로 들어있기도 함.)

큰 소재목으로 어떤 api인지 표시하고 그 안에 상세 api에 대해서 나눠서 표현 가능
![](_md파일/Pasted%20image%2020250107220432.png)

- 상세 description 및 parameter example value, result 를 나눠서 보여줄 수 있음.
![](_md파일/Pasted%20image%2020250107230506.png)



## 사용 library
```shell
npm i next-swagger-doc # nextjs용 swagger 라이브러리
npm i swagger-jsdoc
npm i swagger-ui-react # react용 rendering 하는 문서를 만든다.
```

## 코드
### 1. Swagger 공통 세팅
swagger 공통설정을 정의한다.
```tsx
// /lib/swagger.tsx
import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: "src/app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "koo-project api-doc",
        version: "1.0",
        license: {
          name: "MIT",
          url: "https://opensource.org/licenses/MIT", // MIT License 상세 정보 URL
        },
      },
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",  // JWT 코드
        },
      },
    },
    security: [{
      
    }],
  });
  return spec;
};
```

*** OpenAPI Spec이란? : RESTful 웹서비스를 설명 생성 소비 및 시각화하기 위한 I/F 파일 사양
상업적으로 이용한다면 license 부분은 MIT로 표기할것


### 2. API 에 DOCS 문서 작성
> annotation에 정의를 작성해 놓는다. params 나 requestBody, response 의 형태를 정의해놓는다.
- 경로: method: tags: 구성으로 만든다. 다음과 같이 function에 정의할 수도 있고 yaml 파일에 따로 정의할 수도있다.


```tsx
/** 
 * @swagger 
 * /api/schedule:
 *   post: 
 *     tags:
 *       - schedule
 *     description: schedule을 추가하는 로직
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id: number
 *               created_at: string
 *               day: string
 *               deleted_at: string
 *               startTime: string
 *               endTime: string
 *               text: string
 *               type: string
 *               updated_at: string
 *               isChange: boolean
 *           example:
 *             id: 1
 *             created_at: "2025-01-05T10:00:00Z"
 *             day: "2024-12-10"
 *             deleted_at: null
 *             startTime: "10"
 *             endTime: "20"
 *             text: "일정1"
 *             type: "1"
 *             updated_at: "2025-01-06T10:00:00Z"
 *             isChange: true
 *     responses:  
 *       200:
 *         description: 업데이트된 json data를 반환한다  
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "/api/schemas#/definitions/UpdateResultDTO"
 *             example:
 *               code: 201
 *               message: "업데이트완료"
 *               result: 2
 *       500:
 *         description: Error 
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "/api/schemas#/definitions/ErrorResultDTO"
 *             example:
 *               code: 500
 *               message: "알수없는 오류로 업데이트에 실패하였습니다."
 */ 
export async function POST(request: NextRequest) {
  const body = await request.json();
  const scheduleList = body.scheduleList as TimeSchedule[];
  const formatedScheduleList = scheduleList.map((scheduleItem) => {
    return {
      id: scheduleItem.id,
      day: scheduleItem.day,
      text: scheduleItem.text,
      startTime: scheduleItem.startTime,
      endTime: scheduleItem.endTime,
      type: scheduleItem.type,
    };
  });
  try {
    const supabase = createClient();
    let { data, error } = await supabase.rpc(
      "upsert_multiple_records_with_transaction",
      {
        schedule_data: formatedScheduleList, //
      }
    );
    if (error) console.error(error);
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log("error occured", error);
  }
}

```

## 발생한 문제상황
1. DTO타입을 작성할 때 ANNOTATION으로 쓰면 길이가 길어짐. 위의 예시도 EXAMPLE만 썼는데도 길이가 긴걸 알 수 있다.
2. DTO타입의 경우 코드를 작성할 때 타입처리가 되지만 DTO타입을 변경하고 ANNOTATION은 수정을 안하는 케이스가 발생할 수 있다.

### 1) 타입스크립트의 DTO 타입을 따로 저장해서 관리한다.
> api는 백과 프론트간의 약속이다. DTO타입들을 바꿀 일이 있다면 꼭 프론트와 상의해서 바꾸는 것이 좋다.
 
타입스크립트를 따로 저장해서 관리하고 해당 ts 파일을 json 형태로 저장한다.
- library 및 실행명령어
```shell
npm i swagger-typescript-api
npm i typescript-json-schema

# 실행명령어
typescript-json-schema src/types/apiDTO.ts "*" --out src/types/types-schema.json --required #type으로 지정한 내용을 json 형태로 만드는 명령어
```

- 생성된 json 예시
```json
{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
        "APItestRequest": {
            "properties": {
                "id": {
                    "type": "number"
                },
                "name": {
                    "type": "string"
                }
            },
            "required": [
                "id",
                "name"
            ],
            "type": "object"
        },
    }
}
```



### 2) DTO 타입을 typescript 파일로 따로 저장한다.
내가 DTO 타입만 변경하고 SWAGGER의 ANNOTAION에는 반영을 안할 경우 문제가 생길 수 있음.
따라서 API를 typescript코드로부터 가져오도록 한다.
```ts
// src/app/api/schemas/route.ts
import { NextRequest, NextResponse } from "next/server";
import schema from "@/types/types-schema.json";

export async function GET() {
  if (
    process.env.NEXT_PUBLIC_API_GP === "local" ||
    process.env.NEXT_PUBLIC_API_GP === "dev"
  ) {
    return NextResponse.json(schema);
  }
  return NextResponse.json(null);
}
```

```tsx
// 변경전
 *           schema:
 *             type: object
 *             properties:
 *               id: number
 *               created_at: string
 *               day: string
 *               deleted_at: string
 *               startTime: string
 *               endTime: string
 *               text: string
 *               type: string
 *               updated_at: string
 *               isChange: boolean


// 변경후
 *           schema:
 *             $ref: "/api/schemas#/definitions/TimeScheduleDto"

export async function POST(request: NextRequest) {
```

