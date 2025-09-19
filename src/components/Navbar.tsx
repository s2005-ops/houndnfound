import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Shield, LogIn } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-border/50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold">Lost & Found</h1>
              <p className="text-xs text-muted-foreground -mt-1">School Portal</p>
            </div>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center gap-4">
            <Link to="/student" className="hidden md:block">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Browse Items
              </Button>
            </Link>
            
            <Link to="/login">
              <Button variant="outline" size="sm" className="shadow-soft">
                <Shield className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Teacher</span> Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;