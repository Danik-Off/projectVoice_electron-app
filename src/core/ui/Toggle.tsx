import React from 'react';
import './Toggle.scss';

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    helperText?: string;
}

const Toggle: React.FC<ToggleProps> = ({ label, helperText, className = '', id, ...props }) => {
    const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={`ui-toggle ${className}`}>
            <label htmlFor={toggleId} className="ui-toggle__label">
                <input type="checkbox" id={toggleId} className="ui-toggle__input" {...props} />
                <span className="ui-toggle__switch" />
                {label && <span className="ui-toggle__text">{label}</span>}
            </label>
            {helperText && <span className="ui-toggle__helper">{helperText}</span>}
        </div>
    );
};

export default Toggle;
