import React from 'react';
import './Card.scss';

export interface CardProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    icon?: string | React.ReactNode;
    className?: string;
    headerClassName?: string;
    contentClassName?: string;
    onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
    children,
    title,
    description,
    icon,
    className = '',
    headerClassName = '',
    contentClassName = '',
    onClick
}) => (
    <div className={`ui-card ${onClick ? 'ui-card--clickable' : ''} ${className}`} onClick={onClick}>
        {(title || description || icon) && (
            <div className={`ui-card__header ${headerClassName}`}>
                <div className="ui-card__header-content">
                    {icon && (
                        <div className="ui-card__icon">{typeof icon === 'string' ? <span>{icon}</span> : icon}</div>
                    )}
                    {(title || description) && (
                        <div className="ui-card__header-text">
                            {title && <h3 className="ui-card__title">{title}</h3>}
                            {description && <p className="ui-card__description">{description}</p>}
                        </div>
                    )}
                </div>
            </div>
        )}
        <div className={`ui-card__content ${contentClassName}`}>{children}</div>
    </div>
);

export default Card;
