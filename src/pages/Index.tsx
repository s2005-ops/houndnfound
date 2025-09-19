import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, User, BookOpen, TrendingUp } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/20">
      <header className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4 text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">School Lost & Found Portal</h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            A comprehensive system to help students find their lost items and teachers manage the lost and found efficiently
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Search className="h-12 w-12 mx-auto text-primary mb-4" />
              <CardTitle className="text-2xl">Student Portal</CardTitle>
              <CardDescription className="text-lg">
                Browse lost items, search by date, and view collection history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-left space-y-2 mb-6 text-muted-foreground">
                <li>• View all available lost items</li>
                <li>• Search and filter by date</li>
                <li>• See collection history</li>
                <li>• Browse archived items</li>
              </ul>
              <Link to="/student">
                <Button size="lg" className="w-full">
                  <Search className="h-5 w-5 mr-2" />
                  Browse Lost Items
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <User className="h-12 w-12 mx-auto text-primary mb-4" />
              <CardTitle className="text-2xl">Teacher Portal</CardTitle>
              <CardDescription className="text-lg">
                Manage lost items, view statistics, and track collections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-left space-y-2 mb-6 text-muted-foreground">
                <li>• Add new lost items with photos</li>
                <li>• Mark items as collected</li>
                <li>• View monthly statistics</li>
                <li>• Auto-archive old items</li>
              </ul>
              <Link to="/login">
                <Button size="lg" className="w-full" variant="outline">
                  <User className="h-5 w-5 mr-2" />
                  Teacher Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-card rounded-lg p-8 max-w-3xl mx-auto">
            <TrendingUp className="h-12 w-12 mx-auto text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-4">Unique Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div>
                <h3 className="font-semibold mb-2">Smart Search</h3>
                <p className="text-muted-foreground text-sm">
                  Filter items by date, description, or location for quick discovery
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Analytics Dashboard</h3>
                <p className="text-muted-foreground text-sm">
                  Monthly statistics and trends to track lost item patterns
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Auto-Archive</h3>
                <p className="text-muted-foreground text-sm">
                  Items automatically archived after 30 days to keep the system organized
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
