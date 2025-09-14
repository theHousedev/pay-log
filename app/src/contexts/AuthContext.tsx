import { createContext, useContext, useState, useEffect } from 'react';
import { getAPIPath } from '@/utils/backend';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    checkAuth: () => Promise<boolean>;
    refreshAuth: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        try {
            console.log('AuthContext: Checking authentication...');
            const response = await fetch(`${getAPIPath()}/auth-ok`, {
                credentials: 'include'
            });
            console.log('AuthContext: Auth response status:', response.status);
            if (response.status === 200) {
                console.log('AuthContext: Authentication successful');
                setIsAuthenticated(true);
                return true;
            } else {
                console.log('AuthContext: Authentication failed, status:', response.status);
            }
        } catch (error) {
            console.error('AuthContext: Auth check failed:', error);
        }
        console.log('AuthContext: Setting isAuthenticated to false');
        setIsAuthenticated(false);
        return false;
    };

    const logout = async () => {
        try {
            await fetch(`${getAPIPath()}/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout failed:', error);
        }
        setIsAuthenticated(false);
    };

    const refreshAuth = async () => {
        console.log('AuthContext: Refreshing authentication...');
        setIsLoading(true);
        await checkAuth();
        setIsLoading(false);
        console.log('AuthContext: Refresh complete');
    };

    useEffect(() => {
        let isMounted = true;
        checkAuth().finally(() => {
            if (isMounted) {
                setIsLoading(false);
            }
        });
        return () => { isMounted = false; };
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, checkAuth, refreshAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};