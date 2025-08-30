// Node Complete API call
export const nodeApi = {
    // 노드 완료 시 외부 API 호출
    async callCompletionApi(apiConfig: {
      url: string;
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      body?: any;
      authentication?: string;
    }): Promise<void> {
      const { url, method, body, authentication } = apiConfig;
      
      try {
        await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...(authentication ? { Authorization: `Bearer ${authentication}` } : {}),
          },
          ...(method === 'POST' || method === 'PUT' ? { body: JSON.stringify(body) } : {}),
        });
      } catch (error) {
        console.error('Node completion API call failed:', error);
        throw error;
      }
    },
  };