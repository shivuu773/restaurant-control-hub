import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { GallerySkeleton } from '@/components/skeletons/GallerySkeleton';
import menu1 from '@/assets/menu-1.jpg';
import menu2 from '@/assets/menu-2.jpg';
import menu3 from '@/assets/menu-3.jpg';
import menu4 from '@/assets/menu-4.jpg';
import menu5 from '@/assets/menu-5.jpg';
import menu6 from '@/assets/menu-6.jpg';
import aboutRestaurant from '@/assets/about-restaurant.jpg';
import heroFood from '@/assets/hero-food.png';

interface GalleryImage {
  id: string;
  image_url: string;
  title: string | null;
}

const defaultImages = [
  { id: '1', image_url: menu1, title: 'Cheese Fry' },
  { id: '2', image_url: menu2, title: 'Spring Rolls' },
  { id: '3', image_url: aboutRestaurant, title: 'Restaurant Interior' },
  { id: '4', image_url: menu3, title: 'Hakka Noodles' },
  { id: '5', image_url: menu4, title: 'Paneer Tikka' },
  { id: '6', image_url: heroFood, title: 'Special Thali' },
  { id: '7', image_url: menu5, title: 'Chocolate Brownie' },
  { id: '8', image_url: menu6, title: 'Crispy Pakoras' },
];

const GallerySection = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      const { data } = await supabase
        .from('gallery_images')
        .select('*')
        .order('sort_order');
      
      if (data && data.length > 0) {
        setImages(data);
      } else {
        setImages(defaultImages);
      }
      setLoading(false);
    };
    loadImages();
  }, []);

  return (
    <section id="gallery" className="py-20 bg-section">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="section-header">
          <h2>Gallery</h2>
          <p>Some Photos From <span>Our Restaurant</span></p>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <GallerySkeleton />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="relative group overflow-hidden rounded-xl cursor-pointer"
              >
                <img
                  src={image.image_url}
                  alt={image.title || 'Gallery image'}
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
        )}
      </div>
    </section>
  );
};

export default GallerySection;
