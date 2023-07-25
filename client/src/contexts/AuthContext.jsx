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
                        'Content-Type': 'application/json'
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setUser(data.username);
                    setUserProfilePicture(data.picture);
                    setIsAuthenticated(true);
                    navigate('/channel');
                } else {
                    console.log(`User has to sign in: ${response.status}`);
                    setIsAuthenticated(false);
                }
            } catch (error) {
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