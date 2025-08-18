import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  Key,
  Clock,
  Globe,
  Smartphone
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { TwoFactorAuth } from './TwoFactorAuth';

interface SecurityMetrics {
  overallScore: number;
  passwordStrength: number;
  twoFactorEnabled: boolean;
  recentLogins: number;
  suspiciousActivity: boolean;
  lastPasswordChange: string | null;
  activeSessions: number;
  loginFromNewDevices: number;
}

interface SecurityEvent {
  id: string;
  type: 'login' | 'password_change' | 'suspicious' | '2fa_enabled' | '2fa_disabled';
  description: string;
  timestamp: string;
  ipAddress?: string;
  location?: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export const SecurityDashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTwoFactor, setShowTwoFactor] = useState(false);

  useEffect(() => {
    if (user) {
      loadSecurityData();
    }
  }, [user]);

  const loadSecurityData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Load user profile security data
      const { data: profile } = await supabase
        .from('profiles')
        .select('tfa_enabled, last_username_change, created_at')
        .eq('user_id', user.id)
        .single();

      // Load recent sessions
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Calculate security metrics
      const metrics: SecurityMetrics = {
        overallScore: calculateSecurityScore(profile, sessions),
        passwordStrength: 75, // Simulated - would check actual password strength
        twoFactorEnabled: profile?.tfa_enabled || false,
        recentLogins: sessions?.length || 0,
        suspiciousActivity: checkSuspiciousActivity(sessions),
        lastPasswordChange: profile?.last_username_change || null,
        activeSessions: sessions?.filter(s => 
          new Date(s.last_seen).getTime() > Date.now() - 24 * 60 * 60 * 1000
        ).length || 0,
        loginFromNewDevices: sessions?.filter(s => 
          new Date(s.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
        ).length || 0
      };

      setMetrics(metrics);

      // Generate security events from sessions
      const events: SecurityEvent[] = sessions?.map(session => ({
        id: session.session_id,
        type: 'login' as const,
        description: `Login da ${(session.device_info as any)?.platform || 'dispositivo sconosciuto'}`,
        timestamp: session.created_at,
        ipAddress: session.ip_address?.toString(),
        location: (session.location_info as any)?.city || 'Posizione sconosciuta',
        riskLevel: session.security_score < 50 ? 'high' : session.security_score < 80 ? 'medium' : 'low'
      })) || [];

      setSecurityEvents(events);

    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSecurityScore = (profile: any, sessions: any[]): number => {
    let score = 60; // Base score

    // Two-factor authentication bonus
    if (profile?.tfa_enabled) {
      score += 25;
    }

    // Recent password change bonus
    const lastChange = profile?.last_username_change;
    if (lastChange) {
      const daysSinceChange = (Date.now() - new Date(lastChange).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceChange < 90) score += 10;
    }

    // Session security
    if (sessions && sessions.length > 0) {
      const avgSecurityScore = sessions.reduce((acc, s) => acc + (s.security_score || 70), 0) / sessions.length;
      score += (avgSecurityScore - 70) * 0.2;
    }

    // Suspicious activity penalty
    if (checkSuspiciousActivity(sessions)) {
      score -= 20;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const checkSuspiciousActivity = (sessions: any[]): boolean => {
    if (!sessions || sessions.length === 0) return false;

    // Check for multiple logins from different locations
    const recentSessions = sessions.filter(s => 
      new Date(s.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000
    );

    const uniqueIPs = new Set(recentSessions.map(s => s.ip_address));
    return uniqueIPs.size > 3;
  };

  const revokeSession = async (sessionId: string) => {
    try {
      await supabase
        .from('user_sessions')
        .delete()
        .eq('session_id', sessionId)
        .eq('user_id', user?.id);

      await loadSecurityData();
    } catch (error) {
      console.error('Error revoking session:', error);
    }
  };

  const revokeAllSessions = async () => {
    try {
      await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', user?.id)
        .neq('session_id', 'current'); // Keep current session

      await loadSecurityData();
    } catch (error) {
      console.error('Error revoking all sessions:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 85) return 'Eccellente';
    if (score >= 70) return 'Buono';
    if (score >= 50) return 'Migliorabile';
    return 'Vulnerabile';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Panoramica Sicurezza
            </div>
            {metrics && (
              <Badge 
                variant={metrics.overallScore >= 70 ? "default" : "destructive"}
                className={getScoreColor(metrics.overallScore)}
              >
                {metrics.overallScore}/100 - {getScoreStatus(metrics.overallScore)}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {metrics && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Punteggio Sicurezza</span>
                  <span className={getScoreColor(metrics.overallScore)}>
                    {metrics.overallScore}/100
                  </span>
                </div>
                <Progress value={metrics.overallScore} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Key className="h-3 w-3" />
                      2FA
                    </span>
                    {metrics.twoFactorEnabled ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Globe className="h-3 w-3" />
                      Sessioni attive
                    </span>
                    <Badge variant="outline">{metrics.activeSessions}</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Smartphone className="h-3 w-3" />
                      Nuovi dispositivi
                    </span>
                    <Badge variant={metrics.loginFromNewDevices > 2 ? "destructive" : "outline"}>
                      {metrics.loginFromNewDevices}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Eye className="h-3 w-3" />
                      Attività sospetta
                    </span>
                    {metrics.suspiciousActivity ? (
                      <ShieldAlert className="h-4 w-4 text-red-600" />
                    ) : (
                      <ShieldCheck className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <TwoFactorAuth />

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Eventi Recenti
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={revokeAllSessions}
            >
              Revoca tutte le sessioni
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {securityEvents.length > 0 ? (
              securityEvents.slice(0, 10).map(event => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className={getRiskColor(event.riskLevel)} variant="outline">
                        {event.riskLevel === 'high' ? 'Alto rischio' : 
                         event.riskLevel === 'medium' ? 'Medio rischio' : 'Basso rischio'}
                      </Badge>
                      <span className="text-sm font-medium">{event.description}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString('it-IT')}
                      {event.ipAddress && ` • IP: ${event.ipAddress}`}
                      {event.location && ` • ${event.location}`}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => revokeSession(event.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    Revoca
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nessun evento di sicurezza recente</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      {metrics && metrics.overallScore < 85 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Raccomandazioni di sicurezza:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              {!metrics.twoFactorEnabled && (
                <li>• Attiva l'autenticazione a due fattori per maggiore sicurezza</li>
              )}
              {metrics.activeSessions > 5 && (
                <li>• Revoca le sessioni inattive per ridurre il rischio di accesso non autorizzato</li>
              )}
              {metrics.loginFromNewDevices > 3 && (
                <li>• Monitora i login da nuovi dispositivi</li>
              )}
              {metrics.suspiciousActivity && (
                <li>• Verifica le attività sospette e cambia la password se necessario</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};