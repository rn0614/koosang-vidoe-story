import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/shared/lib/supabase/client';
import { Database } from '@/shared/types/database.types';

// 타입 정의
type QuestionTemplateInsert = Database['public']['Tables']['question_templates']['Insert'];

export function useCreateQuestionTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (templateData: QuestionTemplateInsert) => {
      const supabase = createClient();
      const { error } = await supabase
        .from('question_templates')
        .insert([templateData]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionTemplates'] });
    },
  });
}
