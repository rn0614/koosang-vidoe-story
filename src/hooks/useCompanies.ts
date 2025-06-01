import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';

const fetchCompanies = async () => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('is_active', true)
    .order('name');
  if (error) throw new Error(error.message);
  return data;
};

export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: fetchCompanies,
    staleTime: 1000 * 60 * 5, // 5분 캐싱
  });
}
