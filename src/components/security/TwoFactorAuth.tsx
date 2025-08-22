import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, ShieldCheck, ShieldX, QrCode, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface TwoFactorAuthProps {
  className?: string;
}

export const TwoFactorAuth = ({ className }: TwoFactorAuthProps) => {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'setup' | 'verify' | 'backup' | 'enabled'>('setup');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    checkTwoFactorStatus();
  }, [user]);

  const checkTwoFactorStatus = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tfa_enabled')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setIsEnabled(profile.tfa_enabled);
        setStep(profile.tfa_enabled ? 'enabled' : 'setup');
      }
    } catch (error) {
      console.error('Error checking 2FA status:', error);
    }
  };

  const generateTwoFactorSetup = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Generate secret and QR code
      const secret = generateSecret();
      const appName = 'Malati dello Sport';
      const qrCodeUrl = `otpauth://totp/${encodeURIComponent(appName)}:${encodeURIComponent(user.email || '')}?secret=${secret}&issuer=${encodeURIComponent(appName)}`;

      setSecret(secret);
      setQrCodeUrl(qrCodeUrl);
      setStep('verify');

      // Generate QR code image URL (using a service like qr-server.com)
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`;
      setQrCodeUrl(qrImageUrl);

    } catch (error) {
      console.error('Error generating 2FA setup:', error);
      toast({
        title: "Errore",
        description: "Impossibile generare il setup 2FA. Riprova più tardi.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyTwoFactorCode = async () => {
    if (!user || !verificationCode.trim()) return;

    setIsLoading(true);
    try {
      // In a real implementation, you would verify the TOTP code here
      // For now, we'll simulate verification
      const isValidCode = verificationCode.length === 6 && /^\d+$/.test(verificationCode);
      
      if (!isValidCode) {
        throw new Error('Codice non valido');
      }

      // Generate backup codes
      const codes = generateBackupCodes();
      setBackupCodes(codes);

      // Update profile with 2FA enabled and secret
      await supabase
        .from('profiles')
        .update({
          tfa_enabled: true,
          tfa_secret: secret // In production, this should be encrypted
        })
        .eq('user_id', user.id);

      setIsEnabled(true);
      setStep('backup');

      toast({
        title: "2FA Attivato",
        description: "L'autenticazione a due fattori è stata attivata con successo.",
      });

    } catch (error) {
      console.error('Error verifying 2FA code:', error);
      toast({
        title: "Errore",
        description: "Codice di verifica non valido. Riprova.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disableTwoFactor = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      await supabase
        .from('profiles')
        .update({
          tfa_enabled: false,
          tfa_secret: null
        })
        .eq('user_id', user.id);

      setIsEnabled(false);
      setStep('setup');
      setSecret('');
      setQrCodeUrl('');
      setVerificationCode('');
      setBackupCodes([]);

      toast({
        title: "2FA Disattivato",
        description: "L'autenticazione a due fattori è stata disattivata.",
      });

    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast({
        title: "Errore",
        description: "Impossibile disattivare 2FA. Riprova più tardi.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyBackupCode = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      
      toast({
        title: "Copiato",
        description: "Codice di backup copiato negli appunti.",
      });
    } catch (error) {
      console.error('Error copying backup code:', error);
    }
  };

  const generateSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 8; i++) {
      codes.push(
        Math.random().toString(36).substring(2, 8).toUpperCase() + '-' +
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );
    }
    return codes;
  };

  if (!user) return null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Autenticazione a Due Fattori (2FA)
          {isEnabled ? (
            <Badge variant="default" className="ml-2">
              <ShieldCheck className="h-3 w-3 mr-1" />
              Attivo
            </Badge>
          ) : (
            <Badge variant="secondary" className="ml-2">
              <ShieldX className="h-3 w-3 mr-1" />
              Disattivo
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'setup' && (
          <div className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                L'autenticazione a due fattori aggiunge un ulteriore livello di sicurezza al tuo account. 
                Avrai bisogno di un'app come Google Authenticator o Authy.
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={generateTwoFactorSetup}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Configurazione...' : 'Attiva 2FA'}
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-medium mb-2">Scansiona il Codice QR</h3>
              {qrCodeUrl && (
                <div className="flex justify-center mb-4">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code per 2FA" 
                    className="w-48 h-48 border rounded-lg"
                  />
                </div>
              )}
              
              <div className="text-sm text-muted-foreground mb-4">
                <p>Se non riesci a scansionare il QR code, inserisci manualmente questo codice:</p>
                <div className="bg-muted p-2 rounded mt-2 font-mono text-xs break-all">
                  {secret}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Codice di Verifica</label>
              <Input
                type="text"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                className="text-center text-lg tracking-wider"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setStep('setup')}
                className="flex-1"
              >
                Annulla
              </Button>
              <Button 
                onClick={verifyTwoFactorCode}
                disabled={isLoading || verificationCode.length !== 6}
                className="flex-1"
              >
                {isLoading ? 'Verifica...' : 'Verifica'}
              </Button>
            </div>
          </div>
        )}

        {step === 'backup' && (
          <div className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Importante:</strong> Salva questi codici di backup in un posto sicuro. 
                Potrai usarli per accedere al tuo account se perdi il dispositivo 2FA.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center justify-between p-2 bg-muted rounded font-mono text-xs border cursor-pointer hover:bg-muted/80",
                    copiedIndex === index && "bg-green-100 dark:bg-green-900"
                  )}
                  onClick={() => copyBackupCode(code, index)}
                >
                  <span>{code}</span>
                  {copiedIndex === index ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>

            <Button 
              onClick={() => setStep('enabled')}
              className="w-full"
            >
              Ho salvato i codici di backup
            </Button>
          </div>
        )}

        {step === 'enabled' && (
          <div className="space-y-4">
            <Alert>
              <ShieldCheck className="h-4 w-4" />
              <AlertDescription>
                L'autenticazione a due fattori è attiva. Il tuo account è ora più sicuro.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Opzioni</h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => setStep('backup')}
                  className="w-full justify-start"
                >
                  Visualizza codici di backup
                </Button>
                <Button
                  variant="destructive"
                  onClick={disableTwoFactor}
                  disabled={isLoading}
                  className="w-full justify-start"
                >
                  {isLoading ? 'Disattivazione...' : 'Disattiva 2FA'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};