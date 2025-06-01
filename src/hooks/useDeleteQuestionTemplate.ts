import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';

export function useDeleteQuestionTemplate(companyId?: number | string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number | string) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('question_templates')
        .update({
          deleted_at: new Date().toISOString(),
          delete_yn: true,
        })
        .eq('id', id)
        .neq('delete_yn', true)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      if (companyId) {
        queryClient.invalidateQueries(['questionTemplates', companyId]);
      } else {
        queryClient.invalidateQueries(['questionTemplates']);
      }
    },
  });
}
