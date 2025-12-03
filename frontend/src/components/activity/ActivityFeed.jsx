import React, { useState, useEffect } from 'react';
import ActivityItem from './ActivityItem';

const ActivityFeed = ({ fetchActivity, resourceId, title = "Activity Feed" }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        loadActivity();
    }, [resourceId, filter]);

    const loadActivity = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filter) params.action_type = filter;

            const response = await fetchActivity(resourceId, params);
            // Handle pagination response vs list response
            const data = response.data.results ? response.data.results : response.data;
            setActivities(data);
            setError(null);
        } catch (err) {
            console.error("Failed to load activity:", err);
            setError("Failed to load activity feed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                <button
                    onClick={loadActivity}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                    Refresh
                </button>
            </div>

            {loading && activities.length === 0 ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : error ? (
                <div className="text-red-500 text-sm">{error}</div>
            ) : activities.length === 0 ? (
                <div className="text-gray-500 text-center py-8">No recent activity.</div>
            ) : (
                <div className="flow-root">
                    <div className="-my-4 divide-y divide-gray-200">
                        {activities.map((activity) => (
                            <ActivityItem key={activity.id} activity={activity} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActivityFeed;
