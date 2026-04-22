import { Navigate, createBrowserRouter } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';
import LandingPage from '../../pages/LandingPage';
import DashboardPage from '../../pages/DashboardPage';
import CreateLinkPage from '../../pages/CreateLinkPage';
import LinksPage from '../../pages/LinksPage';
import LinkDetailPage from '../../pages/LinkDetailPage';
import SettingsPage from '../../pages/SettingsPage';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <LandingPage />,
    },
    {
        path: '/app',
        element: <AppLayout />,
        children: [
            {
                index: true,
                element: <Navigate to="dashboard" replace />,
            },
            {
                path: 'dashboard',
                element: <DashboardPage />,
            },
            {
                path: 'create',
                element: <CreateLinkPage />,
            },
            {
                path: 'links',
                element: <LinksPage />,
            },
            {
                path: 'links/:alias',
                element: <LinkDetailPage />,
            },
            {
                path: 'settings',
                element: <SettingsPage />,
            },
        ],
    },
]);
