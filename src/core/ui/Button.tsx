import React from 'react';
import './Button.scss';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'test' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    fullWidth?: boolean;
    loading?: boolean;
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    loading = false,
    disabled,
    className = '',
    children,
    ...props
}) => (
    <button
        className={`ui-button ui-button--${variant} ui-button--${size} ${fullWidth ? 'ui-button--full-width' : ''} ${className}`}
        disabled={disabled || loading}
        {...props}
    >
        {loading && <span className="ui-button__spinner" />}
        <span className="ui-button__content">{children}</span>
    </button>
);

export default Button;
