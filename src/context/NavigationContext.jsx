import React, { createContext, useContext, useState } from 'react';

const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
        localStorage.getItem('kipkemoi_sidebar_collapsed') === 'true'
    );
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        if (window.innerWidth < 1024) {
            setIsMobileSidebarOpen(!isMobileSidebarOpen);
        } else {
            const newState = !isSidebarCollapsed;
            setIsSidebarCollapsed(newState);
            localStorage.setItem('kipkemoi_sidebar_collapsed', newState);
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
