---
title: EC2 램 부족현상
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: EC2 램 부족현상
tags:
  - 문제해결
  - WAS/AWS
  - WAS/AWS/EC2
date: 2024/09/22 00:00:00
last_modified_at: 2024/09/22 00:00:00
---
## EC2 램 부족현상

## 어떤 문제를 해결했나?
> 내 프리티어 EC2가 빌드하다가 갑자기 멈춰서 죽는 현상이 발생했다.(three.js 모듈을 빌드하기 시작하면서...) 원인을 알아보니 ram 부족현상으로 빌드과정에서 뻗는 것을 알았다. 요금제를 올리기엔 돈을 쓰기 싫으니 hw 일부를 스왑공간으로 만들어서 렘을 대체하기로 하였다.
> 방법은 아래 코드를 실행하면 된다.


```shell
#rem 용량 확인
free

# swap 파일 생성
# aws에서는 count=32로 예제가 써있는데 절반인 16을 적은 이유는 권장 크기가 2GB이기 때문이다 
sudo dd if=/dev/zero of=/swapfile bs=128M count=16

# 권한 설정
sudo chmod 600 /swapfile

# Linux 스왑 영역을 설정
sudo mkswap /swapfile

# 스왑 공간에 스왑 파일을 추가하여 스왑 파일을 즉시 사용 가능하게 설정
sudo swapon /swapfile

# 프로시저가 성공적인지 확인
sudo swapon -s

# **/etc/fstab** 파일을 편집하여 부팅 시 스왑 파일을 시작
sudo vim /etc/fstab

# 다음문구를 fstab 마지막에 추가
/swapfile swap swap defaults 0 0

```


참고 : https://repost.aws/ko/knowledge-center/ec2-memory-swap-file