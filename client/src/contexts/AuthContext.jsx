import React, { createContext, useState } from 'react';
import Cookie from 'universal-cookie';
import jwt from 'jwt-decode';
import { disconnectSocket } from '../socket';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const isTokenValid = (token) => {
        if (!token) return false;

        const decoded = jwt(token);
        const currentTime = Date.now() / 1000;

        return decoded.exp > currentTime;
    };

    const cookies = new Cookie();
    const initialToken = cookies.get('token');
    const isAuthenticated = isTokenValid(initialToken);

    const initialUser = initialToken ? jwt(initialToken).user : null;
    const initialPic = initialToken ? jwt(initialToken).picture : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

    const [user, setUser] = useState(initialUser);
    const [userProfilePicture, setUserProfilePicture] = useState(initialPic);

    const login = (token) => {
        const decoded = jwt(token);
        setUser(decoded.user);
        setUserProfilePicture(decoded.picture);
        cookies.set('token', token, { expires: new Date(decoded.exp * 1000) });
    };

    const logout = () => {
        disconnectSocket();
        setUser(null);
        setUserProfilePicture(null);
        cookies.remove('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, userProfilePicture, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};