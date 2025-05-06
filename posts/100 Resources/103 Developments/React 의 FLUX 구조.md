---
title: React 의 FLUX 구조
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: React 의 FLUX 구조
tags:
  - 디자인패턴
  - Front/React
date: 2025/01/28 00:00:00
last_modified_at: 2025/01/28 00:00:00
---
## 전통적인 MVC 패턴
> 프로그래밍에서는 VIEW, MODEL , CONTROLLER 로 각자의 역할을 맡아 동작하는 부분을 나눠 객체지향적으로 SOLID 구조를 통해 변화를 유연하게 하고 재사용성을 높이는 패턴이 존재한다. 백엔드에서는 solid 원칙을 통해 로직을 단일책임으로 만들면 MVC 패턴이 유용하여 많이 사용하지만 FRONT 에서는 데이터에 따라서 VIEW가 변하는 방향이 많아 VIEW에 대한 의존성이 높아 로직의 재사용성이 낮다. 그래서 MVVM으로 비즈니스로직을 VIEW MODEL에 흡수시킨 부분이 많다.


## 프론트의 VIEW?
> 프론트는 해당 시스템을 사용하는 사용자와 직접적으로 연관있는 부분이다. 사실상 FE 자체가 VIEW라는 역할을 수행하고 있는것과 다름이 없다. 
> 다만 VIEW 뿐만이 아니라 온갖 이벤트도 발생하고 있고 VIEW와 상관없는 이벤트들도 시스템에 따라서 구현되기도 한다. 이 과정에서 VIEW는 MODEL과 서로 영향을 주게된다. INPUT값에서 시스템 값이 바뀌면 MODEL의 값이 변하기도 하고 반대로 어떤 동작을통해 세팅값이 바뀌면 그 세팅값에 따라서 VIEW도 바뀌어야한다. 서로 상호적인 관계가 되면서 VIEW와 MODEL은 서로 상호작용을 해야한다. 이걸 가운데에 CONTROLLER로 구현하면 VIEW,MODEL 수가 증가함에 따라 CONTROLLER가 비대해지는 문제가 발생한다.


MVVM
> 리액트의 MVVM구조는 화면의 tsx 구조와 커스텀 훅으로 이루어진다고 보면 편하다.
> tsx 표기구조를 view로 보고 커스텀 훅이 vm 역할을 한다. 이를 통해 view 역할을 하는 UI적 요소와 비지니스 로직, 이벤트가 들어있는 부분을 CUSTOM HOOK 으로 만들어 VEIW 모델의 역할을 한다.



### MVVM IN REACT
```tsx
// 전체적으로 view와 viewModel 부분을 통합한 페이지
// page.tsx
import UserView from './UserView';
import UserView from './UserView';
import { useUserViewModel } from './useUserViewModel';

type pageParams  ={
  userID: number
}

export default const MyPage: React.FC = ({userId}: pageParams) => {
  // custom Hook 으로 view Model의 역할을 함. 외부로부터 userId의 이벤트 변경을 받기도 하며 
  // view 단으로 내려갈 user, loading, erorr, refecht 등의 데이터를 세팅함 
  const { user, loading, error, refetch } = useUserViewModel(userId); 

  return (
    <div>
      <!-- custom Hook 에서 연동된 대아터를 UI만은 담당하는 component로 내려줌 -->
      <UserView user={user} loading={loading} error={error} refetch={refetch} />
    </div>
  );
};


// userModel.ts 백단과 소통하는 User 부분을 정의하고 직접적으로 요청해서 받는 부분도 포함함.
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export const fetchUserData = async (userId: number): Promise<User> => {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user data');
  }
  return response.json();
};


// useUserViewModel.ts
// custom Hook으로 비지니스 로직부분과 view단에 그려지는 화면과 연결된 데이터를 가지고 있음
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { User, fetchUserData } from './userModel';

interface UserViewModel {
  user: User | undefined;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useUserViewModel = (userId: number): UserViewModel => {
  const queryClient = useQueryClient();

  const { data: user, isLoading: loading, error, refetch } = useQuery<User, Error>(
    ['user', userId], // Query key
    () => fetchUserData(userId), // Query function (Model 호출)
    {
      enabled: !!userId, // userId가 존재할 때만 실행
    }
  );

  return {
    user,
    loading,
    error: error ? error.message : null,
    refetch,
  };
};

```