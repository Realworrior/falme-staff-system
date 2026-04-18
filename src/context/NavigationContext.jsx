import React, { createContext, useContext, useState } from 'react';

const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        try {
            return localStorage.getItem('betmfalme_sidebar_collapsed') === 'true';
        } catch (e) {
            console.warn("localStorage is not available", e);
            return false;
        }
    });
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        if (window.innerWidth < 1024) {
            setIsMobileSidebarOpen(!isMobileSidebarOpen);
        } else {
            const newState = !isSidebarCollapsed;
            setIsSidebarCollapsed(newState);
            try {
                localStorage.setItem('betmfalme_sidebar_collapsed', newState.toString());
            } catch (e) {
                console.error("Failed to save sidebar state", e);
            }
        }
    };

    const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

    return (
        <NavigationContext.Provider value={{
            isSidebarCollapsed,
            isMobileSidebarOpen,
            toggleSidebar,
            closeMobileSidebar
        }}>
            {children}
        </NavigationContext.Provider>
    );
};

export const useNavigation = () => useContext(NavigationContext);
