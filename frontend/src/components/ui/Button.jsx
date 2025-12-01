import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = React.forwardRef(({
    children,
    variant = 'primary',
    size = 'default',
    isLoading = false,
    className = '',
    disabled,
    ...props
}, ref) => {

    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-white";

    const variants = {
        primary: "bg-black text-white hover:bg-gray-800",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
        ghost: "hover:bg-gray-100 hover:text-gray-900",
        link: "text-black underline-offset-4 hover:underline",
    };

    const sizes = {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
    };

    return (
        <button
            ref={ref}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;
