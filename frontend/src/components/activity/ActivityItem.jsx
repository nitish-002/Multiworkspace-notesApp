import React from 'react';

const ActivityItem = ({ activity }) => {
    const getActionColor = (type) => {
        if (type.includes('CREATED')) return 'bg-green-100 text-green-800';
        if (type.includes('UPDATED')) return 'bg-blue-100 text-blue-800';
        if (type.includes('DELETED') || type.includes('REMOVED')) return 'bg-red-100 text-red-800';
        return 'bg-gray-100 text-gray-800';
    };

    const getIcon = (type) => {
        // Simple icon mapping based on action type string
        if (type.includes('notebook')) return '📝';
        if (type.includes('workspace')) return '🏢';
        if (type.includes('member')) return 'busts_in_silhouette';
        if (type.includes('label')) return '🏷️';
        return '📋';
    };

    const getRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="flex items-start space-x-3 py-3 border-b border-gray-100 last:border-0">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs ${getActionColor(activity.action_type)}`}>
                {getIcon(activity.action_type)}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                    {activity.actor ? (
                        <span className="font-bold">{activity.actor.first_name || activity.actor.email}</span>
                    ) : (
                        <span className="italic text-gray-500">System</span>
                    )}
                    {' '}
                    <span className="font-normal text-gray-600">
                        {activity.action_type.toLowerCase()}
                    </span>
                    {' '}
                    <span className="font-medium text-indigo-600">
                        {activity.target_title}
                    </span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                    {getRelativeTime(activity.created_at)}
                </p>
                {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="mt-1 text-xs text-gray-500 bg-gray-50 p-1.5 rounded">
                        {Object.entries(activity.metadata).map(([key, value]) => (
                            <div key={key}>
                                <span className="font-medium">{key.replace('_', ' ')}:</span> {value}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityItem;
