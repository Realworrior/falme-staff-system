import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#1c1c28',
          border: '1px solid #2e2e42',
          color: '#e8eaf0',
          fontSize: '13px',
        },
      }}
    />
  );
}
