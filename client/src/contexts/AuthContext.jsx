import React, { createContext, useEffect, useState } from 'react';
import { disconnectSocket } from '../socket';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const navigate = useNavigate();

    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [user, setUser] = useState(null);
    const [userProfilePicture, setUserProfilePicture] = useState(null);

    const logout = async () => {
        try {
            await fetch(`http://localhost:8000/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            disconnectSocket();
            setUser(null);
            setUserProfilePicture(null);
            setIsAuthenticated(false);
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    useEffect(() => {
        const fetchUserInformation = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/user`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Content-Type': 'application/json'
                    },
                });
                if (response.ok && response.status === 200) {
                    const data = await response.json();
                    setUser(data.username);
                    setUserProfilePicture(data.picture);
                    setIsAuthenticated(data.isLoggedIn);
                    // navigate('/channel');
                } else if (response.status === 401) {
                    setIsAuthenticated(false);
                    console.log(`User has to sign in: ${response.status}`);
                }
            } catch (error) {
                setIsAuthenticated(false);
                console.error('Error fetching user information:', error);
            }
        };
        fetchUserInformation();
    }, []);


    return (
        <AuthContext.Provider value={{ user, logout, userProfilePicture, isAuthenticated, setIsAuthenticated, setUser, setUserProfilePicture, setIsAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};