import { Separator } from "@/components/ui/separator";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  const quickLinks = [
    { name: "Chi Siamo", href: "#" },
    { name: "Contatti", href: "#" },
    { name: "Privacy Policy", href: "#" },
    { name: "Termini di Servizio", href: "#" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="glass-effect mt-16 py-12 border-t border-border/50">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img src="/assets/images/logo-malati-dello-sport.png" alt="I Malati dello Sport" className="h-12 w-auto" />
            </div>
            <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
              La piattaforma definitiva per gli appassionati di sport. Notizie, analisi e commenti 
              da tutto il mondo sportivo, con la qualità editoriale che meriti.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Link Rapidi</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-semibold mb-4">Seguici</h3>
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 bg-secondary rounded-lg flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all duration-200 hover:scale-110"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            © 2024 I Malati dello Sport. Tutti i diritti riservati.
          </p>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Made by Frens</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };