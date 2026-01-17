import React from 'react';
import './SettingGroup.scss';

export interface SettingGroupProps {
    label?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}

const SettingGroup: React.FC<SettingGroupProps> = ({ label, description, children, className = '' }) => (
    <div className={`ui-setting-group ${className}`}>
        {label ? (
            <div className="ui-setting-group__header">
                <label className="ui-setting-group__label">
                    <span>{label}</span>
                </label>
            </div>
        ) : null}
        <div className="ui-setting-group__control">
            {children}
            {description ? <div className="ui-setting-group__description">{description}</div> : null}
        </div>
    </div>
);

export default SettingGroup;
