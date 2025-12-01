import React from 'react';

const Input = React.forwardRef(({ label, error, className = '', ...props }, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                className={`w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent
                disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200
                transition duration-200 ease-in-out
                ${error ? 'border-red-500 focus:ring-red-500' : ''}
                ${className}`}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
