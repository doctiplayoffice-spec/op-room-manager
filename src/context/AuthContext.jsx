import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const UserRole = {
    INTERVENANT: 'INTERVENANT', // Can view, schedule, operate
    GESTIONNAIRE: 'GESTIONNAIRE' // Can manage specific things (Hyper Septic Edit)
};

// Mock "DB" of valid hashes (PINs)
// "1234" -> Intervenant
// "9090" -> Gestionnaire (Requires Secondary Code "ADMIN")
const MOCK_PINS = {
    '1234': { role: UserRole.INTERVENANT, name: 'Dr. Intervenant' },
    '9090': { role: UserRole.GESTIONNAIRE, name: 'Cadre de Santé', needsSecondary: true }
};

const SECONDARY_SECRET = 'ADMIN';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Load from session on mount
    useEffect(() => {
        const stored = sessionStorage.getItem('op_room_auth');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Basic session validity check (timeout could be added here)
                setUser(parsed);
                setIsAuthenticated(true);
            } catch (e) {
                // Invalid session
                sessionStorage.removeItem('op_room_auth');
            }
        }
        setLoading(false);
    }, []);

    const login = async (role, pin, secondaryCode = null) => {
        // Mock API Latency
        await new Promise(r => setTimeout(r, 600));

        // Check PIN
        const account = MOCK_PINS[pin];
        if (!account) {
            throw new Error("Code PIN invalide");
        }

        // Check Role mismatch
        if (account.role !== role) {
            // For simplicity, if PIN is valid but wrong role selected, we could error or auto-switch.
            // Requirement says "Vérifier role + pin".
            throw new Error("Rôle incorrect pour ce PIN");
        }

        // Check Secondary
        if (role === UserRole.GESTIONNAIRE) {
            if (!secondaryCode || secondaryCode !== SECONDARY_SECRET) {
                throw new Error("Code secondaire invalide");
            }
        }

        // Success
        const userData = {
            id: 'u-' + Date.now(),
            name: account.name,
            role: account.role,
            loginTime: Date.now()
        };

        setUser(userData);
        setIsAuthenticated(true);
        sessionStorage.setItem('op_room_auth', JSON.stringify(userData));

        return userData;
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        sessionStorage.removeItem('op_room_auth');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
