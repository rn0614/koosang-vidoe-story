---
title: 이전 commit 정보 수집하기
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: -commit--
thumnail: 
tags:
  - GIT
  - 형상관리
  - 문제해결
date: 2025/02/22 23:57:36
last_modified_at: 2025/02/23 00:25:40
---
## 문제상황
> 이전 커밋과 현재 커밋과 비교해서 바뀐 파일명 추출이 필요함. github action 동작시 이전 HEAD~1을 못가져오는 상황


github action 중에 로직을 js 로 실행하고 싶을 때가 있다. 그럴 땐 아래와 같이 github action에서 실행시켜줄 js를 포함시켜 줄 수 있다. steps 의 run부분은 github 실행환경으로 설정한 ubuntu와 동일하기 때문에 npm으로 라이브러리를 받고 js를 node로 실행시킬 수 있다.

```yml
jobs:
  build:
    steps:
      - name: Install gray-matter (for front matter parsing)
        run: npm install gray-matter dayjs  # 실행시킬 library는 미리 npm 으로 받는다.
        
      - name: Update front matter
        run: node scripts/update-frontmatter.js  # 실행시킬 js 를 명령어으로 직접 호출
```


실행할 js 에서 bash 에서 쓰는 데이터를 가져오기 위해서 child_process 를 사용해서 내부 명령어를 shell에서 접근한 내용을 가져온다.
`execSync` : 문자열 형태로 명령어를 실행하고 결과를 콜백으로 가져옴.

```js
const childProcess = require('child_process');

// url 인코딩하지 않고 그대로 사용하기 위해서 -c core.quotepath=false를 사용하였다.
const diffOutput = childProcess.execSync(
  'git -c core.quotepath=false diff --name-only HEAD~1 HEAD',
  { encoding: 'utf8' }
);

```


## 오류상황
`fatal: ambiguous argument 'HEAD~1': unknown revision or path not in the working tree.`

원래 나는 `git diff --name-only HEAD~1 HEAD` 명칭을 이렇게 사용했다. 그 결과 뽑히긴 했으나 한들이 인코딩 상태( 예 `/123/512`) 식으로 출력이됐고 제대로 파일을 찾아서 매칭하지 못했다. 이 인코딩을 한글명칭을 뽑기 위해서 `-c core.quotepath=false` 를 통해서 인코딩하는 것을 껐다.

#추가수정필요