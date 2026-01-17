/**
 * Утилиты для работы с разрешениями
 */
import { Permissions } from '../constants/permissions';

/**
 * Проверяет, есть ли у пользователя требуемое разрешение
 * @param userPermissions - разрешения пользователя (BigInt в виде строки или BigInt)
 * @param requiredPermission - требуемое разрешение
 * @returns true, если разрешение есть
 */
export const hasPermission = (userPermissions: string | bigint, requiredPermission: bigint): boolean => {
    const perms = typeof userPermissions === 'string' ? BigInt(userPermissions) : userPermissions;
    const req = BigInt(requiredPermission);

    // Если есть права администратора — разрешено всё
    if ((perms & Permissions.ADMINISTRATOR) === Permissions.ADMINISTRATOR) {
        return true;
    }

    return (perms & req) === req;
};

/**
 * Вычисляет общие разрешения участника на основе его ролей
 * @param memberRoles - массив ролей участника
 * @param everyoneRole - роль @everyone
 * @returns общие разрешения в виде BigInt
 */
export const calculateTotalPermissions = (
    memberRoles: Array<{ permissions: string }>,
    everyoneRole?: { permissions: string }
): bigint => {
    let total = everyoneRole ? BigInt(everyoneRole.permissions) : 0n;

    if (memberRoles) {
        memberRoles.forEach((role) => {
            total |= BigInt(role.permissions);
        });
    }

    return total;
};

/**
 * Преобразует BigInt в строку для отправки на сервер
 * @param permissions - разрешения в виде BigInt
 * @returns строка с разрешениями
 */
export const permissionsToString = (permissions: bigint): string => permissions.toString();

/**
 * Преобразует строку в BigInt для работы с разрешениями
 * @param permissions - разрешения в виде строки
 * @returns BigInt с разрешениями
 */
export const stringToPermissions = (permissions: string): bigint => BigInt(permissions);

/**
 * Объединяет несколько разрешений
 * @param permissions - массив разрешений (BigInt или строки)
 * @returns объединенные разрешения
 */
export const combinePermissions = (permissions: Array<bigint | string>): bigint => permissions.reduce((acc: bigint, perm) => {
    const permValue = typeof perm === 'string' ? BigInt(perm) : perm;
    return acc | permValue;
}, 0n);

/**
 * Удаляет разрешение из набора
 * @param permissions - текущие разрешения
 * @param permissionToRemove - разрешение для удаления
 * @returns новые разрешения без удаленного
 */
export const removePermission = (permissions: bigint | string, permissionToRemove: bigint): bigint => {
    const perms = typeof permissions === 'string' ? BigInt(permissions) : permissions;
    return perms & ~permissionToRemove;
};

/**
 * Добавляет разрешение в набор
 * @param permissions - текущие разрешения
 * @param permissionToAdd - разрешение для добавления
 * @returns новые разрешения с добавленным
 */
export const addPermission = (permissions: bigint | string, permissionToAdd: bigint): bigint => {
    const perms = typeof permissions === 'string' ? BigInt(permissions) : permissions;
    return perms | permissionToAdd;
};

/**
 * Проверяет, может ли пользователь редактировать роль на основе иерархии
 * @param userHighestPosition - самая высокая позиция роли пользователя
 * @param rolePosition - позиция редактируемой роли
 * @param isOwner - является ли пользователь владельцем сервера
 * @returns true, если может редактировать
 */
export const canEditRole = (userHighestPosition: number, rolePosition: number, isOwner: boolean = false): boolean => {
    if (isOwner) {
        return true;
    }
    return userHighestPosition > rolePosition;
};

/**
 * Проверяет, может ли пользователь удалить роль на основе иерархии
 * @param userHighestPosition - самая высокая позиция роли пользователя
 * @param rolePosition - позиция удаляемой роли
 * @param isOwner - является ли пользователь владельцем сервера
 * @returns true, если может удалить
 */
export const canDeleteRole = (userHighestPosition: number, rolePosition: number, isOwner: boolean = false): boolean => {
    if (isOwner) {
        return true;
    }
    return userHighestPosition > rolePosition;
};
