import React from 'react';
import { useTranslation } from 'react-i18next';
import type { MemberFiltersProps, SortOption, FilterOption } from '../../types';
import './MemberFilters.scss';

const MemberFilters: React.FC<MemberFiltersProps> = ({
    sortBy,
    filterBy,
    onSortChange,
    onFilterChange,
    filteredCount,
    totalCount
}) => {
    const { t } = useTranslation();

    return (
        <div className="member-filters">
            <div className="member-filters__row">
                <div className="member-filters__group">
                    <label className="member-filters__label">{t('serverSettings.sortBy') || 'Сортировать:'}</label>
                    <select
                        value={sortBy}
                        onChange={(e) => onSortChange(e.target.value as SortOption)}
                        className="member-filters__select"
                    >
                        <option value="name">{t('serverSettings.sortByName') || 'По имени'}</option>
                        <option value="role">{t('serverSettings.sortByRole') || 'По роли'}</option>
                        <option value="joined">{t('serverSettings.sortByJoined') || 'По дате вступления'}</option>
                    </select>
                </div>

                <div className="member-filters__group">
                    <label className="member-filters__label">{t('serverSettings.filterBy') || 'Фильтр:'}</label>
                    <select
                        value={filterBy}
                        onChange={(e) => onFilterChange(e.target.value as FilterOption)}
                        className="member-filters__select"
                    >
                        <option value="all">{t('serverSettings.allMembers') || 'Все участники'}</option>
                        <option value="owner">{t('serverSettings.owners') || 'Владельцы'}</option>
                        <option value="admin">{t('serverSettings.admins') || 'Администраторы'}</option>
                        <option value="moderator">{t('serverSettings.moderators') || 'Модераторы'}</option>
                        <option value="member">{t('serverSettings.membersFilter') || 'Участники'}</option>
                    </select>
                </div>

                <div className="member-filters__count">
                    <span className="member-filters__count-number">{filteredCount}</span>
                    <span className="member-filters__count-total">/ {totalCount}</span>
                </div>
            </div>
        </div>
    );
};

export default MemberFilters;
