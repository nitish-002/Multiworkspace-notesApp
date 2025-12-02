import React from 'react';

const LabelBadge = ({ label, onDelete }) => {
    return (
        <span
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-2 mb-2"
            style={{ backgroundColor: `${label.color}20`, color: label.color, border: `1px solid ${label.color}` }}
        >
            {label.name}
            {onDelete && (
                <button
                    onClick={() => onDelete(label.id)}
                    className="ml-1 hover:text-red-700 focus:outline-none"
                    aria-label={`Remove ${label.name} label`}
                >
                    &times;
                </button>
            )}
        </span>
    );
};

export default LabelBadge;
