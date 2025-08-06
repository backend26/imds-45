import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, Moon, Sun, Menu, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { NotificationSystem } from "@/components/notifications/NotificationSystem";
import { SearchSystem } from "@/components/search/SearchSystem";

const sports = [
  { name: "Prima Pagina", href: "/" },
  { name: "Calcio", href: "/calcio" },
  { name: "Tennis", href: "/tennis" },
  { name: "F1", href: "/f1" },
  { name: "NFL", href: "/nfl" },
  { name: "Basket", href: "/basket" },
];

interface HeaderProps {
  darkMode: boolean;
  toggleTheme: () => void;
}

export const Header = ({ darkMode, toggleTheme }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Prima Pagina");
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "sticky top-0 z-[1000] transition-colors duration-400 ease-in-out backdrop-blur-[16px]",
        isScrolled 
          ? "bg-white/80 dark:bg-zinc-700/50 border-b border-border backdrop-blur-[16px]" 
          : "bg-white/30 dark:bg-zinc-700/20"
      )}
      style={isScrolled ? {
          backgroundColor: darkMode
            ? "rgba(40, 40, 40, 0.4)" 
            : "rgba(255, 255, 255, 0.4)", 
          backdropFilter: "blur(16px) saturate(150%)",
          WebkitBackdropFilter: "blur(16px) saturate(150%)",
          boxShadow: darkMode
            ? "0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(255, 48, 54, 0.1)"
            : "0 8px 32px rgba(255, 255, 255, 0.2), 0 2px 8px rgba(0, 0, 0, 0.05)",
          borderColor: "rgba(255, 255, 255, 0.2)",
        }
      : undefined
  }
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/assets/images/logo-header.png" 
                alt="I Malati dello Sport" 
                className={cn(
                  "h-10 w-auto transition-all duration-300 cursor-pointer hover:scale-105",
                  !isScrolled && "drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                )}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {sports.map((sport) => (
              <Link
                key={sport.name}
                to={sport.href}
              >
                <Button
                  variant={location.pathname === sport.href ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "nav-item-hover transition-all duration-300 relative overflow-hidden group",
                    location.pathname === sport.href 
                      ? "bg-gradient-primary text-white shadow-lg hover:shadow-xl" 
                      : "hover:bg-secondary/50 hover:text-primary hover:scale-105",
                    !isScrolled && "drop-shadow-[0_4px_6px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                  )}
                >
                  <span className="relative z-10 group-hover:translate-x-0.5 transition-transform duration-200">{sport.name}</span>
                  {location.pathname === sport.href && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 animate-pulse" />
                  )}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            <SearchSystem />
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleTheme}
              className={cn(
                "hover:bg-secondary/60 hover:text-primary transition-all duration-200 hover:scale-105",
                "bg-background/50 border border-border/30 backdrop-blur-sm",
                "shadow-lg hover:shadow-xl",
                !isScrolled && "drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
              )}
            >
              {darkMode ? <Sun className="h-4 w-4 icon-shadow" /> : <Moon className="h-4 w-4 icon-shadow" />}
            </Button>

            <NotificationSystem />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "hover:bg-secondary/60 hover:text-primary transition-all duration-200 hover:scale-105",
                      "bg-background/50 border border-border/30 backdrop-blur-sm",
                      "shadow-lg hover:shadow-xl",
                      !isScrolled && "drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                    )}
                  >
                    <User className="h-4 w-4 icon-shadow" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-sm border-border/50">
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      Il Mio Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={async () => {
                      const { error } = await signOut();
                      if (!error) {
                        toast({
                          title: "Logout effettuato",
                          description: "Arrivederci!",
                        });
                      }
                    }}
                    className="text-destructive focus:text-destructive-foreground focus:bg-destructive/90 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/login")}
                className={cn(
                  "hover:bg-secondary/60 hover:text-primary transition-all duration-200 hover:scale-105",
                  "bg-background/50 border border-border/30 backdrop-blur-sm",
                  "shadow-lg hover:shadow-xl",
                  !isScrolled && "drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                )}
              >
                <User className="h-4 w-4 icon-shadow" />
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden hover:bg-secondary/50 hover:text-primary transition-all duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border/50 py-4 animate-slide-up">
            <nav className="flex flex-col space-y-2">
              {sports.map((sport) => (
                <Link
                  key={sport.name}
                  to={sport.href}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button
                    variant={location.pathname === sport.href ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "justify-start transition-all duration-300 w-full",
                      location.pathname === sport.href 
                        ? "bg-gradient-primary text-white shadow-lg" 
                        : "hover:bg-secondary/50 hover:text-primary"
                    )}
                  >
                    {sport.name}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
