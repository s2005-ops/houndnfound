import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LostItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { AddItemDialog } from '@/components/AddItemDialog';
import { EditItemDialog } from '@/components/EditItemDialog';
import { StatsChart } from '@/components/StatsChart';
import { TeacherManagement } from '@/components/TeacherManagement';
import { 
  Plus, LogOut, Package, CheckCircle, Archive, TrendingUp, Home, Users, 
  Settings, BarChart3, Star, Clock, MapPin, Filter, Grid, Eye, Edit3, Trash2,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const { teacher, logout, isSuperAdmin } = useAuth();
  const [items, setItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showTeacherManagement, setShowTeacherManagement] = useState(false);
  const [editingItem, setEditingItem] = useState<LostItem | null>(null);

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
      setItems((data || []) as LostItem[]);
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

  const deleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('lost_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setItems(items.filter(item => item.id !== itemId));

      toast({
        title: "Success",
        description: "Item deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive"
      });
    }
  };

  const handleItemUpdated = (updatedItem: LostItem) => {
    setItems(items.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
  };

  const getItemsByStatus = (status: string) => {
    return items.filter(item => item.status === status);
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
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        
        <div className="absolute top-3 right-3">
          <Badge className={`${getStatusColor(item.status)} font-medium`}>
            {item.status}
          </Badge>
        </div>

        {/* Admin Action Buttons */}
        <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
            onClick={() => setEditingItem(item)}
          >
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-white/80 hover:bg-red-50 hover:text-red-600"
            onClick={() => deleteItem(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {item.description}
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Added {format(new Date(item.created_at), 'MMM dd, yyyy')}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Found at:</p>
              <p className="text-sm text-muted-foreground">{item.location_found}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Settings className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Collect from:</p>
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

          {item.status === 'available' && (
            <div className="pt-3 space-y-2">
              <Button 
                onClick={() => markAsCollected(item.id)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                size="sm"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Collected
              </Button>
            </div>
          )}

          {/* Admin Actions */}
          <div className="pt-3 border-t flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setEditingItem(item)}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-red-600 hover:bg-red-50 hover:border-red-200"
              onClick={() => deleteItem(item.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
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
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                  {isSuperAdmin && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                      Super Admin
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Welcome back, {teacher?.full_name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {isSuperAdmin && (
                <Button 
                  variant={showTeacherManagement ? "default" : "outline"}
                  onClick={() => setShowTeacherManagement(!showTeacherManagement)}
                  className="shadow-soft"
                >
                  <Users className="h-4 w-4 mr-2" />
                  {showTeacherManagement ? 'Hide' : 'Manage'} Teachers
                </Button>
              )}
              
              <Link to="/">
                <Button variant="outline" className="shadow-soft">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              
              <Button variant="outline" onClick={logout} className="shadow-soft text-red-600 hover:bg-red-50 hover:border-red-200">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Teacher Management Section - Show for Super Admins */}
        {isSuperAdmin && showTeacherManagement && (
          <div className="mb-8">
            <TeacherManagement onClose={() => setShowTeacherManagement(false)} />
          </div>
        )}
        
        {!showTeacherManagement && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-0 shadow-soft bg-white/80 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                  <CardTitle className="text-sm font-medium">Available Items</CardTitle>
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Star className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-2xl font-bold">{getItemsByStatus('available').length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Ready for pickup</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-soft bg-white/80 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                  <CardTitle className="text-sm font-medium">Collected</CardTitle>
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-2xl font-bold">{getItemsByStatus('collected').length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Successfully returned</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-soft bg-white/80 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-gray-600/5"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                  <CardTitle className="text-sm font-medium">Archived</CardTitle>
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                    <Archive className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-2xl font-bold">{getItemsByStatus('archived').length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Auto-archived</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-soft bg-white/80 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/5"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                  <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-2xl font-bold">{items.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">All time</p>
                </CardContent>
              </Card>
            </div>

            {/* Statistics Chart */}
            <div className="mb-8">
              <StatsChart items={items} />
            </div>

            {/* Add Item Section */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">Manage Lost Items</h2>
                <p className="text-muted-foreground">Add new items and track their status</p>
              </div>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-glow"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Lost Item
              </Button>
            </div>

            {/* Items Tabs */}
            <Tabs defaultValue="available" className="w-full">
              <TabsList className={`grid w-full ${isSuperAdmin ? 'grid-cols-4' : 'grid-cols-3'} bg-white/80 backdrop-blur-sm shadow-soft border-0`}>
                <TabsTrigger value="available" className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Available ({getItemsByStatus('available').length})
                </TabsTrigger>
                <TabsTrigger value="collected" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Collected ({getItemsByStatus('collected').length})
                </TabsTrigger>
                <TabsTrigger value="archived" className="flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  Archived ({getItemsByStatus('archived').length})
                </TabsTrigger>
                {isSuperAdmin && (
                  <TabsTrigger value="teachers" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Teachers
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="available" className="mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {getItemsByStatus('available').map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
                {getItemsByStatus('available').length === 0 && (
                  <Card className="text-center py-12 border-0 shadow-soft bg-white/80 backdrop-blur-sm">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No available items</h3>
                    <p className="text-muted-foreground mb-4">Start by adding a lost item</p>
                    <Button 
                      onClick={() => setIsAddDialogOpen(true)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Item
                    </Button>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="collected" className="mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {getItemsByStatus('collected').map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
                {getItemsByStatus('collected').length === 0 && (
                  <Card className="text-center py-12 border-0 shadow-soft bg-white/80 backdrop-blur-sm">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No collected items</h3>
                    <p className="text-muted-foreground">Items marked as collected will appear here</p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="archived" className="mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {getItemsByStatus('archived').map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
                {getItemsByStatus('archived').length === 0 && (
                  <Card className="text-center py-12 border-0 shadow-soft bg-white/80 backdrop-blur-sm">
                    <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No archived items</h3>
                    <p className="text-muted-foreground">Items older than 1 month are automatically archived</p>
                  </Card>
                )}
              </TabsContent>

              {isSuperAdmin && (
                <TabsContent value="teachers" className="mt-6">
                  <TeacherManagement onClose={() => {}} />
                </TabsContent>
              )}
            </Tabs>
          </>
        )}
      </div>

      <AddItemDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        onItemAdded={(newItem) => {
          setItems([newItem, ...items]);
          fetchItems();
        }}
      />

      {editingItem && (
        <EditItemDialog
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          item={editingItem}
          onItemUpdated={handleItemUpdated}
        />
      )}
    </div>
  );
};

export default AdminDashboard;