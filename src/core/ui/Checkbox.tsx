import React from 'react';
import './Checkbox.scss';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    helperText?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, helperText, className = '', id, ...props }) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={`ui-checkbox ${className}`}>
            <label htmlFor={checkboxId} className="ui-checkbox__label">
                <input type="checkbox" id={checkboxId} className="ui-checkbox__input" {...props} />
                <span className="ui-checkbox__checkmark" />
                {label ? <span className="ui-checkbox__text">{label}</span> : null}
            </label>
            {helperText ? <span className="ui-checkbox__helper">{helperText}</span> : null}
        </div>
    );
};

export default Checkbox;
