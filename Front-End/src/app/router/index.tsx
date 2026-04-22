import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';
import ProtectedRoute from './ProtectedRoute';
import LandingPage from '../../pages/LandingPage';
import LoginPage from '../../pages/LoginPage';
import SignupPage from '../../pages/SignupPage';
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
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/signup',
        element: <SignupPage />,
    },
    {
        path: '/app',
        element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
        children: [
            {
                index: true,
                element: <Navigate to="/app/dashboard" replace />,
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
