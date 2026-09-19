import React from 'react';
import { QueryProvider } from './providers/QueryProvider';
import { AppRouter } from './router/AppRouter';
import { Toaster } from 'sonner';

export const App: React.FC = () => {
  return (
    <QueryProvider>
      <AppRouter />
      <Toaster position="bottom-right" richColors />
    </QueryProvider>
  );
};

export default App;
