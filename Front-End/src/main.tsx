import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import QueryProvider from './app/providers/QueryProvider';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryProvider>
            <RouterProvider router={router} />
        </QueryProvider>
    </React.StrictMode>
);