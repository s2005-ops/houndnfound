import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LostItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, MapPin, Clock, Archive } from 'lucide-react';
import { format } from 'date-fns';

const StudentView = () => {
  const [items, setItems] = useState<LostItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<LostItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);

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

  const ItemCard = ({ item }: { item: LostItem }) => (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{item.description}</CardTitle>
          <Badge variant={item.status === 'available' ? 'default' : 
                        item.status === 'collected' ? 'secondary' : 'outline'}>
            {item.status}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {format(new Date(item.created_at), 'PPP')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {item.image_url && (
          <div className="w-full h-48 bg-muted rounded-lg overflow-hidden">
            <img
              src={item.image_url}
              alt={item.description}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Found at:</p>
              <p className="text-sm text-muted-foreground">{item.location_found}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Collect from:</p>
              <p className="text-sm text-muted-foreground">{item.collection_location}</p>
            </div>
          </div>
          {item.collected_at && (
            <div className="flex items-start gap-2">
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading lost items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Search className="h-8 w-8" />
            Lost & Found Portal
          </h1>
          <p className="text-primary-foreground/80 mt-2">
            Search for your lost items or browse recently found items
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search Items</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by description, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
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
            />
          </div>
        </div>

        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="available">
              Available ({getItemsByStatus('available').length})
            </TabsTrigger>
            <TabsTrigger value="collected">
              History ({getItemsByStatus('collected').length})
            </TabsTrigger>
            <TabsTrigger value="archived">
              <Archive className="h-4 w-4 mr-2" />
              Archived ({getItemsByStatus('archived').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getItemsByStatus('available').map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
            {getItemsByStatus('available').length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No available items found</h3>
                <p className="text-muted-foreground">Try adjusting your search filters</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="collected" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getItemsByStatus('collected').map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
            {getItemsByStatus('collected').length === 0 && (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No collected items found</h3>
                <p className="text-muted-foreground">Items that have been collected will appear here</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="archived" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getItemsByStatus('archived').map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
            {getItemsByStatus('archived').length === 0 && (
              <div className="text-center py-12">
                <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No archived items found</h3>
                <p className="text-muted-foreground">Items older than 1 month are automatically archived</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentView;