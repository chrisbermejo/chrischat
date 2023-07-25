import React, { createContext, useEffect, useState } from 'react';
import { disconnectSocket } from '../socket';
import { useNavigate } from 'react-router-dom';


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const navigate = useNavigate();

    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [user, setUser] = useState(null);
    const [userProfilePicture, setUserProfilePicture] = useState(null);

    const logout = () => {
        disconnectSocket();
        setUser(null);
        setUserProfilePicture(null);
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
                    console.log('user information fetching......')
                    const data = await response.json();
                    setUser(data.username);
                    setUserProfilePicture(data.picture);
                    setIsAuthenticated(true)
                    navigate('/channel');
                } else if (response.status === 401) {
                    setIsAuthenticated(false);
                    console.log('Access Denied: You are not authorized to access this resource.');
                } else {
                    console.log(`Failed to fetch room messages for room: `);
                }
            } catch (error) {
                console.error('Error fetching room messages:', error);
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