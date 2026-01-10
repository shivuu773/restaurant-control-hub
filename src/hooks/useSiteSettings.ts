import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SiteSettings {
  restaurant_name: string;
  tagline: string;
  description: string;
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
  hero_video_url: string;
  about_point_1_title: string;
  about_point_1_text: string;
  about_point_2_title: string;
  about_point_2_text: string;
  about_point_3_title: string;
  about_point_3_text: string;
  why_us_title: string;
  why_us_description: string;
  stats_clients: string;
  stats_dishes: string;
  stats_hours: string;
  stats_team: string;
  address: string;
  phone: string;
  email: string;
  opening_hours: string;
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  youtube_url: string;
}

const defaultSettings: SiteSettings = {
  restaurant_name: 'Zayka',
  tagline: 'Experience the Art of Fine Dining',
  description: 'A premium dining experience with authentic Indian cuisine',
  hero_title: 'Enjoy Your Healthy Delicious Food',
  hero_subtitle: 'Delicious Food',
  hero_description: 'May your dining experience be a delightful journey of flavors, where every dish brings you joy. May your taste buds revel in the exquisite creations and savor the essence of each bite.',
  hero_video_url: 'https://www.youtube.com/watch?v=vTA7li3tVV4',
  about_point_1_title: 'Culinary Passion',
  about_point_1_text: 'At Zayka Restaurant, our culinary journey is driven by a passion for creating exceptional dining experiences.',
  about_point_2_title: 'Authentic Flavors',
  about_point_2_text: 'We take pride in serving authentic dishes that are a celebration of local and global flavors.',
  about_point_3_title: "Chef's Expertise",
  about_point_3_text: 'Our talented chefs bring years of expertise to the kitchen, crafting each dish with precision and creativity.',
  why_us_title: 'Why Choose Zayka?',
  why_us_description: 'The moment I took my first bite, I was transported to culinary heaven. This food is an exquisite symphony of flavors that dance on the taste buds. Each mouthful is a revelation, a testament to the chef\'s artistry.',
  stats_clients: '232',
  stats_dishes: '521',
  stats_hours: '1453',
  stats_team: '32',
  address: '123 Street, New Delhi, India',
  phone: '+91 8090-XXX-X16',
  email: 'info@zayka.com',
  opening_hours: 'Mon-Sat: 11AM - 11PM',
  facebook_url: '',
  twitter_url: '',
  instagram_url: '',
  youtube_url: '',
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('*');
      
      if (data && data.length > 0) {
        const settingsMap: Record<string, any> = {};
        data.forEach(item => {
          settingsMap[item.key] = item.value;
        });
        setSettings({ ...defaultSettings, ...settingsMap });
      }
      setLoading(false);
    };

    loadSettings();
  }, []);

  return { settings, loading };
};
