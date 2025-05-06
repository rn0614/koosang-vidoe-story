---
title: WEB HOOK 관련
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: webHook을 이용하여 api trigger 를 사용할 수 있다
thumnail: /image/Pasted%20image%2020250306212148.png
tags:
  - Gitlab
  - WebHooks
  - CICD
date: 2025/03/06 21:18:42
last_modified_at: 2025/03/07 01:51:31
---
## WEBHOOK이란?
> 특정 이벤트(트리거) 시에 외부에 이벤트를 전달하는 gitlab 자체기능, push, issue 등 다양한 이벤트에 대해서 외부로 api를 날릴 수 있다. github action에서는 cicd pipeline으로 구축했지만 gitlab의 경우 자체기능으로 갖고 있다.

## 목표
issue가 발생할 때 issue의 create, update, closed 시 외부로 api를 송신해 보자

## 설정
### 1. webhooks 설정
settings 안에 webhooks에서 설정이 가능하다. 수신받을 url 을 입력하고 아래 trigger를 상황에 맞게 체크하면 끝이다.
![](public/image/Pasted%20image%2020250306212148.png)


### 2. 수신부
테스트 용으로 vercel에서 nextjs boiler plate를 이용했다.
```ts
// app/api/receive-issue/route.js
import { NextResponse } from 'next/server';

// 간단한 메모리 내 저장소 (실제 서비스에서는 데이터베이스 사용 권장)
let receivedIssues:any[] = [];

export async function POST(request:any) {
  // Secret Token 검증 (옵션)
  const gitlabToken = request.headers.get('x-gitlab-token');
  if (process.env.GITLAB_SECRET_TOKEN && gitlabToken !== process.env.GITLAB_SECRET_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // GitLab에서 전송한 JSON 페이로드 파싱
  const payload = await request.json();
  console.log('Received GitLab issue payload:', payload);

  // 수신한 이슈 데이터를 메모리 저장소에 추가 (서버 재시작 시 초기화됨)
  receivedIssues.push(payload);

  return NextResponse.json({ message: 'Issue received successfully' });
}

export async function GET(request:any) {
  // 저장된 이슈 데이터를 반환
  console.log('logging')
  return NextResponse.json({ issues: receivedIssues });
}
```

### 수신 프로젝트의 호출부
```tsx
// app/issues/page.js
'use client';

import useSWR from 'swr';

const fetcher = (url:string) => fetch(url).then(res => res.json());

export default function IssuesPage() {
  const { data, error } = useSWR('/api/receive-issue', fetcher);

  if (error) return <div>이슈 정보를 불러오는데 에러가 발생했습니다.</div>;
  if (!data) return <div>로딩 중...</div>;

  return (
    <div>
      <h1>수신된 이슈 목록</h1>
      {data.issues.length === 0 ? (
        <p>아직 이슈가 수신되지 않았습니다.</p>
      ) : (
        <ul>
          {data.issues.map((issue:any, idx:any) => (
            <li key={idx}>
              <h3>{issue.object_attributes.title}</h3>
              <p>{issue.object_attributes.description}</p>
              <small>이슈 번호: {issue.object_attributes.iid}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```


## 화면
간단한 이슈를 Closes #1 로 1번 이슈를 종료해봤다.
![](public/image/Pasted%20image%2020250307014859.png)


## Response Body 형태
자세한 body의 형태는 아래 document를 참고하면 된다.
https://docs.gitlab.com/user/project/integrations/webhook_events/

### header
X-Gitlab-Event: Issue Hook
### payload
```json
{
  "object_kind": "issue",
  "event_type": "issue",
  "user": {
    "id": 1,
    "name": "Administrator",
    "username": "root",
    "avatar_url": "http://www.gravatar.com/avatar/e64c7d89f26bd1972efa854d13d7dd61?s=40\u0026d=identicon",
    "email": "admin@example.com"
  },
  "project": {
    "id": 1,
    "name":"Gitlab Test",
    "description":"Aut reprehenderit ut est.",
    "web_url":"http://example.com/gitlabhq/gitlab-test",
    "avatar_url":null,
    "git_ssh_url":"git@example.com:gitlabhq/gitlab-test.git",
    "git_http_url":"http://example.com/gitlabhq/gitlab-test.git",
    "namespace":"GitlabHQ",
    "visibility_level":20,
    "path_with_namespace":"gitlabhq/gitlab-test",
    "default_branch":"master",
    "ci_config_path": null,
    "homepage":"http://example.com/gitlabhq/gitlab-test",
    "url":"http://example.com/gitlabhq/gitlab-test.git",
    "ssh_url":"git@example.com:gitlabhq/gitlab-test.git",
    "http_url":"http://example.com/gitlabhq/gitlab-test.git"
  },
  "object_attributes": {
    "id": 301,
    "title": "New API: create/update/delete file",
    "assignee_ids": [51],
    "assignee_id": 51,
    "author_id": 51,
    "project_id": 14,
    "created_at": "2013-12-03T17:15:43Z",
    "updated_at": "2013-12-03T17:15:43Z",
    "updated_by_id": 1,
    "last_edited_at": null,
    "last_edited_by_id": null,
    "relative_position": 0,
    "description": "Create new API for manipulations with repository",
    "milestone_id": null,
    "state_id": 1,
    "confidential": false,
    "discussion_locked": true,
    "due_date": null,
    "moved_to_id": null,
    "duplicated_to_id": null,
    "time_estimate": 0,
    "total_time_spent": 0,
    "time_change": 0,
    "human_total_time_spent": null,
    "human_time_estimate": null,
    "human_time_change": null,
    "weight": null,
    "health_status": "at_risk",
    "type": "Issue",
    "iid": 23,
    "url": "http://example.com/diaspora/issues/23",
    "state": "opened",
    "action": "open",
    "severity": "high",
    "escalation_status": "triggered",
    "escalation_policy": {
      "id": 18,
      "name": "Engineering On-call"
    },
    "labels": [{
        "id": 206,
        "title": "API",
        "color": "#ffffff",
        "project_id": 14,
        "created_at": "2013-12-03T17:15:43Z",
        "updated_at": "2013-12-03T17:15:43Z",
        "template": false,
        "description": "API related issues",
        "type": "ProjectLabel",
        "group_id": 41
      }]
  },
  "repository": {
    "name": "Gitlab Test",
    "url": "http://example.com/gitlabhq/gitlab-test.git",
    "description": "Aut reprehenderit ut est.",
    "homepage": "http://example.com/gitlabhq/gitlab-test"
  },
  "assignees": [{
    "name": "User1",
    "username": "user1",
    "avatar_url": "http://www.gravatar.com/avatar/e64c7d89f26bd1972efa854d13d7dd61?s=40\u0026d=identicon"
  }],
  "assignee": {
    "name": "User1",
    "username": "user1",
    "avatar_url": "http://www.gravatar.com/avatar/e64c7d89f26bd1972efa854d13d7dd61?s=40\u0026d=identicon"
  },
  "labels": [{
    "id": 206,
    "title": "API",
    "color": "#ffffff",
    "project_id": 14,
    "created_at": "2013-12-03T17:15:43Z",
    "updated_at": "2013-12-03T17:15:43Z",
    "template": false,
    "description": "API related issues",
    "type": "ProjectLabel",
    "group_id": 41
  }],
  "changes": {
    "updated_by_id": {
      "previous": null,
      "current": 1
    },
    "updated_at": {
      "previous": "2017-09-15 16:50:55 UTC",
      "current": "2017-09-15 16:52:00 UTC"
    },
    "labels": {
      "previous": [{
        "id": 206,
        "title": "API",
        "color": "#ffffff",
        "project_id": 14,
        "created_at": "2013-12-03T17:15:43Z",
        "updated_at": "2013-12-03T17:15:43Z",
        "template": false,
        "description": "API related issues",
        "type": "ProjectLabel",
        "group_id": 41
      }],
      "current": [{
        "id": 205,
        "title": "Platform",
        "color": "#123123",
        "project_id": 14,
        "created_at": "2013-12-03T17:15:43Z",
        "updated_at": "2013-12-03T17:15:43Z",
        "template": false,
        "description": "Platform related issues",
        "type": "ProjectLabel",
        "group_id": 41
      }]
    }
  }
}
```