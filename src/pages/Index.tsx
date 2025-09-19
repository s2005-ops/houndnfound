import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LostItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/Navbar';
import { Search, User, BookOpen, Sparkles, Shield, BarChart3, Archive, Clock, MapPin, Calendar, Filter, Grid, List, Star } from 'lucide-react';
import { format } from 'date-fns';

const Index = () => {
  const [items, setItems] = useState<LostItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<LostItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm]);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('lost_items')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location_found.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.collection_location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredItems(filtered);
  };

  const ItemCard = ({ item }: { item: LostItem }) => (
    <Card className="group overflow-hidden border-0 shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
      <div className="relative">
        {item.image_url && (
          <div className="aspect-video w-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
            <img
              src={item.image_url}
              alt={item.description}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        {!item.image_url && (
          <div className="aspect-video w-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        
        <div className="absolute top-3 right-3">
          <Badge className="bg-green-100 text-green-800 border-green-200 font-medium">
            Available
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {item.description}
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {format(new Date(item.created_at), 'MMM dd, yyyy')}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">Found at:</p>
              <p className="text-sm text-muted-foreground">{item.location_found}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Clock className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">Collect from:</p>
              <p className="text-sm text-muted-foreground">{item.collection_location}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="relative px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 gradient-primary rounded-full blur-xl opacity-30"></div>
                <BookOpen className="relative h-20 w-20 text-primary mx-auto" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Lost & Found Portal
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
              A modern, intelligent system designed to reunite students with their belongings quickly and efficiently
            </p>

            {/* Feature Highlights */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Sparkles className="h-4 w-4 mr-2" />
                Smart Search
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Archive className="h-4 w-4 mr-2" />
                Auto-Archive
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Found Items Section */}
      <section className="px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Recently Found Items</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Browse the latest items that have been found and are waiting to be claimed
            </p>
            
            {/* Search Bar */}
            <Card className="max-w-2xl mx-auto border-0 shadow-soft bg-white/80 backdrop-blur-sm mb-8">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by description, location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-0 shadow-soft bg-white/50"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading found items...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>

              {filteredItems.length === 0 && (
                <Card className="text-center py-12 border-0 shadow-soft bg-white/80 backdrop-blur-sm">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No items found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or check back later</p>
                </Card>
              )}

              {filteredItems.length > 0 && (
                <div className="text-center">
                  <Link to="/student">
                    <Button size="lg" className="shadow-lg">
                      <Search className="h-5 w-5 mr-2" />
                      View All Items
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Portal Cards */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Choose Your Portal</h2>
            <p className="text-muted-foreground">
              Access the system based on your role
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Student Portal Card */}
            <Card className="group relative overflow-hidden shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <CardHeader className="relative z-10 text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Search className="h-8 w-8 text-white" />
                </div>
                
                <CardTitle className="text-2xl mb-2">Student Portal</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Find your lost items with our intelligent search system
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Search className="h-4 w-4 mr-3 text-blue-500" />
                    Advanced search & filtering
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-3 text-blue-500" />
                    Real-time item updates
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-3 text-blue-500" />
                    Location-based results
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Archive className="h-4 w-4 mr-3 text-blue-500" />
                    Complete item history
                  </div>
                </div>
                
                <Link to="/student" className="block">
                  <Button size="lg" className="w-full group-hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                    <Search className="h-5 w-5 mr-2" />
                    Browse Lost Items
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Teacher Portal Card */}
            <Card className="group relative overflow-hidden shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <CardHeader className="relative z-10 text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                
                <CardTitle className="text-2xl mb-2">Teacher Portal</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Manage the lost & found system with powerful admin tools
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4 mr-3 text-purple-500" />
                    Add items with photos
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <BarChart3 className="h-4 w-4 mr-3 text-purple-500" />
                    Analytics dashboard
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-3 text-purple-500" />
                    Teacher management
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Archive className="h-4 w-4 mr-3 text-purple-500" />
                    Automated workflows
                  </div>
                </div>
                
                <Link to="/login" className="block">
                  <Button size="lg" variant="outline" className="w-full group-hover:shadow-lg transition-all duration-300 border-purple-200 hover:bg-purple-50 hover:border-purple-300">
                    <Shield className="h-5 w-5 mr-2" />
                    Teacher Access
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Statistics Section */}
          <div className="mt-20 text-center">
            <h3 className="text-2xl font-bold mb-4">Trusted by Schools Everywhere</h3>
            <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
              Our platform helps thousands of students reunite with their belongings every day
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">99%</div>
                <div className="text-sm text-muted-foreground">Recovery Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">24h</div>
                <div className="text-sm text-muted-foreground">Avg. Return Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">1000+</div>
                <div className="text-sm text-muted-foreground">Items Found</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">50+</div>
                <div className="text-sm text-muted-foreground">Schools</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;