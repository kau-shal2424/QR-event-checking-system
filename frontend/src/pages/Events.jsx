import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Events = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        dateTime: '',
        location: ''
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await api.get('/events');
            setEvents(response.data.data);
        } catch (err) {
            setError('Failed to fetch events');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        try {
            await api.delete(`/events/${id}`);
            setEvents(events.filter(e => e._id !== id));
        } catch (err) {
            alert('Failed to delete event');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingEvent) {
                const response = await api.put(`/events/${editingEvent._id}`, formData);
                setEvents(events.map(e => e._id === editingEvent._id ? response.data.data : e));
            } else {
                const response = await api.post('/events', formData);
                setEvents([response.data.data, ...events]);
            }
            resetForm();
        } catch (err) {
            alert(err.response?.data?.message || 'Operation failed');
        }
    };

    const startEdit = (event) => {
        setEditingEvent(event);
        setFormData({
            name: event.name,
            slug: event.slug,
            dateTime: new Date(event.dateTime).toISOString().slice(0, 16),
            location: event.location
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({ name: '', slug: '', dateTime: '', location: '' });
        setEditingEvent(null);
        setShowForm(false);
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
        </div>
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Events</h1>
                    <p className="text-gray-400 mt-1">Manage your upcoming and past events</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn bg-gradient-to-r from-neon-green to-neon-cyan text-dark-900 font-bold shadow-lg shadow-neon-green/20 flex items-center gap-2"
                    >
                        <span className="text-xl">+</span> Create New Event
                    </button>
                )}
            </div>

            {/* Creation Form Card */}
            {showForm && (
                <div className="glass-card p-8 animate-fade-in-down relative overflow-hidden border border-white/10 shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-50 text-9xl leading-none text-white/5 pointer-events-none select-none">
                        ✎
                    </div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">
                                {editingEvent ? 'Edit Event' : 'Create New Event'}
                            </h2>
                            <button onClick={resetForm} className="text-gray-400 hover:text-white transition-colors">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400 ml-1">Event Name</label>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-neon-green transition-colors">📝</span>
                                        <input
                                            className="input-field pl-12 bg-dark-800/50 focus:bg-dark-800"
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            placeholder="Eg. Tech Summit 2024"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400 ml-1">Slug (URL)</label>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-neon-cyan transition-colors">🔗</span>
                                        <input
                                            className="input-field pl-12 bg-dark-800/50 focus:bg-dark-800 font-mono text-sm"
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            required
                                            placeholder="tech-summit-2024"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400 ml-1">Date & Time</label>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-neon-purple transition-colors">📅</span>
                                        <input
                                            className="input-field pl-12 bg-dark-800/50 focus:bg-dark-800"
                                            type="datetime-local"
                                            value={formData.dateTime}
                                            onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400 ml-1">Location</label>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-400 transition-colors">📍</span>
                                        <input
                                            className="input-field pl-12 bg-dark-800/50 focus:bg-dark-800"
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            required
                                            placeholder="Main Auditorium"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-4 border-t border-white/5 mt-4">
                                <button
                                    type="submit"
                                    className="btn bg-gradient-to-r from-neon-green to-neon-cyan text-dark-900 font-bold px-8 shadow-lg shadow-neon-green/20 hover:scale-105 transition-transform"
                                >
                                    {editingEvent ? 'Update Event' : 'Create Event'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="btn btn-secondary px-6"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl flex items-center gap-3">⚠️ {error}</div>}

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map(event => (
                    <div key={event._id} className="glass-card group hover:bg-white/10 transition-all duration-300 flex flex-col h-full border border-white/5 hover:border-white/10">
                        <div className="p-6 flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-white group-hover:text-neon-cyan transition-colors">{event.name}</h3>
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-lg">
                                    🗓️
                                </div>
                            </div>

                            <div className="space-y-3 text-sm text-gray-400">
                                <p className="flex items-center gap-3">
                                    <span className="text-gray-600">🕒</span> {new Date(event.dateTime).toLocaleString()}
                                </p>
                                <p className="flex items-center gap-3">
                                    <span className="text-gray-600">📍</span> {event.location}
                                </p>
                                <p className="flex items-center gap-3">
                                    <span className="text-gray-600">🔗</span> <span className="font-mono text-xs bg-black/20 px-1.5 py-0.5 rounded text-gray-500">{event.slug}</span>
                                </p>
                            </div>
                        </div>

                        <div className="p-4 border-t border-white/5 bg-black/20 flex gap-3">
                            <button
                                onClick={() => navigate(`/events/${event._id}`)}
                                className="flex-1 btn bg-white/5 hover:bg-neon-green/10 hover:text-neon-green text-sm py-2 border border-transparent hover:border-neon-green/30"
                            >
                                View Details
                            </button>
                            <button
                                onClick={() => startEdit(event)}
                                className="px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                ✏️
                            </button>
                            <button
                                onClick={() => handleDelete(event._id)}
                                className="px-3 py-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
                {events.length === 0 && !loading && !showForm && (
                    <div className="col-span-full py-20 text-center text-gray-500 bg-white/5 rounded-3xl border border-dashed border-gray-700 flex flex-col items-center">
                        <div className="text-4xl mb-4 grayscale opacity-50">📅</div>
                        <p className="text-lg font-medium text-gray-400">No events yet</p>
                        <p className="text-sm mb-6">Create your first event to get started</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="btn btn-secondary"
                        >
                            Create Event
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Events;
