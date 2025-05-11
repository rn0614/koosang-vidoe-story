import { useQuery } from '@tanstack/react-query';
async function fetchDocumentDetail(titleAndId: string): Promise<any> {
  const res = await fetch(`/api/documents/${titleAndId}`);
  const data = await res.json();
  return Array.isArray(data.documents) ? data.documents[0] : data.documents;
}

export function useDocumentDetail(titleAndId: string) {
  const documentQuery = useQuery({
    queryKey: ['document', titleAndId],
    queryFn: () => fetchDocumentDetail(titleAndId),
    enabled: !!titleAndId,
  });

  return {
    document: documentQuery.data,
    loading: documentQuery.isLoading,
    error: documentQuery.error,
  };
}
