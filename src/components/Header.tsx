import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  Moon,
  Sun,
  Search,
  Menu,
  X,
  Bell,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
  }, [isMenuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-[1000] w-full transition-all duration-300 ease-out",
        "backdrop-blur-[20px] backdrop-saturate-[160%]",
        "glass-effect",
        isScrolled ? "shadow-md border-b border-border/40" : "shadow-none border-transparent"
      )}
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img
              src="/assets/images/logo-header.png"
              alt="I Malati dello Sport"
              className={cn(
                "h-10 w-auto transition-all duration-300",
                !isScrolled && "drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
              )}
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {sports.map((sport) => (
              <Button
                key={sport.name}
                variant={activeSection === sport.name ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "nav-item-hover transition-all duration-300 relative overflow-hidden group",
                  activeSection === sport.name
                    ? "bg-gradient-primary text-white shadow-md"
                    : "hover:bg-secondary/50 hover:text-primary hover:scale-105"
                )}
                onClick={() => setActiveSection(sport.name)}
              >
                <span className="relative z-10 group-hover:translate-x-0.5 transition-transform duration-200">
                  {sport.name}
                </span>
                {activeSection === sport.name && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 animate-pulse" />
                )}
              </Button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="glass-effect hover:scale-105">
              <Search className="h-4 w-4 icon-shadow" />
              <span className="hidden sm:inline text-sm font-medium ml-2">
                Cerca...
              </span>
            </Button>

            <Button variant="ghost" size="sm" onClick={toggleTheme} className="glass-effect hover:scale-105">
              {darkMode ? <Sun className="h-4 w-4 icon-shadow" /> : <Moon className="h-4 w-4 icon-shadow" />}
            </Button>

            <Button variant="ghost" size="sm" className="glass-effect relative hover:scale-105">
              <Bell className="h-4 w-4 icon-shadow" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse shadow-lg" />
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="glass-effect hover:scale-105">
                    <User className="h-4 w-4 icon-shadow" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 bg-background/95 backdrop-blur-sm border-border/50"
                >
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
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="glass-effect hover:scale-105">
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
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[999] bg-background/80 backdrop-blur-xl animate-fade-in">
          <div className="absolute top-16 w-full border-t border-border/40 py-4 animate-slide-up shadow-lg">
            <nav className="flex flex-col space-y-2 px-4">
              {sports.map((sport) => (
                <Button
                  key={sport.name}
                  variant={activeSection === sport.name ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "justify-start transition-all duration-300",
                    activeSection === sport.name
                      ? "bg-gradient-primary text-white shadow"
                      : "hover:bg-secondary/50 hover:text-primary"
                  )}
                  onClick={() => {
                    setActiveSection(sport.name);
                    setIsMenuOpen(false);
                  }}
                >
                  {sport.name}
                </Button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};
