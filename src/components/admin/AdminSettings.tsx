import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface SiteSettings {
  // General
  restaurant_name: string;
  tagline: string;
  description: string;
  
  // Hero Section
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
  hero_video_url: string;
  
  // About Section
  about_point_1_title: string;
  about_point_1_text: string;
  about_point_2_title: string;
  about_point_2_text: string;
  about_point_3_title: string;
  about_point_3_text: string;
  
  // Why Us Section
  why_us_title: string;
  why_us_description: string;
  
  // Stats
  stats_clients: string;
  stats_dishes: string;
  stats_hours: string;
  stats_team: string;
  
  // Contact
  address: string;
  phone: string;
  email: string;
  opening_hours: string;
  
  // Social
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
  hero_description: 'May your dining experience be a delightful journey of flavors, where every dish brings you joy.',
  hero_video_url: 'https://www.youtube.com/watch?v=vTA7li3tVV4',
  
  about_point_1_title: 'Culinary Passion',
  about_point_1_text: 'At Zayka Restaurant, our culinary journey is driven by a passion for creating exceptional dining experiences.',
  about_point_2_title: 'Authentic Flavors',
  about_point_2_text: 'We take pride in serving authentic dishes that are a celebration of local and global flavors.',
  about_point_3_title: "Chef's Expertise",
  about_point_3_text: 'Our talented chefs bring years of expertise to the kitchen, crafting each dish with precision and creativity.',
  
  why_us_title: 'Why Choose Zayka?',
  why_us_description: 'The moment I took my first bite, I was transported to culinary heaven. This food is an exquisite symphony of flavors.',
  
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

const AdminSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

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

  const saveSettings = async () => {
    setSaving(true);
    
    try {
      for (const [key, value] of Object.entries(settings)) {
        await supabase
          .from('site_settings')
          .upsert({ key, value }, { onConflict: 'key' });
      }
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    if (confirm('Reset all settings to default?')) {
      setSettings(defaultSettings);
      toast.info('Settings reset to default');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Site Settings</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetSettings}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="whyus">Why Us</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Information</CardTitle>
              <CardDescription>Basic information about your restaurant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="restaurant_name">Restaurant Name</Label>
                <Input
                  id="restaurant_name"
                  value={settings.restaurant_name}
                  onChange={(e) => setSettings({ ...settings, restaurant_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hero" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>The main banner of your website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="hero_title">Title</Label>
                <Input
                  id="hero_title"
                  value={settings.hero_title}
                  onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="hero_subtitle">Highlight Text</Label>
                <Input
                  id="hero_subtitle"
                  value={settings.hero_subtitle}
                  onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="hero_description">Description</Label>
                <Textarea
                  id="hero_description"
                  value={settings.hero_description}
                  onChange={(e) => setSettings({ ...settings, hero_description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="hero_video_url">Video URL</Label>
                <Input
                  id="hero_video_url"
                  value={settings.hero_video_url}
                  onChange={(e) => setSettings({ ...settings, hero_video_url: e.target.value })}
                  placeholder="https://youtube.com/..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>About Section</CardTitle>
              <CardDescription>Information about your restaurant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Point 1</Label>
                <Input
                  placeholder="Title"
                  value={settings.about_point_1_title}
                  onChange={(e) => setSettings({ ...settings, about_point_1_title: e.target.value })}
                />
                <Textarea
                  placeholder="Description"
                  value={settings.about_point_1_text}
                  onChange={(e) => setSettings({ ...settings, about_point_1_text: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Point 2</Label>
                <Input
                  placeholder="Title"
                  value={settings.about_point_2_title}
                  onChange={(e) => setSettings({ ...settings, about_point_2_title: e.target.value })}
                />
                <Textarea
                  placeholder="Description"
                  value={settings.about_point_2_text}
                  onChange={(e) => setSettings({ ...settings, about_point_2_text: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Point 3</Label>
                <Input
                  placeholder="Title"
                  value={settings.about_point_3_title}
                  onChange={(e) => setSettings({ ...settings, about_point_3_title: e.target.value })}
                />
                <Textarea
                  placeholder="Description"
                  value={settings.about_point_3_text}
                  onChange={(e) => setSettings({ ...settings, about_point_3_text: e.target.value })}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whyus" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Why Choose Us Section</CardTitle>
              <CardDescription>Tell visitors why they should choose your restaurant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="why_us_title">Title</Label>
                <Input
                  id="why_us_title"
                  value={settings.why_us_title}
                  onChange={(e) => setSettings({ ...settings, why_us_title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="why_us_description">Description</Label>
                <Textarea
                  id="why_us_description"
                  value={settings.why_us_description}
                  onChange={(e) => setSettings({ ...settings, why_us_description: e.target.value })}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>Numbers that show your success</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stats_clients">Happy Clients</Label>
                  <Input
                    id="stats_clients"
                    type="number"
                    value={settings.stats_clients}
                    onChange={(e) => setSettings({ ...settings, stats_clients: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="stats_dishes">Dishes Served</Label>
                  <Input
                    id="stats_dishes"
                    type="number"
                    value={settings.stats_dishes}
                    onChange={(e) => setSettings({ ...settings, stats_dishes: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="stats_hours">Hours of Support</Label>
                  <Input
                    id="stats_hours"
                    type="number"
                    value={settings.stats_hours}
                    onChange={(e) => setSettings({ ...settings, stats_hours: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="stats_team">Team Members</Label>
                  <Input
                    id="stats_team"
                    type="number"
                    value={settings.stats_team}
                    onChange={(e) => setSettings({ ...settings, stats_team: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>How customers can reach you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="opening_hours">Opening Hours</Label>
                <Input
                  id="opening_hours"
                  value={settings.opening_hours}
                  onChange={(e) => setSettings({ ...settings, opening_hours: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>Connect your social media profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facebook_url">Facebook URL</Label>
                  <Input
                    id="facebook_url"
                    value={settings.facebook_url}
                    onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div>
                  <Label htmlFor="twitter_url">Twitter URL</Label>
                  <Input
                    id="twitter_url"
                    value={settings.twitter_url}
                    onChange={(e) => setSettings({ ...settings, twitter_url: e.target.value })}
                    placeholder="https://twitter.com/..."
                  />
                </div>
                <div>
                  <Label htmlFor="instagram_url">Instagram URL</Label>
                  <Input
                    id="instagram_url"
                    value={settings.instagram_url}
                    onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div>
                  <Label htmlFor="youtube_url">YouTube URL</Label>
                  <Input
                    id="youtube_url"
                    value={settings.youtube_url}
                    onChange={(e) => setSettings({ ...settings, youtube_url: e.target.value })}
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
