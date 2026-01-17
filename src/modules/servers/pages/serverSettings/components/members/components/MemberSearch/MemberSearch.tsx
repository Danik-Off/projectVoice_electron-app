import React from 'react';
import type { MemberSearchProps } from '../../types';
import './MemberSearch.scss';

const MemberSearch: React.FC<MemberSearchProps> = ({ value, onChange, placeholder = 'Поиск участников...' }) => (
        <div className="member-search">
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="member-search__input"
            />
            <span className="member-search__icon">🔍</span>
        </div>
);

export default MemberSearch;
