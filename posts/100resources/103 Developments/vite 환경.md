---
title: vite 환경
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: vite 환경설정
tags:
  - 환경설정
  - FRONT/VITE
date: 2025/02/05 01:25:40
last_modified_at: 2025/03/15 00:39:53
---
> Set a goal, make a plan and just do it.
## 개요
vite 환경에서 package.json을 확인해보면 start 명령어가 없다. 
주로 사용하는건 build 혹은 dev를 통해서 확인하고 build 된 프로젝트를 실행하고 싶다면 vite preview 가 권장된다. 이는 CREATE-REACT-APP의 경우 BUILD후 개발서버를 실행하지만 VITE 는 BUILD 없이 실행하는 방식이라서 그렇다.

```json
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "start": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "lint": "eslint .",
    "preview": "vite preview"
  },

```

## PRODUCTION 배포
> production의 배포는 build 된 dist 폴더를 웹 서버에 서빙해서 사용한다. nginx 를 이용하는데 vercel이나 netlify를 이용하면 그냥 dist 파일로 배포가 가능하다.


nodejs서버에서 배포한다면 Express로 웹서버를 만들어서 배포할 수 있다.
보통 nodejs기반으로 실행한다고 하면 pm2로 실행할 수 있다.

```js
// server.js
import express from 'express';
import path from 'path';

const app = express();
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
```


python 환경에선 다음과 같이 직접 fileResponse로 리턴도 가능하다.
```python
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI()

# 1️⃣ React 빌드 폴더를 정적 파일로 서빙
app.mount("/static", StaticFiles(directory="frontend/dist"), name="static")

# 2️⃣ React의 index.html을 기본 페이지로 설정
@app.get("/")
async def serve_react():
    return FileResponse("frontend/dist/index.html")


```