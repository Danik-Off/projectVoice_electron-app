import React from 'react';
import './Slider.scss';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    helperText?: string;
    showValue?: boolean;
    valueLabel?: string;
    fullWidth?: boolean;
}

const Slider: React.FC<SliderProps> = ({
    label,
    helperText,
    showValue = true,
    valueLabel,
    fullWidth = false,
    className = '',
    id,
    value,
    ...props
}) => {
    const sliderId = id || `slider-${Math.random().toString(36).substr(2, 9)}`;
    const displayValue = valueLabel || (typeof value === 'number' ? `${value}%` : value);

    return (
        <div className={`ui-slider ${fullWidth ? 'ui-slider--full-width' : ''} ${className}`}>
            {label && (
                <div className="ui-slider__header">
                    <label htmlFor={sliderId} className="ui-slider__label">
                        {label}
                    </label>
                    {showValue && <span className="ui-slider__value">{displayValue}</span>}
                </div>
            )}
            <div className="ui-slider__container">
                <input
                    type="range"
                    id={sliderId}
                    className={`ui-slider__field ${className}`}
                    value={value}
                    {...props}
                />
            </div>
            {helperText && <span className="ui-slider__helper">{helperText}</span>}
        </div>
    );
};

export default Slider;
