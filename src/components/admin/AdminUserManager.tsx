import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, UserCheck, UserX, Shield, Edit, FileText, Eye, Mail, Calendar, MapPin, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';
import { invalidateRoleCache } from '@/hooks/use-role-check-cached';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

type UserRole = Database['public']['Enums']['app_role'];

interface UserProfile {
  user_id: string;
  username: string;
  display_name: string;
  role: UserRole;
  is_banned: boolean;
  created_at: string;
  last_login?: string;
  login_count?: number;
  bio?: string;
  location?: string;
  profile_picture_url?: string;
  preferred_sports?: string[];
}

const roleIcons = {
  registered_user: UserCheck,
  editor: Edit,
  journalist: FileText,
  administrator: Shield,
};

const roleColors = {
  registered_user: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  editor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  journalist: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  administrator: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export const AdminUserManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filterRole, setFilterRole] = useState<'all' | UserRole>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'banned'>('all');
  
  const { toast } = useToast();

  const searchUsers = async () => {
    if (!searchTerm.trim() && filterRole === 'all' && filterStatus === 'all') return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select(`
          user_id, 
          username, 
          display_name, 
          role, 
          is_banned, 
          created_at, 
          last_login, 
          login_count,
          bio,
          location,
          profile_picture_url,
          preferred_sports
        `)
        .limit(50);

      // Apply search filter
      if (searchTerm.trim()) {
        query = query.or(`username.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`);
      }

      // Apply role filter
      if (filterRole !== 'all') {
        query = query.eq('role', filterRole);
      }

      // Apply status filter
      if (filterStatus === 'active') {
        query = query.eq('is_banned', false);
      } else if (filterStatus === 'banned') {
        query = query.eq('is_banned', true);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile cercare gli utenti',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load all users initially
  useEffect(() => {
    setSearchTerm('');
    searchUsers();
  }, [filterRole, filterStatus]);

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      invalidateRoleCache(userId);
      
      setUsers(users.map(user => 
        user.user_id === userId ? { ...user, role: newRole } : user
      ));

      if (selectedUser?.user_id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }

      toast({
        title: 'Ruolo aggiornato',
        description: `Ruolo cambiato in ${newRole}`,
      });
    } catch (error) {
      console.error('Error updating role:', error);
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

      if (selectedUser?.user_id === userId) {
        setSelectedUser({ ...selectedUser, is_banned: !currentBanStatus });
      }

      toast({
        title: currentBanStatus ? 'Utente sbloccato' : 'Utente bannato',
        description: `L'utente è stato ${currentBanStatus ? 'sbloccato' : 'bannato'}`,
      });
    } catch (error) {
      console.error('Error toggling ban:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile modificare lo stato dell\'utente',
        variant: 'destructive',
      });
    }
  };

  const handleViewDetails = (user: UserProfile) => {
    setSelectedUser(user);
    setDetailsOpen(true);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Gestione Utenti
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search and Filters */}
        <div className="space-y-4">
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
              disabled={isLoading}
              className="mt-6"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-4">
            <div className="space-y-2">
              <Label>Ruolo</Label>
              <Select value={filterRole} onValueChange={(value) => setFilterRole(value as typeof filterRole)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i ruoli</SelectItem>
                  <SelectItem value="registered_user">User</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="journalist">Journalist</SelectItem>
                  <SelectItem value="administrator">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Stato</Label>
              <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as typeof filterStatus)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti</SelectItem>
                  <SelectItem value="active">Attivi</SelectItem>
                  <SelectItem value="banned">Bannati</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
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
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : users.length > 0 ? (
            users.map((user) => {
              const RoleIcon = roleIcons[user.role];
              return (
                <div key={user.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <RoleIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{user.display_name}</p>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                      <p className="text-xs text-muted-foreground">
                        Registrato: {format(new Date(user.created_at), 'dd MMM yyyy', { locale: it })}
                      </p>
                    </div>
                    <Badge className={roleColors[user.role]}>{user.role}</Badge>
                    {user.is_banned && (
                      <Badge variant="destructive">Bannato</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(user)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
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
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant={user.is_banned ? "default" : "destructive"}
                          size="sm"
                        >
                          {user.is_banned ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {user.is_banned ? 'Sbloccare utente?' : 'Bannare utente?'}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {user.is_banned 
                              ? `Vuoi sbloccare l'utente ${user.display_name}? Potrà tornare ad accedere alla piattaforma.`
                              : `Vuoi bannare l'utente ${user.display_name}? Non potrà più accedere alla piattaforma.`
                            }
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => toggleUserBan(user.user_id, user.is_banned)}
                          >
                            {user.is_banned ? 'Sblocca' : 'Banna'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || filterRole !== 'all' || filterStatus !== 'all' 
                ? 'Nessun utente trovato con i filtri applicati'
                : 'Nessun utente trovato'
              }
            </div>
          )}
        </div>

        {/* User Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Dettagli Utente</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  {selectedUser.profile_picture_url && (
                    <img 
                      src={selectedUser.profile_picture_url} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{selectedUser.display_name}</h3>
                    <p className="text-muted-foreground">@{selectedUser.username}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={roleColors[selectedUser.role]}>{selectedUser.role}</Badge>
                      {selectedUser.is_banned && (
                        <Badge variant="destructive">Bannato</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Registrato:</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      {format(new Date(selectedUser.created_at), 'dd MMMM yyyy', { locale: it })}
                    </p>
                  </div>

                  {selectedUser.last_login && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Ultimo accesso:</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        {format(new Date(selectedUser.last_login), 'dd MMMM yyyy', { locale: it })}
                      </p>
                    </div>
                  )}

                  {selectedUser.location && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Posizione:</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        {selectedUser.location}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Login totali:</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      {selectedUser.login_count || 0}
                    </p>
                  </div>
                </div>

                {selectedUser.bio && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Bio:</h4>
                    <p className="text-sm text-muted-foreground">{selectedUser.bio}</p>
                  </div>
                )}

                {selectedUser.preferred_sports && selectedUser.preferred_sports.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Sport preferiti:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.preferred_sports.map((sport) => (
                        <Badge key={sport} variant="outline">{sport}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};