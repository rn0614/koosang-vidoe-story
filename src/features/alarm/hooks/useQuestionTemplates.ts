import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/shared/lib/supabase/client';

export function useQuestionTemplates(companyId: number | string | undefined) {
  return useQuery({
    queryKey: ['questionTemplates', companyId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('question_templates')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .neq('delete_yn', true)
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!companyId,
  });
}
