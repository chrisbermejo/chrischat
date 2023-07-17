import React, { createContext, useState } from 'react';
import Cookie from 'universal-cookie';
import jwt from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const cookies = new Cookie();
    const initialToken = cookies.get('token');
    const initialUser = initialToken ? jwt(initialToken).user : null;

    const [user, setUser] = useState(initialUser);

    const login = (token) => {
        const decoded = jwt(token);
        setUser(decoded.user);
        cookies.set('token', token, { expires: new Date(decoded.exp * 1000) });
    };

    const logout = () => {
        setUser(null);
        cookies.remove('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};