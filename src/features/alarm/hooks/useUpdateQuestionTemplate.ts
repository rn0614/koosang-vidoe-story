import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/shared/lib/supabase/client';

export function useUpdateQuestionTemplate(companyId?: number | string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: any) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('question_templates')
        .update(payload)
        .eq('id', id)
        .neq('delete_yn', true)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      // companyId가 있으면 해당 회사만, 없으면 전체 무효화
      if (companyId) {
        queryClient.invalidateQueries(['questionTemplates', companyId]);
      } else {
        queryClient.invalidateQueries(['questionTemplates']);
      }
    },
  });
}
