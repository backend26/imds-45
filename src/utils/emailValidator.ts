import { supabase } from '@/integrations/supabase/client';

export const isAllowedEmail = async (email: string): Promise<boolean> => {
  try {
    const domain = email.split('@')[1];
    
    if (!domain) {
      throw new Error('Email format non valido');
    }

    const { data, error } = await supabase
      .from('allowed_email_domains')
      .select('domain')
      .eq('domain', domain.toLowerCase())
      .maybeSingle();
    
    if (error) {
      console.error('Errore validazione email:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Errore validazione email:', error);
    return false;
  }
};

export const getAllowedDomains = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('allowed_email_domains')
      .select('domain')
      .order('domain');
    
    if (error) {
      console.error('Errore recupero domini:', error);
      return [];
    }
    
    return data?.map(item => item.domain) || [];
  } catch (error) {
    console.error('Errore recupero domini:', error);
    return [];
  }
};