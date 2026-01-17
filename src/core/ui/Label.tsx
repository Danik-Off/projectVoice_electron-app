import React from 'react';
import './Label.scss';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    required?: boolean;
    children: React.ReactNode;
}

const Label: React.FC<LabelProps> = ({ required = false, children, className = '', ...props }) => (
        <label className={`ui-label ${required ? 'ui-label--required' : ''} ${className}`} {...props}>
            {children}
            {required && <span className="ui-label__asterisk">*</span>}
        </label>
);

export default Label;
