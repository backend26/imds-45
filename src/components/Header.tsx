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
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        "backdrop-blur-[24px] backdrop-saturate-[180%]",
        "bg-white/60 dark:bg-zinc-900/50",
        "border-b border-border/40",
        "shadow-[inset_0_0_0_1000px_rgba(255,255,255,0.05)] dark:shadow-[inset_0_0_0_1000px_rgba(0,0,0,0.2)]",
        "[--tw-bg-opacity:0.75]"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img
              src="/assets/images/logo-header.png"
              alt="I Malati dello Sport"
              className="h-10 w-auto drop-shadow-md"
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
                  "nav-item-hover relative overflow-hidden transition-all",
                  activeSection === sport.name
                    ? "bg-gradient-primary text-white"
                    : "hover:bg-secondary/50 hover:text-primary"
                )}
                onClick={() => setActiveSection(sport.name)}
              >
                {sport.name}
              </Button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="hover:scale-105">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline ml-2 text-sm">Cerca...</span>
            </Button>

            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping" />
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="backdrop-blur bg-background/80">
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="flex items-center gap-2">
                      <User className="h-4 w-4" /> Il Mio Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      const { error } = await signOut();
                      if (!error) {
                        toast({ title: "Logout effettuato", description: "Arrivederci!" });
                      }
                    }}
                    className="text-destructive cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}> <User className="h-4 w-4" /> </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 animate-slide-up">
            <nav className="flex flex-col space-y-2">
              {sports.map((sport) => (
                <Button
                  key={sport.name}
                  variant={activeSection === sport.name ? "default" : "ghost"}
                  size="sm"
                  className="justify-start"
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
        )}
      </div>
    </header>
  );
};
