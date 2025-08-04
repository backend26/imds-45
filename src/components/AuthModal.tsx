import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';
import { User, Mail, Lock, UserPlus, LogIn } from 'lucide-react';

interface AuthModalProps {
  children: React.ReactNode;
}

export function AuthModal({ children }: AuthModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp, signIn } = useAuth();

  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: ''
  });

  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Le password non coincidono');
      setLoading(false);
      return;
    }

    if (signUpData.password.length < 6) {
      setError('La password deve contenere almeno 6 caratteri');
      setLoading(false);
      return;
    }

    const { error } = await signUp(signUpData.email, signUpData.password, signUpData.username);
    
    if (error) {
      if (error.message.includes('already been registered')) {
        setError('Questo email è già registrato. Prova a fare il login.');
      } else {
        setError(error.message);
      }
    } else {
      toast({
        title: "Registrazione completata!",
        description: "Controlla la tua email per confermare l'account.",
      });
      setOpen(false);
      setSignUpData({ email: '', password: '', confirmPassword: '', username: '' });
    }
    
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signIn(signInData.email, signInData.password);
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setError('Credenziali non valide. Controlla email e password.');
      } else {
        setError(error.message);
      }
    } else {
      toast({
        title: "Accesso effettuato!",
        description: "Benvenuto su I Malati dello Sport.",
      });
      setOpen(false);
      setSignInData({ email: '', password: '' });
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md glass-effect border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <User className="h-5 w-5 text-primary" />
            Accedi al tuo Account
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Accedi
            </TabsTrigger>
            <TabsTrigger value="signup" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Registrati
            </TabsTrigger>
          </TabsList>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="mario.rossi@email.com"
                  value={signInData.email}
                  onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                  required
                  className="bg-background/50 backdrop-blur-sm border-border/30"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signin-password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="••••••••"
                  value={signInData.password}
                  onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                  required
                  className="bg-background/50 backdrop-blur-sm border-border/30"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:bg-gradient-hover shadow-lg"
                disabled={loading}
              >
                {loading ? 'Accesso in corso...' : 'Accedi'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-username" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Username
                </Label>
                <Input
                  id="signup-username"
                  type="text"
                  placeholder="mario_rossi"
                  value={signUpData.username}
                  onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                  className="bg-background/50 backdrop-blur-sm border-border/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="mario.rossi@email.com"
                  value={signUpData.email}
                  onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                  required
                  className="bg-background/50 backdrop-blur-sm border-border/30"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={signUpData.password}
                  onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                  required
                  className="bg-background/50 backdrop-blur-sm border-border/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Conferma Password
                </Label>
                <Input
                  id="signup-confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={signUpData.confirmPassword}
                  onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                  required
                  className="bg-background/50 backdrop-blur-sm border-border/30"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:bg-gradient-hover shadow-lg"
                disabled={loading}
              >
                {loading ? 'Registrazione in corso...' : 'Registrati'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}