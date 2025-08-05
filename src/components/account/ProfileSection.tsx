import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { User, Calendar, MapPin, Edit, Upload } from "lucide-react";
import { useState } from "react";
import { AvatarEditor } from "./AvatarEditor";

interface StatsProps {
  likes: number;
  comments: number;
  posts: number;
}

const StatsPanel = ({ likes, comments, posts }: StatsProps) => (
  <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-card/30 rounded-lg backdrop-blur-sm">
    <div className="text-center">
      <p className="text-2xl font-bold text-primary">{likes}</p>
      <p className="text-sm text-muted-foreground">Mi piace</p>
    </div>
    <div className="text-center">
      <p className="text-2xl font-bold text-primary">{comments}</p>
      <p className="text-sm text-muted-foreground">Commenti</p>
    </div>
    <div className="text-center">
      <p className="text-2xl font-bold text-primary">{posts}</p>
      <p className="text-sm text-muted-foreground">Articoli</p>
    </div>
  </div>
);

export const ProfileSection = () => {
  const { user } = useAuth();
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);

  if (!user) return null;

  const userInitials = user.user_metadata?.username?.substring(0, 2).toUpperCase() || 
                      user.email?.substring(0, 2).toUpperCase() || 'US';

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-elegant">
      <CardHeader className="text-center pb-4">
        <div className="relative mx-auto">
          <Avatar className="w-24 h-24 mx-auto ring-4 ring-primary/20">
            <AvatarImage 
              src={user.user_metadata?.profile_picture_url} 
              alt="Profile picture" 
            />
            <AvatarFallback className="text-lg font-bold bg-gradient-primary text-white">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <Button
            size="sm"
            className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
            onClick={() => setShowAvatarEditor(true)}
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>
        
        {user.user_metadata?.role === 'admin' && (
          <Badge variant="default" className="mx-auto w-fit mt-2">
            Amministratore
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground">
            {user.user_metadata?.username || 'Utente'}
          </h2>
          <p className="text-muted-foreground text-sm">{user.email}</p>
        </div>

        <div className="space-y-3 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Membro da:</span>
            <span className="font-medium">
              {new Date(user.created_at).toLocaleDateString('it-IT')}
            </span>
          </div>
          
          {user.user_metadata?.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Località:</span>
              <span className="font-medium">{user.user_metadata.location}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Ultimo accesso:</span>
            <span className="font-medium">
              {new Date(user.last_sign_in_at || user.created_at).toLocaleDateString('it-IT')}
            </span>
          </div>
        </div>

        <StatsPanel 
          likes={user.user_metadata?.stats?.likes || 0} 
          comments={user.user_metadata?.stats?.comments || 0} 
          posts={user.user_metadata?.stats?.posts || 0} 
        />

        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={() => {/* TODO: Navigate to edit profile */}}
        >
          <Edit className="h-4 w-4 mr-2" />
          Modifica Profilo
        </Button>
      </CardContent>

      {showAvatarEditor && (
        <AvatarEditor 
          imageUrl={user.user_metadata?.profile_picture_url}
          onClose={() => setShowAvatarEditor(false)}
        />
      )}
    </Card>
  );
};