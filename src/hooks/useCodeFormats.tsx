import { useQuery } from '@tanstack/react-query'
import { supabase } from '../utils/supabase'

export const useCodeFormats = (language: string, category?: string) => {
  return useQuery({
    queryKey: ['code_formats', language, category],
    queryFn: async () => {
      let query = supabase
        .from('code_formats')
        .select('*')
        .eq('language', language)

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('[Supabase Error]', error)
        throw error
      }
      console.log('[Query Result]', data)
      return data ?? []
    }
  })
}


export const useAllCodeFormats = (language: string) => {
  return useQuery({
    queryKey: ['code_formats', language],
    queryFn: async () => {
      let query = supabase
        .from('code_formats')
        .select('*')
        .eq('language', language)

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('[Supabase Error]', error)
        throw error
      }
      console.log('[Query Result]', data)
      return data ?? []
    }
  })
}