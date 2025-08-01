import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Moon, Sun, Search, Menu, X, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      scrolled 
        ? 'backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-white/20 shadow-2xl' 
        : 'backdrop-blur-md bg-white/60 dark:bg-gray-900/60 border-b border-white/10'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img src="/assets/images/logo-malati-dello-sport.png" alt="I Malati dello Sport" className="h-10 w-auto" />
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
                    ? "bg-gradient-primary text-white shadow-lg hover:shadow-xl" 
                    : "hover:bg-secondary/50 hover:text-primary hover:scale-105"
                )}
                onClick={() => setActiveSection(sport.name)}
              >
                <span className="relative z-10 group-hover:translate-x-0.5 transition-transform duration-200">{sport.name}</span>
                {activeSection === sport.name && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 animate-pulse" />
                )}
              </Button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="hover:bg-secondary/50 hover:text-primary transition-all duration-200 hover:scale-105"
            >
              <Search className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleTheme}
              className="hover:bg-secondary/50 hover:text-primary transition-all duration-200 hover:scale-105"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              className="hover:bg-secondary/50 hover:text-primary transition-all duration-200 hover:scale-105 relative"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              className="hover:bg-secondary/50 hover:text-primary transition-all duration-200 hover:scale-105"
            >
              <User className="h-4 w-4" />
            </Button>

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
                <Button
                  key={sport.name}
                  variant={activeSection === sport.name ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "justify-start transition-all duration-300",
                    activeSection === sport.name 
                      ? "bg-gradient-primary text-white shadow-lg" 
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
        )}
      </div>
    </header>
  );
};