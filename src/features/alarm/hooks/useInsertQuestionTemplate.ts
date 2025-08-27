import { useMutation } from '@tanstack/react-query';
import { createClient } from '@/shared/lib/supabase/client';

export function useInsertQuestionTemplate() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('question_templates')
        .insert(payload)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
  });
}
