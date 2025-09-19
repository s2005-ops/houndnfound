import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LostItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { AddItemDialog } from '@/components/AddItemDialog';
import { StatsChart } from '@/components/StatsChart';
import { TeacherManagement } from '@/components/TeacherManagement';
import { Plus, LogOut, Package, CheckCircle, Archive, TrendingUp, Home, Users, Settings } from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const { teacher, logout, isSuperAdmin } = useAuth();
  const [items, setItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showTeacherManagement, setShowTeacherManagement] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

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
      toast({
        title: "Error",
        description: "Failed to fetch items",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsCollected = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('lost_items')
        .update({ 
          status: 'collected',
          collected_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;

      setItems(items.map(item => 
        item.id === itemId 
          ? { ...item, status: 'collected', collected_at: new Date().toISOString() }
          : item
      ));

      toast({
        title: "Success",
        description: "Item marked as collected"
      });
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive"
      });
    }
  };

  const getItemsByStatus = (status: string) => {
    return items.filter(item => item.status === status);
  };

  const ItemCard = ({ item }: { item: LostItem }) => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{item.description}</CardTitle>
          <Badge variant={item.status === 'available' ? 'default' : 
                        item.status === 'collected' ? 'secondary' : 'outline'}>
            {item.status}
          </Badge>
        </div>
        <CardDescription>
          Added on {format(new Date(item.created_at), 'PPP')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {item.image_url && (
          <div className="w-full h-32 bg-muted rounded-lg overflow-hidden">
            <img
              src={item.image_url}
              alt={item.description}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="space-y-2 text-sm">
          <p><strong>Found at:</strong> {item.location_found}</p>
          <p><strong>Collect from:</strong> {item.collection_location}</p>
          {item.collected_at && (
            <p><strong>Collected on:</strong> {format(new Date(item.collected_at), 'PPP')}</p>
          )}
        </div>
        {item.status === 'available' && (
          <Button 
            onClick={() => markAsCollected(item.id)}
            className="w-full"
            size="sm"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark as Collected
          </Button>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4 px-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Lost & Found Admin
              {isSuperAdmin && <Badge variant="secondary" className="ml-2">Super Admin</Badge>}
            </h1>
            <p className="text-primary-foreground/80">Welcome back, {teacher?.full_name}</p>
          </div>
          <div className="flex gap-3">
            {isSuperAdmin && (
              <Button 
                variant="outline" 
                onClick={() => setShowTeacherManagement(!showTeacherManagement)}
                className="text-primary bg-primary-foreground"
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Teachers
              </Button>
            )}
            <Link to="/">
              <Button variant="outline" className="text-primary bg-primary-foreground">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <Button variant="outline" onClick={logout} className="text-primary bg-primary-foreground">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {showTeacherManagement && isSuperAdmin ? (
          <TeacherManagement onClose={() => setShowTeacherManagement(false)} />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getItemsByStatus('available').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collected</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getItemsByStatus('collected').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Archived</CardTitle>
              <Archive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getItemsByStatus('archived').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{items.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <StatsChart items={items} />
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Manage Items</h2>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Lost Item
          </Button>
        </div>

        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="available">
              Available ({getItemsByStatus('available').length})
            </TabsTrigger>
            <TabsTrigger value="collected">
              Collected ({getItemsByStatus('collected').length})
            </TabsTrigger>
            <TabsTrigger value="archived">
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
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No available items</h3>
                <p className="text-muted-foreground mb-4">Start by adding a lost item</p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Item
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="collected" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getItemsByStatus('collected').map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="archived" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getItemsByStatus('archived').map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
          </>
        )}
      </div>

      <AddItemDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        onItemAdded={(newItem) => {
          setItems([newItem, ...items]);
          fetchItems(); // Refresh to get the latest data
        }}
      />
    </div>
  );
};

export default AdminDashboard;