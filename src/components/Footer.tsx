import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const Footer = () => {
  const { settings } = useSiteSettings();

  const socialLinks = [
    { icon: Facebook, url: settings.facebook_url },
    { icon: Twitter, url: settings.twitter_url },
    { icon: Instagram, url: settings.instagram_url },
    { icon: Youtube, url: settings.youtube_url },
  ].filter(link => link.url);

  return (
    <footer className="py-12 bg-background border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h2 className="font-display text-4xl font-bold mb-2">{settings.restaurant_name.toLowerCase()}<span className="text-primary">.</span></h2>
            <p className="text-muted-foreground">{settings.tagline}</p>
          </div>
          <div className="flex space-x-4">
            {socialLinks.length > 0 ? (
              socialLinks.map((link, i) => (
                <a 
                  key={i} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <link.icon className="h-5 w-5" />
                </a>
              ))
            ) : (
              [Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <span key={i} className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center opacity-50">
                  <Icon className="h-5 w-5" />
                </span>
              ))
            )}
          </div>
        </div>
        <div className="text-center mt-8 pt-8 border-t border-border text-muted-foreground text-sm">
          © {new Date().getFullYear()} {settings.restaurant_name} Restaurant. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
