import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut,Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = 'outline',
  size = 'default',
  className = '',
  children = 'Log out',
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      navigate('/login', { replace: true });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Logout Error',
        description: 'Failed to logout. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const buttonStyles = "bg-red-500 text-white hover:bg-red-600 border-0 rounded-lg h-9 px-3";

  return (
    <Button
      onClick={handleLogout}
      variant={variant}
      size={size}
      className={`${buttonStyles} ${className}`}
      disabled={isLoading}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : children}
    </Button>
  );
};

export default LogoutButton; 