import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/shared/lib/supabase/client';

export function useCreateQuestionTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (templateData) => {
      const supabase = createClient();
      const { error } = await supabase
        .from('question_templates')
        .insert([templateData]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['questionTemplates']);
    },
  });
}
