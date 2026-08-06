import React, { createContext, useContext, useState, useCallback } from 'react';

const DrawerContext = createContext({
  isDrawerOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
  toggleDrawer: () => {},
  activeRoute: 'DashboardTab',
  setActiveRoute: () => {},
});

export const DrawerProvider = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState('DashboardTab');

  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  return (
    <DrawerContext.Provider
      value={{
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
        activeRoute,
        setActiveRoute,
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
};

export const useDrawer = () => {
  return useContext(DrawerContext);
};
