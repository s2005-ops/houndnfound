import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Teacher } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Users, Crown, Shield, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface TeacherManagementProps {
  onClose: () => void;
}

export const TeacherManagement: React.FC<TeacherManagementProps> = ({ onClose }) => {
  const { teacher: currentTeacher } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Type assertion to match our Teacher interface
      setTeachers((data || []) as Teacher[]);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch teachers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAccessLevel = async (teacherId: string, newAccessLevel: 'user' | 'admin' | 'super_admin') => {
    try {
      const { error } = await supabase
        .from('teachers')
        .update({ access_level: newAccessLevel })
        .eq('id', teacherId);

      if (error) throw error;

      setTeachers(teachers.map(teacher => 
        teacher.id === teacherId 
          ? { ...teacher, access_level: newAccessLevel }
          : teacher
      ));

      toast({
        title: "Success",
        description: `Access level updated to ${newAccessLevel.replace('_', ' ')}`
      });
    } catch (error) {
      console.error('Error updating access level:', error);
      toast({
        title: "Error",
        description: "Failed to update access level",
        variant: "destructive"
      });
    }
  };

  const deleteTeacher = async (teacherId: string) => {
    if (teacherId === currentTeacher?.id) {
      toast({
        title: "Error",
        description: "Cannot delete your own account",
        variant: "destructive"
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this teacher account?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', teacherId);

      if (error) throw error;

      setTeachers(teachers.filter(teacher => teacher.id !== teacherId));

      toast({
        title: "Success",
        description: "Teacher account deleted"
      });
    } catch (error) {
      console.error('Error deleting teacher:', error);
      toast({
        title: "Error",
        description: "Failed to delete teacher account",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Teacher Management</h2>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Loading teachers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Teacher Management
        </h2>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>

      <div className="grid gap-4">
        {teachers.map((teacher) => (
          <Card key={teacher.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {teacher.access_level === 'super_admin' ? (
                      <Crown className="h-4 w-4 text-yellow-500" />
                    ) : teacher.access_level === 'admin' ? (
                      <Shield className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Users className="h-4 w-4 text-gray-500" />
                    )}
                    {teacher.full_name}
                  </CardTitle>
                  <CardDescription>@{teacher.username}</CardDescription>
                  {teacher.email && (
                    <CardDescription>{teacher.email}</CardDescription>
                  )}
                </div>
                <Badge variant={
                  teacher.access_level === 'super_admin' ? 'default' : 
                  teacher.access_level === 'admin' ? 'secondary' : 'outline'
                }>
                  {teacher.access_level.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Joined {format(new Date(teacher.created_at), 'PPP')}
                </div>
                {teacher.id !== currentTeacher?.id && (
                  <div className="flex gap-2">
                    <Select
                      value={teacher.access_level}
                      onValueChange={(value: 'user' | 'admin' | 'super_admin') => 
                        updateAccessLevel(teacher.id, value)
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTeacher(teacher.id)}
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {teacher.id === currentTeacher?.id && (
                  <Badge variant="outline">Current User</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {teachers.length === 0 && (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No teachers found</h3>
          <p className="text-muted-foreground">Teachers will appear here once they sign up</p>
        </div>
      )}
    </div>
  );
};