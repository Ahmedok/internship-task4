import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { type ReactElement } from 'react';

interface TooltipProps {
    text: string;
    children: ReactElement;
    placement?: 'top' | 'bottom' | 'left' | 'right';
}

export default function TooltipWrapper({ text, children, placement = 'top' }: TooltipProps) {
    return (
        <OverlayTrigger
            placement={placement}
            overlay={<Tooltip id={`tooltip-${text}`}>{text}</Tooltip>}
            transition={false}
        >
            {children}
        </OverlayTrigger>
    );
}
