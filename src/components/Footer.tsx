import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => (
  <footer className="py-12 bg-background border-t border-border">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <h2 className="font-display text-4xl font-bold mb-2">zayka<span className="text-primary">.</span></h2>
          <p className="text-muted-foreground">Delicious food, memorable experiences</p>
        </div>
        <div className="flex space-x-4">
          {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
            <a key={i} href="#" className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary transition-colors">
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </div>
      </div>
      <div className="text-center mt-8 pt-8 border-t border-border text-muted-foreground text-sm">
        © {new Date().getFullYear()} Zayka Restaurant. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
