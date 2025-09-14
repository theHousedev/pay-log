import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
    children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        console.log('AuthGuard: isLoading =', isLoading, 'isAuthenticated =', isAuthenticated);
        if (!isLoading && !isAuthenticated) {
            console.log('AuthGuard: Redirecting to login...');
            navigate('/login');
        }
    }, [isLoading, isAuthenticated, navigate]);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="text-white">Loading...</div>
        </div>;
    }

    if (!isAuthenticated) {
        console.log('AuthGuard: Not authenticated, returning null');
        return null;
    }

    console.log('AuthGuard: Authenticated, rendering children');
    return <>{children}</>;
}