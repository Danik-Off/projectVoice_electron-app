import React from 'react';
import './Radio.scss';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    helperText?: string;
}

const Radio: React.FC<RadioProps> = ({ label, helperText, className = '', id, ...props }) => {
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={`ui-radio ${className}`}>
            <label htmlFor={radioId} className="ui-radio__label">
                <input type="radio" id={radioId} className="ui-radio__input" {...props} />
                <span className="ui-radio__mark" />
                {label ? <span className="ui-radio__text">{label}</span> : null}
            </label>
            {helperText ? <span className="ui-radio__helper">{helperText}</span> : null}
        </div>
    );
};

export default Radio;
