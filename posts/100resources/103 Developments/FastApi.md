---
title: FastApi 초기설정
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: fastapi프레임워크에 대한 초기설정 및 routing, 설정, postgreSQL 연결작업
thumnail: 
categories: posts/dev/Back/FastAPI
tags:
  - python
  - Back/FastAPI
date: 2025/02/23 12:20:53
last_modified_at: 2025/02/23 16:11:07
---
> Set a goal, make a plan and just do it.

## 개요
Flask, django에 이은 python web api 라이브러리이다.
대규모의 잦은 요청에도 서비스가 용이한 웹 프레임워크로 성능도 기존 django,flask보다 좋다는 평도 있다. 다만 아직까진 생태계가 형성되지 않은 편이다.

## API 명세서(Swagger)
기본적으로 fastapi 는 Swagger를 내장한다. 따라서 `{root}/docs` 위치로 가면 자동으로 fastAPI 내용을 볼 수 있다.
[SWAGGER관련 포스팅](posts/100-Resources/103%20Developments/SWAGGER.md)


## 코드

### requirements.txt
> python에서 package를 관리하는 방식이다. 가상환경에서 깔아서 사용한다음 해당 가상환경의 리스소를 `pip freeze > requirements.txt` 를 이용해서 내보낼 수 있음.

```txt
annotated-types==0.7.0
anyio==4.8.0
bcrypt==4.0.1
certifi==2025.1.31
cffi==1.17.1
click==8.1.8
colorama==0.4.6
cryptography==44.0.1
distro==1.9.0
ecdsa==0.19.0
exceptiongroup==1.2.2
fastapi==0.115.8
greenlet==3.1.1
h11==0.14.0
httpcore==1.0.7
httpx==0.28.1
idna==3.10
jiter==0.8.2
openai==1.64.0
passlib==1.7.4
psycopg==3.2.5
psycopg-binary==3.2.5
psycopg-pool==3.2.6
pyasn1==0.4.8
pycparser==2.22
pydantic==2.10.6
pydantic-settings==2.8.0
pydantic_core==2.27.2
python-dotenv==1.0.1
python-jose==3.4.0
python-multipart==0.0.20
pytz==2025.1
rsa==4.9
six==1.17.0
sniffio==1.3.1
starlette==0.45.3
tqdm==4.67.1
typing_extensions==4.12.2
tzdata==2025.1
uvicorn==0.34.0
```


### 초기 환경설정
```shell
# 가상화경 만들기
python -m venv .venv

# 가상환경 활성화(window 의 경우는 중간에 Script, mac 은 bin)
.venv\Scripts\activate

# 리스트 저장 (npm과 같이 나중에 이걸로 설치 가능)
pip freeze > requirements.txt

# 수동으로 필수 librrary 설치 내용(일부)
pip install fastapi # fastApi 설치
pip install uvicorn # 만든 웹 실행을 위한 uvicorn
pip install "psycopg[binary, pool]" # postgreSQL 연결을 위한 library 명령어

# 설치된 pip 리스트 보기
pip list

# 실행코드
# 나중에 실행하는 명령어 / reload 옵션은 파일 변경시 리빌드
uvicorn main:app --reload

# 프로덕션 모드
# 아래는 4개의 프로세스 멀티 프로세스를 지원해서 성능이 높음
uvicorn main:app --workers 4

# linux 운영환경에서는 보통 gunicorn 사용
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app

```

### python 코드
main.py에서 사용하는 어플리케이션 `app = FastAPI()`를 통해서 한줄로 모든 웹설정이 된다. `app.get("/")` 부분은 routing하는 부분이다.
여타 인증, 인가부분 및 다른 설정을 추가해야한다라곤 해도 python 으로 빠르게 POC를 진행하는거에 대해서는 상당히 편한 라이브러리란 걸 알 수 있다.
```python
# main.py
from fastapi import FastAPI
from typing import Union
from controller import items  # controller 폴더안에 items 위치

app = FastAPI()

@app.get("/")
def read_root():
    return {"root":"root"}

# main.py 말고 다른 곳에서 동작
app.include_router(items.router)
```


### 일반적인 화면 Routing
main.py 부분이 커지면 따로 router 로 지정하고 외부에서 돌릴 수도 있다.
```python
# /controller/items.py
from typing import Unopn
from fastapi import APIRouter

# 여기에 설정하던지 아니면 main.py include_router에 설정하던지 해야함.
router = APIRouter(
    prefix="/items",
    tags=["items"], # swagger 태그 관련
    reponses={404:{"description": "Not found"}}
)

@router.get("/{item_id}")
def read_item(item_id: int, q: Union[srt, None] = None):
    return {"item_id": item_id, "q": q}
```

### 설정 세팅
> config설정관련해서 config 폴더 내부에서 따로 상수값 설정을 하였다.
```python
# config/config.py

# db연결 DSN(DATA SOURCE NAME)
PGSQL_DSN = "postgresql://user:password@host:port/database"

# connection_pool
PGSQL_POOL_MIN_SIZE = 10
PGSQL_POOL_MAX_SIZE = 30
PGSQL_POOL_MAX_IDLE = 20
PGSQL_POOL_TIMEOUT = 100

```


### DB세팅(postgreSQL 연결작업)
```python
import psycopg
import psycopg_pool
from config import config

pool_default = psycopg_pool.ConnectionPool(
    dns = config.PGSQL_DSN,
    min_size = config.PGSQL_POOL_MIN_SIZE,
    max_size = config.PGSQL_POOL_MAX_SIZE,
    max_idle = config.PGSQL_POOL_MAX_IDLE,
    timeout = config.PGSQL_POOL_TIMEOUT
)

# dao 로 동작함.
async def execute_query(query: str, params: tuple = None):
    results = None
    async with pool_default.connection() as conn:
        async with conn.cursor(row_factory=psycopg.rows.dict_row) as cur:
            try:
                if params is None:
                    await cur.execute(query)
                else:
                    await cur.execute(query, params)
                results = await cur.fetchall()
            except psycopg.OperationalError as err:
                print(f"Error querying: {err}")
            except psycopg.ProgrammingError as err:
                print(f"Database error via psycopg: {err}")
                results = False
            except psycopg.IntegrityError as err:
                print(f"PostgreSQL integrity error via psycopg: {err}")
                results = False
    return results
```


```python
#/model/model.py
from pydantic import BaseModel
class Model():
    name :str
    phone :str
```

## 최종 프로젝트 폴더구조
![최종 fatapi 프로젝트 폴더구조](public/image/Pasted%20image%2020250303194456.png)