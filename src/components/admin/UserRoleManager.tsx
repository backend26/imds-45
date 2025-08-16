import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { invalidateRoleCache } from '@/hooks/use-role-check-cached';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, UserCheck, UserX, Shield, Edit, FileText } from 'lucide-react';

type UserRole = Database['public']['Enums']['app_role'];

interface User {
  user_id: string;
  username: string;
  display_name: string;
  role: UserRole;
  is_banned: boolean;
  email?: string;
}

const roleIcons = {
  registered_user: UserCheck,
  editor: Edit,
  journalist: FileText,
  administrator: Shield,
};

const roleColors = {
  registered_user: 'bg-blue-100 text-blue-800',
  editor: 'bg-green-100 text-green-800',
  journalist: 'bg-purple-100 text-purple-800',
  administrator: 'bg-red-100 text-red-800',
};

export default function UserRoleManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const searchUsers = async () => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, role, is_banned')
        .or(`username.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`)
        .limit(20);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile cercare gli utenti',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      // Invalidate role cache for this user
      invalidateRoleCache(userId);
      
      setUsers(users.map(user => 
        user.user_id === userId ? { ...user, role: newRole } : user
      ));

      toast({
        title: 'Ruolo aggiornato',
        description: `Ruolo cambiato in ${newRole}`,
      });
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile aggiornare il ruolo',
        variant: 'destructive',
      });
    }
  };

  const toggleUserBan = async (userId: string, currentBanStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: !currentBanStatus })
        .eq('user_id', userId);

      if (error) throw error;

      setUsers(users.map(user => 
        user.user_id === userId ? { ...user, is_banned: !currentBanStatus } : user
      ));

      toast({
        title: currentBanStatus ? 'Utente sbloccato' : 'Utente bannato',
        description: `L'utente è stato ${currentBanStatus ? 'sbloccato' : 'bannato'}`,
      });
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile modificare lo stato dell\'utente',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Gestione Ruoli Utenti
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="search">Cerca utente</Label>
            <Input
              id="search"
              placeholder="Cerca per username o nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
            />
          </div>
          <Button 
            onClick={searchUsers} 
            disabled={isLoading || !searchTerm.trim()}
            className="mt-6"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Role Information */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <Badge className={roleColors.registered_user}>User</Badge>
            <p className="text-xs mt-1">Utente base</p>
          </div>
          <div className="text-center">
            <Badge className={roleColors.editor}>Editor</Badge>
            <p className="text-xs mt-1">Può creare articoli</p>
          </div>
          <div className="text-center">
            <Badge className={roleColors.journalist}>Journalist</Badge>
            <p className="text-xs mt-1">Giornalista</p>
          </div>
          <div className="text-center">
            <Badge className={roleColors.administrator}>Admin</Badge>
            <p className="text-xs mt-1">Tutti i permessi</p>
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {users.map((user) => {
            const RoleIcon = roleIcons[user.role];
            return (
              <div key={user.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <RoleIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{user.display_name}</p>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                  </div>
                  <Badge className={roleColors[user.role]}>{user.role}</Badge>
                  {user.is_banned && (
                    <Badge variant="destructive">Bannato</Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Select 
                    value={user.role} 
                    onValueChange={(value: UserRole) => updateUserRole(user.user_id, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="registered_user">User</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="journalist">Journalist</SelectItem>
                      <SelectItem value="administrator">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant={user.is_banned ? "default" : "destructive"}
                    size="sm"
                    onClick={() => toggleUserBan(user.user_id, user.is_banned)}
                  >
                    {user.is_banned ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {users.length === 0 && searchTerm && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            Nessun utente trovato
          </div>
        )}
      </CardContent>
    </Card>
  );
}