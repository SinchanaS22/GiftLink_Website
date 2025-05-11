import React, { createContext, useState, useEffect } from 'react';

// Create the authentication context
const AuthContext = createContext({
    isLoggedIn: false,
    setIsLoggedIn: (value) => { },
    userName: '',
    setUserName: (name) => { },
    userEmail: '',
    setUserEmail: (email) => {},
    login: (token, name, email) => { },
    logout: () => { },
});

/**
 * AuthProvider component to manage authentication state.
 * This provider wraps the application and makes the authentication state available to all components.
 */
const AuthProvider = ({ children }) => {
    // State variables
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');

    // Load authentication state from localStorage on initial load
    useEffect(() => {
        const storedAuthToken = sessionStorage.getItem('auth-token');
        const storedUserName = sessionStorage.getItem('name');
        const storedUserEmail = sessionStorage.getItem('email');
        if (storedAuthToken) {
            setIsLoggedIn(true);
            setUserName(storedUserName || '');
            setUserEmail(storedUserEmail || '');
        }
    }, []);

    // Function to update login state and persist to localStorage
    const handleLogin = (token, name, email) => {
        setIsLoggedIn(true);
        setUserName(name);
        setUserEmail(email);
        sessionStorage.setItem('auth-token', token);
        sessionStorage.setItem('name', name);
        sessionStorage.setItem('email', email);
    };

    // Function to handle logout
    const handleLogout = () => {
        setIsLoggedIn(false);
        setUserName('');
        setUserEmail('');
        sessionStorage.removeItem('auth-token');
        sessionStorage.removeItem('name');
        sessionStorage.removeItem('email');
    };

    // Provide the context value
    const authContextValue = {
        isLoggedIn,
        setIsLoggedIn,
        userName,
        setUserName,
        userEmail,
        setUserEmail,
        login: handleLogin,
        logout: handleLogout,
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Custom hook to easily access the authentication context.
 * @returns The authentication context object.
 */
const useAppContext = () => {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AuthProvider');
    }
    return context;
};

export { AuthProvider, useAppContext };
