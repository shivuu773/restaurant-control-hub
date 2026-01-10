import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

// Import fallback dish images
import dishSamosa from '@/assets/dish-samosa.jpg';
import dishButterChicken from '@/assets/dish-butter-chicken.jpg';
import dishBiryani from '@/assets/dish-biryani.jpg';
import dishPalakPaneer from '@/assets/dish-palak-paneer.jpg';
import dishDalMakhani from '@/assets/dish-dal-makhani.jpg';
import dishTandoori from '@/assets/dish-tandoori.jpg';
import dishDosa from '@/assets/dish-dosa.jpg';
import dishGulabJamun from '@/assets/dish-gulab-jamun.jpg';
import dishCholeBhature from '@/assets/dish-chole-bhature.jpg';
import dishPaneerTikka from '@/assets/dish-paneer-tikka.jpg';

interface Category {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  category_id: string | null;
  is_available: boolean | null;
}

const fallbackImages = [dishSamosa, dishButterChicken, dishBiryani, dishPalakPaneer, dishDalMakhani, dishTandoori, dishDosa, dishGulabJamun, dishCholeBhature, dishPaneerTikka];

const defaultCategories = ['Starters', 'Breakfast', 'Lunch', 'Dinner', 'Desserts'];
const defaultMenuItems: Record<string, { name: string; price: number; image: string; description: string }[]> = {
  Starters: [
    { name: 'Vegetable Samosa', price: 180, image: dishSamosa, description: 'Crispy pastry with spiced potato filling' },
    { name: 'Paneer Tikka', price: 320, image: dishPaneerTikka, description: 'Grilled cottage cheese with bell peppers' },
    { name: 'Hara Bhara Kebab', price: 280, image: dishPalakPaneer, description: 'Spinach and green peas patties' },
  ],
  Breakfast: [
    { name: 'Masala Dosa', price: 150, image: dishDosa, description: 'Crispy crepe with potato filling' },
    { name: 'Chole Bhature', price: 180, image: dishCholeBhature, description: 'Spicy chickpeas with fried bread' },
    { name: 'Paneer Paratha', price: 140, image: dishPalakPaneer, description: 'Stuffed flatbread with cottage cheese' },
  ],
  Lunch: [
    { name: 'Veg Biryani', price: 320, image: dishBiryani, description: 'Aromatic rice with mixed vegetables' },
    { name: 'Paneer Butter Masala', price: 350, image: dishPaneerTikka, description: 'Creamy tomato paneer curry' },
    { name: 'Dal Makhani', price: 280, image: dishDalMakhani, description: 'Slow-cooked creamy black lentils' },
  ],
  Dinner: [
    { name: 'Palak Paneer', price: 320, image: dishPalakPaneer, description: 'Cottage cheese in spinach gravy' },
    { name: 'Malai Kofta', price: 360, image: dishPaneerTikka, description: 'Paneer dumplings in creamy gravy' },
    { name: 'Veg Thali', price: 450, image: dishDalMakhani, description: 'Complete meal with variety of dishes' },
  ],
  Desserts: [
    { name: 'Gulab Jamun', price: 120, image: dishGulabJamun, description: 'Sweet milk balls in rose syrup' },
    { name: 'Ras Malai', price: 150, image: dishGulabJamun, description: 'Cottage cheese in sweet cream' },
    { name: 'Kheer', price: 130, image: dishGulabJamun, description: 'Traditional rice pudding' },
  ],
};

const MenuSection = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [useDatabase, setUseDatabase] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [{ data: cats }, { data: items }] = await Promise.all([
        supabase.from('menu_categories').select('*').order('sort_order'),
        supabase.from('menu_items').select('*').eq('is_available', true).order('sort_order'),
      ]);

      if (cats && cats.length > 0 && items && items.length > 0) {
        setCategories(cats);
        setMenuItems(items);
        setActiveCategory(cats[0].id);
        setUseDatabase(true);
      } else {
        setActiveCategory('Starters');
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredItems = useDatabase 
    ? menuItems.filter(item => item.category_id === activeCategory)
    : (defaultMenuItems[activeCategory] || []);

  const displayCategories = useDatabase 
    ? categories 
    : defaultCategories.map((name, i) => ({ id: name, name }));

  if (loading) {
    return (
      <section id="menu" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="menu" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="section-header">
          <h2>Our Menu</h2>
          <p>Check Our <span>Yummy Menu</span></p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12">
          {displayCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                  : 'bg-secondary text-foreground hover:bg-primary/20'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Category Header */}
        <div className="text-center mb-8">
          <p className="text-primary font-medium uppercase tracking-wider text-sm">Menu</p>
          <h3 className="font-heading text-3xl">
            {useDatabase 
              ? categories.find(c => c.id === activeCategory)?.name 
              : activeCategory}
          </h3>
        </div>

        {/* Menu Items Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredItems.map((item: any, index: number) => (
              <motion.div
                key={item.id || item.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="menu-item-card group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={item.image_url || item.image || fallbackImages[index % fallbackImages.length]}
                    alt={item.name}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-heading text-xl">{item.name}</h4>
                    <span className="text-primary text-xl font-bold">₹{item.price}</span>
                  </div>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default MenuSection;
