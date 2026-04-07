import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, Box } from '@mui/material';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [toast, setToast] = useState({ message: '', type: 'success' });

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
        setOpen(true);
    }, []);

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setOpen(false);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <Snackbar
                open={open}
                autoHideDuration={4000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                sx={{
                    mb: { xs: 8, md: 2 }, // Lift above mobile menu
                    mr: { xs: 0, md: 1 }
                }}
            >
                <Alert
                    onClose={handleClose}
                    severity={toast.type}
                    variant="filled"
                    sx={{
                        width: '100%',
                        borderRadius: 2,
                        fontWeight: 600,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        '&.MuiAlert-filledSuccess': { bgcolor: '#2ecc71' },
                        '&.MuiAlert-filledError': { bgcolor: '#FF4B4B' },
                        '&.MuiAlert-filledWarning': { bgcolor: '#facc15', color: '#000' },
                        '&.MuiAlert-filledInfo': { bgcolor: '#3b82f6' }
                    }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
