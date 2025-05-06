---
title: obsidian-chatgpt 연동프로젝트
CMDS:
  - "[[107 Project]]"
excerpt: obsidian-chatgpt-
thumnail: /image/Pasted%20image%2020250304012442.png
tags: 
date: 2025/03/04 01:18:22
last_modified_at: 2025/03/16 21:22:18
---
## Obsidian-chatgpt 대화추출 프로젝트
1. obsidian은 데이터 메모 앱이다. 비교적 큰 규모의 데이터를 저장할 수 있으며 해당 데이터 내의 글자를 빠르게 검색하고 데이터간 연간관계를 지어 연관있는 자료구조를 빠르게 찾을 수 있도록 해서 제 2의 뇌라고 부른다.

2. chatgpt 는 이제 llm 모델로서 차세대 검색모델과 같다. 대화를 저장하는 방식이 내가 대화했던 대화방에 쌓이는 방식이다. 가끔 이상한 대답을 해서 해당 대답만을 날린다거나 아니면 내가 중간에 다른 질문을 끼워넣는 순간 관리가 이상해진다.

3. chatgpt는 대화 내보내기 기능이 있다. 이 기능을 쓰면 chatgpt 내부의 json 데이터가 나오는데 이 데이터를 기반으로 채팅창별로 markdown 으로 만들고 이 markdown에서 내가 안쓰는 대화의 내용을 없애거나 혹은 이상한 대화는 제거 대화끼리 연결고리를 만들어서 obsidian 에서 관리하면 좋지 않을까란 생각을 해보았다.


그로하여 obsidian - chatgpt 연동작업 플랫폼을 시작했다.



chatgpt의 설정에서 데이터 내보내기를 클릭하면 내 메일로 데이터를 보내준다.(zip 파일)

![](public/image/Pasted%20image%2020250304012442.png)

해당파일을 풀면 다음과 같이 나오는데 다른건 빼고 우리가 볼건 conversations.json이다. chat.html에도 대화내역이 들어있지만 json을 파싱해서 사용하도록 하자.
![](public/image/Pasted%20image%2020250305003437.png)


까보면 아래와 같이 나온다.
"RAG 개념과 활용" 이 내 채팅방 이름이고 아래가 대화 목록이다.
여기서 message가 있고 author.role = "user"  => content.parts 가 질문이다.
동일하게 author.rolr ="assistant" => content.parts가 답변
```json
[
  {
  "title": "RAG 개념과 활용",
  "create_time": 1740652800.792633,
  "update_time": 1740654688.907814,
  "mapping": {
      "aaa15177-9718-4985-9705-a363fc5eb46c": {
          "id": "aaa15177-9718-4985-9705-a363fc5eb46c",    
          "message": null,
          "parent": null,
          "children": [
              "7d076918-d721-45e0-a915-53855aca1b15"       
          ]
      },
      "355f9b2d-aeca-4d53-abb5-df1b231c789d": {
          "id": "355f9b2d-aeca-4d53-abb5-df1b231c789d",
          "message": {
              "id": "355f9b2d-aeca-4d53-abb5-df1b231c789d",
              "author": {
                  "role": "user",
                  "name": null,
                  "metadata": {}
              },
              "create_time": 1740652800.333,
              "update_time": null,
              "content": {
                  "content_type": "text",
                  "parts": [
                      "LLM 모델중 RAG에 대해서 설명해줘"
                  ]
              },
              "status": "finished_successfully",
              "end_turn": null,
              "weight": 1.0,
              "metadata": {
                  "serialization_metadata": {
                      "custom_symbol_offsets": []
                  },
                  "request_id": "91878de28b8baa5e-ICN",
                  "message_source": null,
                  "timestamp_": "absolute",
                  "message_type": null
              },
              "recipient": "all",
              "channel": null
          },
          "parent": "8d1bb224-e3d9-4469-824f-49305d83dbdb",
          "children": [
              "aa7d8c7f-fd54-4bc2-a536-fe23a278cf54"
          ]
      },
      "fdb2872e-4114-42d9-a96a-59d41162ec03": {
          "id": "fdb2872e-4114-42d9-a96a-59d41162ec03",
          "message": {
              "id": "fdb2872e-4114-42d9-a96a-59d41162ec03",
              "author": {
                  "role": "assistant",
                  "name": null,
                  "metadata": {}
              },
              "create_time": 1740652800.914297,
              "update_time": null,
              "content": {
                  "content_type": "text",
                  "parts": [
                      "### RAG (Retrieval-Augmented Generation) 개념 정리\n\n**RAG (Retrieval-Augmented Generation)**는 **\"검색 기반 생성\"** 기법으로, 사전 학습된 대형 언어 모델(LLM)이 **외부 지식 베이스에서 정보를 검색한 후 이를 활용하여 응답을 생성하는 방법**입니다."
                  ]
              },
              "status": "finished_successfully",
              "end_turn": true,
              "weight": 1.0,
              "metadata": {
                  "finish_details": {
                      "type": "stop",
                      "stop_tokens": [
                          200002
                      ]
                  },
                  "is_complete": true,
                  "citations": [],
                  "content_references": [],
                  "message_type": null,
                  "model_slug": "gpt-4o",
                  "default_model_slug": "gpt-4o",
                  "parent_id": "aa7d8c7f-fd54-4bc2-a536-fe23a278cf54",
                  "request_id": "91878de28b8baa5e-ICN",
                  "timestamp_": "absolute"
              },
              "recipient": "all",
              "channel": null
          },
          "parent": "aa7d8c7f-fd54-4bc2-a536-fe23a278cf54",
          "children": [
              "a79ae752-67f4-488a-a60a-2e8c379820d1"
          ]
      }
    }
  }
]

```


# json을 생성하는 파일
> 위 conversation.json 파일을 읽어서 처리하는 파이썬 코드를 짰다. 다른 내용은 다 필요없고 title, role, parts만 가져와서 사용했다.
> md_output 에 md파일 목록형태로 전송해주는 python 코드이다.
```python
import json
import os
import re

# 파일 경로 설정
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
input_file_path = os.path.join(BASE_DIR, "data", "conversations.json")
output_dir = os.path.join(BASE_DIR, "data", "md_output")  # MD 파일을 저장할 디렉토리

# 디렉토리 생성 (없으면 생성)
os.makedirs(output_dir, exist_ok=True)

# 파일명에서 특수기호 제거 함수
def sanitize_filename(title):
    return re.sub(r"[^a-zA-Z0-9가-힣\s]", "", title).strip()  # 영문, 숫자, 한글, 공백만 허용

def transform_data_from_file(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        data_list = json.load(file)

    grouped_data = {}

    for data in data_list:
        title = data.get("title", "Unknown Title")
        title = sanitize_filename(title)  # 특수기호 제거

        if not title:  # 만약 변환 후 제목이 빈 문자열이면 기본 제목 사용
            title = "Unknown Title"

        if title not in grouped_data:
            grouped_data[title] = []
        
        for key, entry in data.get("mapping", {}).items():
            message = entry.get("message")
            if message:
                parts = message.get("content", {}).get("parts", [])

                # parts가 비어있거나 [""]인 경우 제외
                if not parts or parts == [""]:
                    continue

                grouped_data[title].append({
                    "role": message.get("author", {}).get("role"),
                    "parts": parts
                })

    return grouped_data

# 변환 실행
transformed_data = transform_data_from_file(input_file_path)

# 변환된 데이터를 MD 파일로 저장
for title, conversations in transformed_data.items():
    md_file_path = os.path.join(output_dir, f"{title}.md")

    with open(md_file_path, "w", encoding="utf-8") as f:
        f.write(f"# {title}\n\n")

        for conversation in conversations:
            role = conversation["role"]
            parts = conversation["parts"]
            
            # Markdown 포맷으로 변환하여 파일에 작성
            f.write(f"*{role}*\n")
            for part in parts:
                f.write(f"{part}  \n")  # Markdown에서 개행을 유지하려면 두 개의 공백 후 개행 필요
            
            f.write("\n")  # 다음 대화를 위해 개행 추가

print(f"✅ 변환된 MD 파일들이 '{output_dir}' 디렉토리에 저장되었습니다.")
```

실행시켰더니 아래와 같이 잘 추출됐다. 해당위치로 obsidian vault(workspace)로 열면 예쁘게 작성된 md 파일들을 확인할 수 있다.
![](public/image/Pasted%20image%2020250305001321.png)

![](public/image/Pasted%20image%2020250305001608.png)

# 블로그 공유내용
> 내 블로그에는 javascript로  json을 .md파일들의 zip파일로 내보내는 기능을 추가해뒀다.



# 차후 개선할 내용
> 단순 내보내기만 한다면 채팅이 섞이는 문제등을 해결할 수 없다. 그래서 받는 시점에서 이걸 전에 받았는지 확인하는 작업 및 이동, 수정, 삭제에 대한 관리가 필요하다 따라서 내부 local DB에 해당 데이터를 저장하기로 했다. 


1. 내가 가장 최근에 가져온 zip 파일의 최종 대화일자보다 빠른 애들은 변경됐든 삭제됐든 무시한다.
2. 내가 가져온 파일을 db에 담는다. 변경사항이 있는 애들은 건들지 않는다.(update_gp=TRUE, delete_yn=TRUE)
3. 이를 python으로 대화를 재구성한다,
4. 이를 정의된 md 파일 양식으로 내보낸다.

위의 바탕으로 다음과 테이블을 로컬에 생성한다.

```SQL
CREATE TABLE conversation (
    id UUID PRIMARY KEY,
    title VARCHAR(255),
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE message (
    id UUID PRIMARY KEY,
    conversation_id UUID REFERENCES conversation(id) ON DELETE CASCADE,
    author_role VARCHAR(50),
    content TEXT,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50),
    model_slug VARCHAR(50),
    update_gp BOOLEAN,
    delete_yn BOOLEAN,
    FOREIGN KEY (conversation_id) REFERENCES conversation(id) ON DELETE CASCADE
);

CREATE TABLE message_relationship (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NULL REFERENCES message(id) ON DELETE CASCADE,
    child_id UUID REFERENCES message(id) ON DELETE CASCADE,
    UNIQUE (parent_id, child_id)
);
```

