import { useState, useEffect } from 'react';

interface AuthGuardProps {
    children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showLogin, setShowLogin] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const storedAuth = localStorage.getItem('pay-app-auth');

        if (storedAuth) {
            try {
                const response = await fetch('/api/health', {
                    headers: {
                        'Authorization': 'Basic ' + storedAuth
                    }
                });
                if (response.ok) {
                    setIsAuthenticated(true);
                } else if (response.status === 401) {
                    localStorage.removeItem('pay-app-auth');
                    setShowLogin(true);
                } else {
                    setIsAuthenticated(true);
                }
            } catch (error) {
                setIsAuthenticated(true);
            }
        } else {
            setShowLogin(true);
        }

        setIsLoading(false);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/health', {
                headers: {
                    'Authorization': 'Basic ' + btoa(username + ':' + password)
                }
            });

            if (response.ok) {
                localStorage.setItem('pay-app-auth', btoa(username + ':' + password));
                setIsAuthenticated(true);
                setShowLogin(false);
            } else {
                alert('Invalid credentials');
            }
        } catch (error) {
            alert('Login failed');
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="text-white">Loading...</div>
        </div>;
    }

    if (!isAuthenticated && showLogin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="bg-gray-800 p-8 rounded-lg">
                    <h2 className="text-xl font-bold mb-4 text-white">Pay Log Access</h2>
                    <form onSubmit={handleLogin}>
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full p-2 rounded bg-gray-700 text-white"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 rounded bg-gray-700 text-white"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}