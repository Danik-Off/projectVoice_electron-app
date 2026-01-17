import React from 'react';
import './Select.scss';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    helperText?: string;
    fullWidth?: boolean;
    options: Array<{ value: string | number; label: string }>;
}

const Select: React.FC<SelectProps> = ({
    label,
    error,
    helperText,
    fullWidth = false,
    options,
    className = '',
    id,
    ...props
}) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={`ui-select ${fullWidth ? 'ui-select--full-width' : ''} ${error ? 'ui-select--error' : ''}`}>
            {label ? (
                <label htmlFor={selectId} className="ui-select__label">
                    {label}
                </label>
            ) : null}
            <select id={selectId} className={`ui-select__field ${className}`} {...props}>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error ? <span className="ui-select__error">{error}</span> : null}
            {helperText && !error ? <span className="ui-select__helper">{helperText}</span> : null}
        </div>
    );
};

export default Select;
