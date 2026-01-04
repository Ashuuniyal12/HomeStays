import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
    className?: string;
    size?: number;
    color?: string;
}

const Loader: React.FC<LoaderProps> = ({ className = "", size = 24, color = "currentColor" }) => {
    return (
        <Loader2
            className={`animate-spin ${className}`}
            size={size}
            color={color}
        />
    );
};

export default Loader;
