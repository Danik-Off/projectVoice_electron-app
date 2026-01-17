import React from 'react';
import './Input.scss';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({ label, error, helperText, fullWidth = false, className = '', id, ...props }) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={`ui-input ${fullWidth ? 'ui-input--full-width' : ''} ${error ? 'ui-input--error' : ''}`}>
            {label ? (
                <label htmlFor={inputId} className="ui-input__label">
                    {label}
                </label>
            ) : null}
            <input id={inputId} className={`ui-input__field ${className}`} {...props} />
            {error ? <span className="ui-input__error">{error}</span> : null}
            {helperText && !error ? <span className="ui-input__helper">{helperText}</span> : null}
        </div>
    );
};

export default Input;
