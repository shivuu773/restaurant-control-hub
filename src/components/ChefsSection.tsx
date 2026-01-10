import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram } from 'lucide-react';
import chef1 from '@/assets/chef-1.jpg';
import chef2 from '@/assets/chef-2.jpg';
import chef3 from '@/assets/chef-3.jpg';
import chef4 from '@/assets/chef-4.jpg';

const chefs = [
  {
    name: 'Rajan Kumar',
    role: 'Executive Chef',
    image: chef1,
    bio: '15 years of culinary excellence',
    socials: { facebook: '#', twitter: '#', instagram: '#' },
  },
  {
    name: 'Priya Sharma',
    role: 'Head Pastry Chef',
    image: chef2,
    bio: 'Specialist in Indian desserts',
    socials: { facebook: '#', twitter: '#', instagram: '#' },
  },
  {
    name: 'Vikram Singh',
    role: 'Sous Chef',
    image: chef3,
    bio: 'Master of North Indian cuisine',
    socials: { facebook: '#', twitter: '#', instagram: '#' },
  },
  {
    name: 'Anita Patel',
    role: 'Dessert Specialist',
    image: chef4,
    bio: 'Award-winning confectioner',
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {chefs.map((chef, index) => (
            <motion.div
              key={chef.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="chef-card group"
            >
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={chef.image}
                  alt={chef.name}
                  className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Overlay with social links */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-24">
                  <div className="flex space-x-3">
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
                <p className="text-primary font-medium">{chef.role}</p>
                <p className="text-sm text-muted-foreground mt-1">{chef.bio}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ChefsSection;
