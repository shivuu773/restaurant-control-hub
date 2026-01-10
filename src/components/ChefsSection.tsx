import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram } from 'lucide-react';
import chef1 from '@/assets/chef-1.jpg';
import chef2 from '@/assets/chef-2.jpg';

const chefs = [
  {
    name: 'Rajan Kumar',
    role: 'Master Chef',
    image: chef1,
    socials: { facebook: '#', twitter: '#', instagram: '#' },
  },
  {
    name: 'Priya Sharma',
    role: 'Pastry Chef',
    image: chef2,
    socials: { facebook: '#', twitter: '#', instagram: '#' },
  },
];

const ChefsSection = () => {
  return (
    <section id="chefs" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="section-header">
          <h2>Chefs</h2>
          <p>Our <span>Professional Chefs</span></p>
        </div>

        {/* Chefs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {chefs.map((chef, index) => (
            <motion.div
              key={chef.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="chef-card"
            >
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={chef.image}
                  alt={chef.name}
                  className="w-full h-80 object-cover"
                />
                
                {/* Overlay with social links */}
                <div className="overlay flex items-end justify-center pb-20">
                  <div className="flex space-x-4">
                    <a
                      href={chef.socials.facebook}
                      className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Facebook className="h-5 w-5 text-primary-foreground" />
                    </a>
                    <a
                      href={chef.socials.twitter}
                      className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Twitter className="h-5 w-5 text-primary-foreground" />
                    </a>
                    <a
                      href={chef.socials.instagram}
                      className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Instagram className="h-5 w-5 text-primary-foreground" />
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-4">
                <h4 className="font-heading text-xl font-bold">{chef.name}</h4>
                <p className="text-primary italic">{chef.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ChefsSection;
