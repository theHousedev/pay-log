import { useState, useEffect } from 'react';

interface AuthGuardProps {
    children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/health', {
                credentials: 'include'
            });

            if (response.ok) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            setIsAuthenticated(false);
        }

        setIsLoading(false);
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="text-white">Loading...</div>
        </div>;
    }

    if (!isAuthenticated) {
        return <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
            <div className="text-white">Authentication required</div>
            <button onClick={() => {
                window.location.href = '/api/auth/login';
            }} className="mt-4 bg-gray-700 text-white px-4 py-2 rounded-md">
                Retry Login
            </button>
        </div>;
    }

    return <>{children}</>;
}