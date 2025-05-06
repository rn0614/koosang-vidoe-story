---
title: NginX
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: 웹서버 NginX에 대해서 알아보자
tags:
  - "#문제해결"
  - "#WAS/LIBRARY/NGINX"
date: 2024/09/22 00:00:00
last_modified_at: 2024/09/22 00:00:00
---
## 개요
> 웹서버로 리버스 프록시, 로드밸런서, HTTP 캐시등 다양한 기능이 있음.

## 어떤 문제를 해결했나?
1. 작은 프로젝트에 백, 프론트 나눠서 클라우드에 올릴 필요 없다고 생각하여 하나에 올림. 이때 두개의 서버가 하나의 클라우드로 돌아가니 당연히 주소가 다름. 하지만 동일 주소처럼 적용해야함. 이때 NginX를 적용해서 로드밸런서 역할로 설치함. (front: 3000, back 4000 이용)
2. 포트번호를 입력해야만 접근 가능한 문제


## 문제해결 과정
### 1.첫번째 문제
#### 1. nginX 설치 및 재가동
```
//Nginx 설치
sudo apt install nginx

//Nginx 재기동
sudo service nginx restart
or
sudo nginx -s reload
```


#### 2.Nginx 설정 변경 위치
```
/etc/nginx/site-available 에서 nginx 설정이 있음.


sudo vim /etc/nginx/sites-available/default
```


#### 3.Nginx 내부 설정 관련
```
// listen : 모든 http 트래픽 수신 여부 ok
// server_name : 받는 도메인 명
// location / : 모든 주소에 대해서 localhost:3000으로 수신받음
server {
    listen 80;  # 모든 HTTP 트래픽을 수신
    server_name spring.koosang-project.com;  # 사용 중인 도메인

    location / {
        # Next.js 애플리케이션 포워딩 (Frontend)
        proxy_pass http://localhost:3000;  # Next.js가 실행 중인 포트
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        # Spring Boot 애플리케이션 포워딩 (Backend)
        proxy_pass http://localhost:4000;  # Spring Boot가 실행 중인 포트
        proxy_http_version 1.1;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $server_name;
    }
}

```


#### 4.SSL/TLS 인증서 설치
```
//HTTPS 설정
sudo apt install cerbot python3-cerbot-nginx
sudo cerbot --nginx -d spring.koosang-project.com
```



#### 5. 운영과정에서 nginX 재기동
```shell
# nginx 재시작
sudo systemctl reload nginx

# nginx 시작
sudo systemctl start nginx

# nginx service 확인
sudo systemctl status nginx.service
```


### 2. FRONT 접근시 PORT번호 명시화 해야하는 문제
#### 문제
포트번호 없이(http: 80) 접근 시 nginx welcom 페이지만 호출되었다

#### 원인 및 해결
문제는 default 로 설정한 nginx 파일이 가져간 것이다. 해당 default 파일을 삭제하여 내가 작성한 site-enable을 우선으로 만들었다.
>nginX 에서 설정파일 중(sites-enabled안에서) 같은 서버를 proxy 하는 경우 sites-enable에 이름상 가장 위에 있는 설정먼저 본다.
>(내가 작성한 파일명은 koosang-project라 default에 밀렸다)
>따라서 우선순위를 정하고 싶으면 앞에 숫자식으로 저장하는게 도움이 된다.


/etc/nginx/sites-enable/default 에서 다른 nginx 로 proxy를 낚아 채는 부분이 있었다.

깔끔하게 default를 삭제하고 다시 실행했다.
```shell
sudo cp /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.bak #백업생성
sudo rm /etc/nginx/sites-enabled/default  # 삭제
sudo nginx -t # 구성 테스트 
sudo systemctl reload nginx # 변경사항 적용
```

