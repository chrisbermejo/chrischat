import React, { createContext, useEffect, useState } from 'react';
import { disconnectSocket } from '../socket';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const navigate = useNavigate();

    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [user, setUser] = useState(false);
    const [userProfilePicture, setUserProfilePicture] = useState(false);
    const [userEmail, setUserEmail] = useState(false);
    const [rowCount, setRowCount] = useState({
        FriendListCount: 0,
        ConversationCount: 0
    });

    const logout = async () => {
        try {
            await fetch(`http://localhost:8000/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/json'
                },
            });
            disconnectSocket();
            setUser(false);
            setUserProfilePicture(false);
            setUserEmail(false);
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
                if (response.ok) {
                    const data = await response.json();
                    if (data.isLoggedIn) {
                        setUser(data.username);
                        setUserProfilePicture(data.picture);
                        setUserEmail(data.email);
                        setIsAuthenticated(data.isLoggedIn);
                        setRowCount({
                            FriendListCount: data.FriendListCount,
                            ConversationCount: data.ConversationCount
                        });
                        navigate('/channel');
                    } else if (data.isLoggedIn === false) {
                        setIsAuthenticated(data.isLoggedIn);
                    }
                }
                else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                setIsAuthenticated(false);
                console.error('Error fetching user information:', error);
            }
        };
        fetchUserInformation();
    }, []);


    return (
        <AuthContext.Provider value={{ user, logout, rowCount, setRowCount, userProfilePicture, userEmail, setUserEmail, isAuthenticated, setIsAuthenticated, setUser, setUserProfilePicture }}>
            {children}
        </AuthContext.Provider>
    );
};