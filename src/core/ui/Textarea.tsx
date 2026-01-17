import React from 'react';
import './Textarea.scss';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
    fullWidth?: boolean;
}

const Textarea: React.FC<TextareaProps> = ({
    label,
    error,
    helperText,
    fullWidth = false,
    className = '',
    id,
    ...props
}) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div
            className={`ui-textarea ${fullWidth ? 'ui-textarea--full-width' : ''} ${error ? 'ui-textarea--error' : ''}`}
        >
            {label ? (
                <label htmlFor={textareaId} className="ui-textarea__label">
                    {label}
                </label>
            ) : null}
            <textarea id={textareaId} className={`ui-textarea__field ${className}`} {...props} />
            {error ? <span className="ui-textarea__error">{error}</span> : null}
            {helperText && !error ? <span className="ui-textarea__helper">{helperText}</span> : null}
        </div>
    );
};

export default Textarea;
