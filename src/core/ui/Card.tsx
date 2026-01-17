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

/* eslint-disable complexity */
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
    <div className={`ui-card ${onClick != null ? 'ui-card--clickable' : ''} ${className}`} onClick={onClick}>
        {(title != null && title !== '') || (description != null && description !== '') || icon != null ? (
            <div className={`ui-card__header ${headerClassName}`}>
                <div className="ui-card__header-content">
                    {icon != null ? (
                        <div className="ui-card__icon">{typeof icon === 'string' ? <span>{icon}</span> : icon}</div>
                    ) : null}
                    {(title != null && title !== '') || (description != null && description !== '') ? (
                        <div className="ui-card__header-text">
                            {title != null && title !== '' ? <h3 className="ui-card__title">{title}</h3> : null}
                            {description != null && description !== '' ? (
                                <p className="ui-card__description">{description}</p>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            </div>
        ) : null}
        <div className={`ui-card__content ${contentClassName}`}>{children}</div>
    </div>
);

export default Card;
