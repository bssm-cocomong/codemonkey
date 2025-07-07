import { useQuery } from '@tanstack/react-query'
import { supabase } from '../utils/supabase'

export const useCodeTokens = (language: string) => {
  return useQuery({
    queryKey: ['code_tokens', language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('code_tokens')
        .select('*')
        .eq('language', language)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    }
  })
}