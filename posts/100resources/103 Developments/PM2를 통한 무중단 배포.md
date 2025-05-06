---
title: PM2를 통한 무중단 배포
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: pm2를 사용하여 backend와 frontend가 함께있는 환경에서 무중단 배포를 지원해보자
tags:
  - WAS/LIBRARY
date: 2024/09/22 00:00:00
last_modified_at: 2024/09/22 00:00:00
reference: https://inpa.tistory.com/entry/node-%F0%9F%93%9A-PM2-%EB%AA%A8%EB%93%88-%EC%82%AC%EC%9A%A9%EB%B2%95-%ED%81%B4%EB%9F%AC%EC%8A%A4%ED%84%B0-%EB%AC%B4%EC%A4%91%EB%8B%A8-%EC%84%9C%EB%B9%84%EC%8A%A4
---
## 개요
배포를 처음하는 인원은 `maven install`, `npm run start`등 실제 어플리케이션 실행 이후에 log가 뜨는 것만 보고 하나의 서버에는 하나만 실행하는 경험을 했을 것이다. 이것을 동시에 배포하면서 프로세스를 전반적으로 관리하기 위해서 pm2 라이브러리를 사용한다. 

pm2는 nodejs기반 프로세스 매니저이다. 이 라이브러리를 통해서 무중단 배포를 할 수 있다. 하는 방법에 대해서 알아보자. 
1. 보통 설정하는데는 ecosystem.js과 같이 사용
2. 무중단 배포 혹은 multi-process 환경에서 각각의 process의 메모리를 공유하기 위해서 redis를 사용

## 코드
### ecosystem 에서 어떤 스크립트를 실행할지 세팅
```js
// ecosystem.config.js 에서 cluster mode를 사용하기 위해서 아래 설정 사용
module.exports ={
  apps:[{
    script  :"app.js",
    instances: "max",
    exec_mode :"cluster"
  }]
}
```


```js
// pm2에서 node.js로 명령어 실행시키는 방법
pm2 start app.js
```


```js
// ecosystem으로 application 구성을 조정하는 방법
// ecosystem.config.js

module.exports = {
  apps : [{
    name: 'myapp',
    script: '/home/user/myapp/app.js',
    watch: true,
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
```


스크립트를 지정하여 실행하는 방법 즉 pm2는 단순 nodejs 기반으로 js를 실행시켜주고 상태를 관리한다. 실행시키는 js 로 ecosystem이 내부에 exports 모듈에서 실행할 명령어에 대한 정보를 갖고 있음,

```js
// ./front 에서 npm start NextApp 을 하는 방법  -- NODE_ENV 는 node 사용환경에서만 영향
// 아래 명령어를 실행하면 현재 위치에서 다음과 같은 명령어를 실행함
// cd ./front
// npm start NextApp
// cd ./spring-back
// java -jar spring-back-0.0.1-SNAPSHOT.jar
module.exports = {
  apps : [
    {
      name: 'NextApp',
      script: 'npm',
      args: 'start',
      cwd: './front',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'SpringBootApp',
      script: 'java',
      args: '-jar spring-back/target/spring-back-0.0.1-SNAPSHOT.jar',
      cwd: './spring-back',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```


### Maven 명령어를 실행하기 위해서는
```shell
# pm2는 직접적으로 빌드 프로세스 명령어를 실행 불가 예를들어 mvn clean install 이 불가능함.

#따라서 실행파일 (~.sh) 를 만들어서 실행하도록 명령해야함
#또 해당 과정에서 해당 스크립트가 권한을 가지고 있도록 하기 위해서는 권한 부여 필요
chmod +x spring-back/~.sh
#이후에 해당 스크립트를 싱행하도록 ecosystem.config.js 설정

#~.sh 파일
#!/bin/bash
# navigate to the spring-back directory
cd "$(dirname "$0")"

# Run maven clean and install
mvn clean install

# Navigate to target directory and run the jar file with production profile
cd target
java -jar -Dspring.profiles.active=prod spring-back-0.0.1-SNAPSHOT.jar

```


### 실행스크립트
사전에 실행해야할 명령어를 미리 짜둠으로서 순차적으로 실행
```js
// ecosystem.config.js
module.exports = {
  apps : [
    {
      name: "NextApp",
      script: "npm",
      args: "start",
      cwd: "./front",
      env: {
        NODE_ENV: "production"
      },
      env_development: {
        NODE_ENV: "development"
      }
    },
    {
      name: "SpringBootApp",
      script: "./spring-back/run-app.sh",
      exec_mode: "fork"
    }
  ]
};
```

### ecosystem.config.js 실행명령어
```shell
pm2 start ecosystem.config.js

# 여기서 아래의 옵션을 사용하여 실행시킬 application 선택 혹은 환경설정이 가능하다.
--only, --env
```


## 자주쓰는 pm2 옵션
```shell
pm2 show      # 현재 실행정보확인
pm2 describe
pm2 monit

pm2 run [어플리케이션명] --watch #프로젝트 변경사항을 감지해서 자동재시작 / 개발시

--i max # 최대 코어 개수로 클러스터링 max 대신 값 입력 가능

--name # 실행되는 process를 구분하기 위한 명칭 지정

--log [log_path] # 저장되는 로그 위치 적용



pm2 delete [어플리케이션명] # application 종료


pm2 install pm2-logrotate # log 자동삭제 라이브러리(넘치면 용량부족으로 서버다운)

pm2 set pm2-logrotate:max_size 10M # 로그 파일 사이즈 제한 default :10M
pm2 set pm2-logrotate:retain 10


```