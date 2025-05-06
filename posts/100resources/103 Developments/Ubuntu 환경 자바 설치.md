---
title: Ubuntu 환경 자바 설치
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: ubuntu 환경에서 jdk17설치 및 maven 동작 설정
tags:
  - WAS/AWS/EC2
  - "#LINUX"
date: 2024/09/22 00:00:00
last_modified_at: 2024/09/22 00:00:00
---
## 개요
AWS EC2(ubuntu) 환경에서 jdk17, maven으로 springboot 환경세팅을 해보자
기본적으로 몇가지 linux 용어를 사용하는데 
`sudo` : 관리자 레벨에서 실행하는 명령어이다 남용하면 안되는 명령어지만 환경세팅과정에서는 필연적으로 관린자 권한으로 설치가 진행된다.
`apt` : ubuntu 환경에서 기본적으로 가지고 있는 package Manager 이다.

apt로 설치할 라이브러리는 4개이다.
- openjdk-17-jdk
- maven
- nodejs
- git

npm으로 설치할 라이브러리는 2개이다.
- pm2 #process_manager
- nginX
- 
## 세팅 코드
### java/maven 세팅과정
```shell
# 우분투 체계에서는 apt가 기본으로 세팅되어 있음
# 패키지 목록 업데이트
sudo apt update 

# 자바, 메이븐 설치
sudo apt install openjdk-17-jdk
sudo apt install maven -y

# node js 설치 / 옛버전 설치, update
# (옛버전) curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash - # node 설치
sudo apt install -y nodejs

curl -L https://www.npmjs.com/install.sh | sudo bash -         
sudo apt update

# git 설치
sudo apt install git -y

```


### git 실행과정
```shell
# git repo에서 불러오기
git clone [내 프로젝트 github 주소]

# backend project로 이동 (내 프로젝트는 monorepo 구조: backend-project, frontend-project)
cd backend-project

# maven 빌드 (clean : 이전에 생성한 내용 삭제 / install: 빌드하여 jar)
mvn clean install
```

### front 프로젝트와 같이실행
[PM2를 통한 무중단 배포](posts/100-Resources/103%20Developments/PM2를%20통한%20무중단%20배포.md)

```shell
# pm2 설치 (pm2: process manager / 백그라운드에서 실행되는 프로세스를 관리)
sudo npm install pm2 -g

# nginx 설치 (웹 서버)
sudo apt install nginx
```