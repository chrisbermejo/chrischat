import React, { createContext, useState } from 'react';
import Cookie from 'universal-cookie';
import jwt from 'jwt-decode';
import { disconnectSocket } from '../socket';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const cookies = new Cookie();
    const initialToken = cookies.get('token');
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
        cookies.remove('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, userProfilePicture }}>
            {children}
        </AuthContext.Provider>
    );
};