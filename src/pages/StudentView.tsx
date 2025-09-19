import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LostItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Calendar, MapPin, Clock, Archive, Home, Filter, Grid, List, Star } from 'lucide-react';
import { format } from 'date-fns';

const StudentView = () => {
  const [items, setItems] = useState<LostItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<LostItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, dateFilter]);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('lost_items')
        .select('*')
        .order('created_at', { ascending: false });

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

    if (dateFilter) {
      filtered = filtered.filter(item => {
        const itemDate = format(new Date(item.created_at), 'yyyy-MM-dd');
        return itemDate === dateFilter;
      });
    }

    setFilteredItems(filtered);
  };

  const getItemsByStatus = (status: string) => {
    return filteredItems.filter(item => item.status === status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'collected': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
          <Badge className={`${getStatusColor(item.status)} font-medium`}>
            {item.status}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {item.description}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2">
              <Calendar className="h-4 w-4" />
              {format(new Date(item.created_at), 'MMM dd, yyyy')}
            </CardDescription>
          </div>
        </div>
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

          {item.collected_at && (
            <div className="pt-2 border-t">
              <Badge variant="secondary" className="text-xs">
                Collected on {format(new Date(item.collected_at), 'PPP')}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading lost items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Search className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Lost & Found</h1>
                <p className="text-sm text-muted-foreground">Find your lost items</p>
              </div>
            </div>
            
            <Link to="/">
              <Button variant="outline" size="sm" className="shadow-soft">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <Card className="mb-8 border-0 shadow-soft bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Search & Filter
                </CardTitle>
                <CardDescription>Find items by description, location, or date</CardDescription>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Items</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by description, location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-0 shadow-soft bg-white/50"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Filter by Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="border-0 shadow-soft bg-white/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm shadow-soft border-0">
            <TabsTrigger value="available" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Available ({getItemsByStatus('available').length})
            </TabsTrigger>
            <TabsTrigger value="collected" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              History ({getItemsByStatus('collected').length})
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Archived ({getItemsByStatus('archived').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="mt-6">
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "space-y-4"
            }>
              {getItemsByStatus('available').map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
            {getItemsByStatus('available').length === 0 && (
              <Card className="text-center py-12 border-0 shadow-soft bg-white/80 backdrop-blur-sm">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No available items found</h3>
                <p className="text-muted-foreground">Try adjusting your search filters</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="collected" className="mt-6">
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "space-y-4"
            }>
              {getItemsByStatus('collected').map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
            {getItemsByStatus('collected').length === 0 && (
              <Card className="text-center py-12 border-0 shadow-soft bg-white/80 backdrop-blur-sm">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No collected items found</h3>
                <p className="text-muted-foreground">Items that have been collected will appear here</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="archived" className="mt-6">
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "space-y-4"
            }>
              {getItemsByStatus('archived').map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
            {getItemsByStatus('archived').length === 0 && (
              <Card className="text-center py-12 border-0 shadow-soft bg-white/80 backdrop-blur-sm">
                <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No archived items found</h3>
                <p className="text-muted-foreground">Items older than 1 month are automatically archived</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentView;