import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import chef1 from '@/assets/chef-1.jpg';
import chef2 from '@/assets/chef-2.jpg';
import chef3 from '@/assets/chef-3.jpg';
import chef4 from '@/assets/chef-4.jpg';

interface Chef {
  id: string;
  name: string;
  role: string;
  image_url: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
}

const defaultChefs = [
  { id: '1', name: 'Rajan Kumar', role: 'Executive Chef', image_url: chef1, facebook_url: '#', twitter_url: '#', instagram_url: '#' },
  { id: '2', name: 'Priya Sharma', role: 'Head Pastry Chef', image_url: chef2, facebook_url: '#', twitter_url: '#', instagram_url: '#' },
  { id: '3', name: 'Vikram Singh', role: 'Sous Chef', image_url: chef3, facebook_url: '#', twitter_url: '#', instagram_url: '#' },
  { id: '4', name: 'Anita Patel', role: 'Dessert Specialist', image_url: chef4, facebook_url: '#', twitter_url: '#', instagram_url: '#' },
];

const ChefsSection = () => {
  const [chefs, setChefs] = useState<Chef[]>(defaultChefs);

  useEffect(() => {
    const loadChefs = async () => {
      const { data } = await supabase
        .from('chefs')
        .select('*')
        .order('sort_order');
      
      if (data && data.length > 0) {
        setChefs(data);
      }
    };
    loadChefs();
  }, []);

  return (
    <section id="chefs" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="section-header">
          <h2>Chefs</h2>
          <p>Our <span>Professional Chefs</span></p>
        </div>

        {/* Chefs Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {chefs.map((chef, index) => (
            <motion.div
              key={chef.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="chef-card group"
            >
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={chef.image_url || '/placeholder.svg'}
                  alt={chef.name}
                  className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Overlay with social links */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-24">
                  <div className="flex space-x-3">
                    {chef.facebook_url && (
                      <a
                        href={chef.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <Facebook className="h-5 w-5 text-primary-foreground" />
                      </a>
                    )}
                    {chef.twitter_url && (
                      <a
                        href={chef.twitter_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <Twitter className="h-5 w-5 text-primary-foreground" />
                      </a>
                    )}
                    {chef.instagram_url && (
                      <a
                        href={chef.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <Instagram className="h-5 w-5 text-primary-foreground" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-4">
                <h4 className="font-heading text-xl font-bold">{chef.name}</h4>
                <p className="text-primary font-medium">{chef.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ChefsSection;
