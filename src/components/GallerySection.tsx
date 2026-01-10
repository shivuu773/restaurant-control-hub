import { motion } from 'framer-motion';
import menu1 from '@/assets/menu-1.jpg';
import menu2 from '@/assets/menu-2.jpg';
import menu3 from '@/assets/menu-3.jpg';
import menu4 from '@/assets/menu-4.jpg';
import menu5 from '@/assets/menu-5.jpg';
import menu6 from '@/assets/menu-6.jpg';
import aboutRestaurant from '@/assets/about-restaurant.jpg';
import heroFood from '@/assets/hero-food.png';

const galleryImages = [
  { src: menu1, title: 'Cheese Fry' },
  { src: menu2, title: 'Spring Rolls' },
  { src: aboutRestaurant, title: 'Restaurant Interior' },
  { src: menu3, title: 'Hakka Noodles' },
  { src: menu4, title: 'Paneer Tikka' },
  { src: heroFood, title: 'Special Thali' },
  { src: menu5, title: 'Chocolate Brownie' },
  { src: menu6, title: 'Crispy Pakoras' },
];

const GallerySection = () => {
  return (
    <section id="gallery" className="py-20 bg-section">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="section-header">
          <h2>Gallery</h2>
          <p>Some Photos From <span>Our Restaurant</span></p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="relative group overflow-hidden rounded-xl cursor-pointer"
            >
              <img
                src={image.src}
                alt={image.title}
                className="w-full h-48 md:h-56 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/40 transition-colors duration-300 flex items-center justify-center">
                <p className="text-foreground font-heading text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                  {image.title}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
