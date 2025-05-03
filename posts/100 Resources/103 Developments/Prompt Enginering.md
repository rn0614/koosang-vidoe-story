프롬프트 엔지니어링이란 프롬프트를 잘 쓰는 방식에 대한 방법론이다.

## 어차피 AI 발달하면 더 잘될건데 왜 배우는가?
위와같은 질문을 하는 경우가 많다. 맞을 수도 있다. 미래에 AI가 나와서 알아서 척척한다면 상관없다. 하지만 지금 LLM 모델을 기반으로 나아가고 있는 AI에서는 사람과 AI가 맞닿아 있는 부분이다. 멍청한 질문을 던져도 똑똑하게 대답하는 AI는 나올 수 있지만 애초에 똑똑하게 질문 던지면 더 똑똑한 대답이 나올건데 공부 안할 이유가 없다.


## 구글 PROMPT
lee boonstra 라는 사람이 프롬프트 엔지니어링 기법에 대한 간단한 설명을 했다 이걸 기본으로 한번 얘기를 해보자

## LLM의 기본구조
LLM은 기본적으로 질문을 바탕으로 다음 단어가 어떻게 나올지에 대한 모델임.
프롬프트에 따라서 이전토큰, 학습데이터에 대해서 학습함.

###  내부설정
- output length : 내놓는 답변길이
- sampling controls : 
  - temperature : degree of randomness(창의성관련), 1일수록 창의
  - top-k : 최상위 토큰중 몇개를 가져올건지 적을수록 정확도 높임.
  - top-p : 예측점수 하한제한

보통 0.2 , 0.95, 30 으로 사용함.


one-shot & few-shot PROMPT: 예시의 갯수
- 최적은 3~5 다양하게 

백틱 3개 안에 예시를 넣어주면 잘 인식함
JSON Response:
```
{
    "key":"value"
}
```


system propmpting : 시스템 자체에 넣을 PROMPT

contextual prompting : 참고해야할 배경지식

role prompting : 역할 프롬프트


### Authomatic Chain-of-thought
// 예시에서 사용할 예제는 별로 없을때도 비교적 정확한 답변을 받고 싶을때
```
단계별로 생각해보자 / Let's think step by step
```


하지말아야할 것이 아닌 해야할 것으로 설계할것


// 질의 응답을 나타내는 모델
```
질문사항
A:
```


```
아래 문맥을 고려해서 질문에 답변해 줘. 답변은 짧고 간결하게 해 줘. 답변이 정확하지 않다면, 「확실치 않은 대답」이라고 응답해 줘.

문맥: Teplizumab은 Ortho Pharmaceutical이라는 뉴저지의 제약 회사에서 유래했다. 그곳에서, 과학자들은 OKT3라는 항체의 초기 버전을 만들어 냈다. 원래 쥐에서 유래된 이 분자는 T 세포의 표면에 결합하여 세포를 죽이는 잠재력을 제한할 수 있다. 1986년, 신장 이식 후 장기 거부 반응 예방을 위해 승인되어 인간이 사용할 수 있는 최초의 치료용 항체가 되었다.


질문: OKT3는 어디서 유래했는가?

답변:

```


```
"""
Table TABLE1, columns = [COLA, COL1_B, COL1_C]
Table TABLE2, columns = [COLA, COL2_B, COL2_C]
TABLE1, TABLE2를 INNER JOIN생성해
"""

```

https://www.promptingguide.ai/kr

https://www.youtube.com/watch?v=EZqY_mnHfTI&t=467s