import { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Calendar,
    Users,
    CheckCircle,
    Clock,
    Trophy,
    Activity
} from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/stats/dashboard');
            setStats(response.data.data);
        } catch (err) {
            setError('Failed to fetch dashboard statistics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        // Loading Skeleton
        <div className="space-y-8 animate-pulse">
            <div className="h-8 bg-white/5 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-white/5 rounded-2xl"></div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 h-64 bg-white/5 rounded-2xl"></div>
                <div className="h-64 bg-white/5 rounded-2xl"></div>
            </div>
        </div>
    );

    if (error) return <div className="text-red-400 text-center p-8 bg-red-900/20 rounded-xl border border-red-500/20">{error}</div>;
    if (!stats) return null;

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
                <div className="text-sm text-gray-400 flex items-center gap-2">
                    <Activity size={16} className="text-neon-green" />
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Events"
                    value={stats.counts?.events || 0}
                    icon={<Calendar size={24} />}
                    color="text-neon-purple"
                    bg="bg-neon-purple/10"
                />
                <StatCard
                    title="Total Participants"
                    value={stats.counts?.participants || 0}
                    icon={<Users size={24} />}
                    color="text-blue-400"
                    bg="bg-blue-500/10"
                />
                <StatCard
                    title="Checked In"
                    value={stats.counts?.checkedIn || 0}
                    icon={<CheckCircle size={24} />}
                    color="text-neon-green"
                    bg="bg-neon-green/10"
                />
                <StatCard
                    title="Pending"
                    value={stats.counts?.pending || 0}
                    icon={<Clock size={24} />}
                    color="text-gray-400"
                    bg="bg-gray-500/10"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 glass-card p-6">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                        <Clock size={20} className="text-neon-cyan" /> Recent Activity
                    </h2>

                    {stats.recentCheckIns?.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-gray-400 border-b border-white/10 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="pb-3 pl-2">Name</th>
                                        <th className="pb-3">Event</th>
                                        <th className="pb-3 text-right">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {stats.recentCheckIns.map((checkIn, index) => (
                                        <tr key={index} className="hover:bg-white/5 transition-colors group">
                                            <td className="py-3 pl-2 font-medium text-white group-hover:text-neon-cyan transition-colors">{checkIn.name}</td>
                                            <td className="py-3 text-gray-300 text-sm">{checkIn.event}</td>
                                            <td className="py-3 text-gray-400 font-mono text-xs text-right">
                                                {new Date(checkIn.time).toLocaleTimeString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                            <Clock size={48} className="opacity-20 mb-3" />
                            <p>No recent check-ins</p>
                        </div>
                    )}
                </div>

                {/* Top Events */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                        <Trophy size={20} className="text-yellow-400" /> Top Events
                    </h2>
                    <div className="space-y-6">
                        {stats.topEvents?.map((event, index) => (
                            <div key={index} className="space-y-2 group">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-white truncate max-w-[150px] group-hover:text-neon-green transition-colors">{event.eventName}</span>
                                    <span className="text-gray-400 text-xs">{event.checkedIn} / {event.total}</span>
                                </div>
                                <div className="h-2 w-full bg-dark-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-neon-green to-neon-cyan transition-all duration-1000 ease-out"
                                        style={{ width: `${(event.checkedIn / Math.max(event.total, 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                        {(!stats.topEvents || stats.topEvents.length === 0) && (
                            <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                                <Calendar size={48} className="opacity-20 mb-3" />
                                <p>No events data</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color, bg }) => (
    <div className="glass-card p-6 flex items-center justify-between hover:bg-white/10 transition-all duration-300 cursor-default group border border-white/5 hover:border-white/20">
        <div>
            <p className="text-gray-400 text-sm font-medium mb-1 tracking-wide">{title}</p>
            <p className={`text-3xl font-bold ${color} group-hover:scale-105 transition-transform`}>{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${bg} ${color} bg-opacity-20 group-hover:bg-opacity-30 transition-all shadow-lg`}>
            {icon}
        </div>
    </div>
);

export default Dashboard;
