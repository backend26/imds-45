// TODO: Implementare whitelist email quando le tabelle saranno create
// import { supabase } from '@/integrations/supabase/client';

// Domini consentiti temporanei (da sostituire con database)
const ALLOWED_DOMAINS = [
  'gmail.com',
  'yahoo.com', 
  'outlook.com',
  'hotmail.com',
  'libero.it',
  'alice.it',
  'virgilio.it',
  'tiscali.it'
];

export const isAllowedEmail = async (email: string): Promise<boolean> => {
  try {
    const domain = email.split('@')[1];
    
    if (!domain) {
      throw new Error('Email format non valido');
    }

    // TODO: Sostituire con query al database
    // const { data, error } = await supabase
    //   .from('allowed_email_domains')
    //   .select('domain')
    //   .eq('domain', domain)
    //   .eq('is_active', true);
    
    // Simulazione controllo whitelist
    return ALLOWED_DOMAINS.includes(domain.toLowerCase());
  } catch (error) {
    console.error('Errore validazione email:', error);
    return false;
  }
};

export const getAllowedDomains = async () => {
  try {
    // TODO: Sostituire con query al database
    // const { data, error } = await supabase
    //   .from('allowed_email_domains')
    //   .select('domain')
    //   .eq('is_active', true)
    //   .order('domain');
    
    return ALLOWED_DOMAINS;
  } catch (error) {
    console.error('Errore recupero domini:', error);
    return [];
  }
};