import React from 'react';
import { Navigate } from 'react-router-dom';
import { authStore } from '../../../core';

interface ProtectedRouteProps {
    children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    // Проверка на аутентификацию
    if (!authStore.isAuthenticated) {
        return <Navigate to="/auth" />;
    }
    return children; // Если пользователь аутентифицирован, возвращаем дочерние элементы
};

export default ProtectedRoute;

