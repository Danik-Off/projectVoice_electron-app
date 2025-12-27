import React from 'react';
import { Navigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { authStore } from '../../../core';

interface ProtectedRouteProps {
    children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = observer(({ children }) => {
    // Проверка на аутентификацию
    // Компонент является наблюдателем MobX, поэтому реагирует на изменения isAuthenticated
    if (!authStore.isAuthenticated) {
        return <Navigate to="/auth" />;
    }
    return children; // Если пользователь аутентифицирован, возвращаем дочерние элементы
});

export default ProtectedRoute;

