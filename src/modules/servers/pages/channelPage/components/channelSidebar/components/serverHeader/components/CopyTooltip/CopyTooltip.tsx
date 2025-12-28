import React from 'react';
import { useTranslation } from 'react-i18next';
import './CopyTooltip.scss';

interface CopyTooltipProps {
    show: boolean;
    tooltipRef?: React.RefObject<HTMLDivElement | null>;
}

const CopyTooltip: React.FC<CopyTooltipProps> = ({ show, tooltipRef }) => {
    const { t } = useTranslation();

    if (!show) return null;

    return (
        <div className="copy-tooltip" ref={tooltipRef}>
            <span className="tooltip-icon">✅</span>
            <span className="tooltip-text">{t('serverHeader.linkCopied')}</span>
        </div>
    );
};

export default CopyTooltip;

