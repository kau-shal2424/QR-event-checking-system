import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Search/Filter/Pagination State
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Upload State
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [uploadResult, setUploadResult] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        fetchEventDetails();
        fetchParticipants();
    }, [id, page, status]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (page !== 1) setPage(1);
            else fetchParticipants();
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchEventDetails = async () => {
        try {
            const response = await api.get(`/events/${id}`);
            setEvent(response.data.data);
        } catch (err) {
            setError('Failed to fetch event details');
        }
    };

    const fetchParticipants = async () => {
        try {
            const params = {
                page,
                limit: 20,
                search,
                status: status === 'all' ? undefined : status
            };
            const response = await api.get(`/participants/event/${id}`, { params });
            setParticipants(response.data.data);
            if (response.data.pagination) {
                setTotalPages(response.data.pagination.pages);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const processFile = (selectedFile) => {
        if (selectedFile) {
            setFile(selectedFile);
            setUploadResult(null);

            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target.result;
                const lines = text.split('\n').filter(line => line.trim() !== '');
                if (lines.length > 0) {
                    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
                    const preview = lines.slice(1).map((line, index) => {
                        const values = line.split(',');
                        const row = headers.reduce((obj, header, i) => {
                            obj[header] = values[i]?.trim();
                            return obj;
                        }, { _originalIndex: index }); // Track index
                        return row;
                    });

                    // Mark internal duplicates
                    const emails = new Set();
                    const ids = new Set();
                    const markedPreview = preview.map(row => {
                        let isDuplicate = false;
                        if (row.email && emails.has(row.email)) isDuplicate = true;
                        if (row.studentid && ids.has(row.studentid)) isDuplicate = true; // lowercase headers assumption

                        if (row.email) emails.add(row.email);
                        if (row.studentid) ids.add(row.studentid);

                        return { ...row, _isDuplicate: isDuplicate };
                    });

                    setPreviewData(markedPreview.slice(0, 10)); // Show top 10
                }
            };
            reader.readAsText(selectedFile);
            setShowUpload(true);
        }
    };

    const onDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => {
        setIsDragging(false);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile?.type === 'text/csv' || droppedFile?.name.endsWith('.csv')) {
            processFile(droppedFile);
        } else {
            alert('Please upload a CSV file');
        }
    };

    const handleFileChange = (e) => {
        processFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post(`/participants/upload/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUploadResult(response.data);
            setFile(null);
            setPreviewData([]);
            // Don't close immediately so user sees success
            fetchParticipants();
        } catch (err) {
            setUploadResult({
                success: false,
                message: err.response?.data?.message || 'Upload failed',
                duplicates: err.response?.data?.duplicates || 0
            });
        } finally {
            setUploading(false);
        }
    };

    if (loading && !event) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div></div>;
    if (!event) return <div className="text-white text-center p-8">Event not found</div>;

    const tabs = [
        { id: 'all', label: 'All Participants' },
        { id: 'checkedIn', label: 'Checked In' },
        { id: 'notCheckedIn', label: 'Pending' },
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <div>
                <button onClick={() => navigate('/events')} className="text-gray-500 hover:text-white flex items-center gap-2 transition-colors mb-4 text-sm font-medium">
                    <span>←</span> To Events
                </button>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">{event.name}</h1>
                        <div className="flex items-center gap-4 text-gray-400 text-sm">
                            <span className="flex items-center gap-1.5">📅 {new Date(event.dateTime).toLocaleString()}</span>
                            <span className="flex items-center gap-1.5">📍 {event.location}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowUpload(!showUpload)}
                        className={`btn btn-primary flex items-center gap-2 shadow-lg shadow-neon-green/20 ${showUpload ? 'bg-red-500/80 hover:bg-red-500' : ''}`}
                    >
                        <span>{showUpload ? '✕' : '📤'}</span> {showUpload ? 'Close Upload' : 'Import Participants'}
                    </button>
                </div>
            </div>

            {/* Upload Modal (Inline) */}
            {showUpload && (
                <div className="glass-card p-8 animate-fade-in-down border-dashed border-2 border-neon-cyan/30 relative">
                    {!file ? (
                        <div
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                            className={`flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-2xl transition-all duration-300 ${isDragging
                                ? 'border-neon-green bg-neon-green/10 scale-[1.02]'
                                : 'border-white/10 hover:border-white/30 bg-black/20'
                                }`}
                        >
                            <div className={`text-6xl mb-4 transition-transform duration-500 ${isDragging ? 'animate-bounce' : ''}`}>
                                📂
                            </div>
                            <p className="text-xl font-bold text-white mb-2">Drag & Drop CSV File</p>
                            <p className="text-gray-400 mb-6 text-sm">or click to browse from your computer</p>
                            <label className="btn btn-secondary cursor-pointer">
                                Browse File
                                <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
                            </label>
                            <p className="text-xs text-gray-600 mt-4">Accepted format: .csv (Name, Email, StudentID)</p>
                        </div>
                    ) : (
                        <div className="animate-fade-in-up">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                    <span className="text-neon-green">📄</span> {file.name}
                                </h3>
                                <button onClick={() => { setFile(null); setPreviewData([]); setUploadResult(null); }} className="text-red-400 text-sm hover:underline">
                                    Remove File
                                </button>
                            </div>

                            {/* Preview Table */}
                            {previewData.length > 0 && (
                                <div className="mb-6 overflow-hidden rounded-xl border border-white/10">
                                    <div className="p-3 bg-white/5 border-b border-white/10 flex justify-between items-center">
                                        <span className="text-xs font-bold uppercase text-gray-400">Preview (First 10 rows)</span>
                                        <span className="text-xs text-orange-400">* Red rows indicate internal duplicates</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-black/20 text-gray-500">
                                                <tr>
                                                    {Object.keys(previewData[0]).filter(k => !k.startsWith('_')).map(k => (
                                                        <th key={k} className="px-4 py-2 capitalize">{k}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {previewData.map((row, i) => (
                                                    <tr key={i} className={row._isDuplicate ? 'bg-red-500/10 text-red-200' : 'hover:bg-white/5 text-gray-300'}>
                                                        {Object.entries(row).filter(([k]) => !k.startsWith('_')).map(([k, v], j) => (
                                                            <td key={j} className="px-4 py-2">{v}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    className="btn bg-gradient-to-r from-neon-green to-neon-cyan text-dark-900 font-bold px-8 shadow-lg shadow-neon-green/20 hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
                                >
                                    {uploading ? 'Processing...' : `Confirm Import`}
                                </button>
                                <button
                                    onClick={() => setFile(null)}
                                    disabled={uploading}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Success/Error Banner */}
                    {uploadResult && (
                        <div className={`mt-6 p-4 rounded-xl border flex items-center justify-between animate-fade-in-up ${uploadResult.success
                            ? 'bg-green-500/10 border-green-500/30 text-green-300'
                            : 'bg-red-500/10 border-red-500/30 text-red-300'
                            }`}>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{uploadResult.success ? '✅' : '⚠️'}</span>
                                <div>
                                    <p className="font-bold">{uploadResult.message}</p>
                                    {uploadResult.data && (
                                        <p className="text-sm mt-1 opacity-80">
                                            Successfully added: <span className="font-bold text-white">{uploadResult.data.inserted}</span> participants.
                                        </p>
                                    )}
                                    {uploadResult.duplicates > 0 && (
                                        <p className="text-sm mt-0.5 opacity-80">
                                            Skipped <span className="font-bold text-white">{uploadResult.duplicates}</span> duplicate entries.
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => setUploadResult(null)} className="text-sm hover:underline opacity-60 hover:opacity-100">Dismiss</button>
                        </div>
                    )}
                </div>
            )}

            {/* Main Content (Stats + List) - Simplified for brevity effectively reused code from previous step, but maintaining the rest of UI */}
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 flex flex-col items-center justify-center border-t-2 border-t-blue-500 hover:bg-white/5 transition-colors">
                    <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total</span>
                    <span className="text-3xl font-bold text-blue-400 mt-2">{totalPages * 20}</span> {/* Mock logic for total */}
                </div>
                <div className="glass-card p-6 flex flex-col items-center justify-center border-t-2 border-t-neon-green hover:bg-white/5 transition-colors">
                    <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Checked In</span>
                    <span className="text-3xl font-bold text-neon-green mt-2">-</span>
                </div>
                <div className="glass-card p-6 flex flex-col items-center justify-center border-t-2 border-t-yellow-500 hover:bg-white/5 transition-colors">
                    <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Pending</span>
                    <span className="text-3xl font-bold text-yellow-500 mt-2">-</span>
                </div>
            </div>

            {/* Filter Chips & Search */}
            <div className="glass-card p-1">
                <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex bg-dark-800 p-1 rounded-xl">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setStatus(tab.id); setPage(1); }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${status === tab.id
                                    ? 'bg-dark-700 text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-auto">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
                        <input
                            type="text"
                            placeholder="Search by name, email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input-field pl-10 py-2 text-sm w-full md:w-80 bg-dark-800 border-transparent focus:bg-dark-900"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-t border-white/5">
                        <thead className="bg-white/5 text-gray-400 text-xs uppercase font-semibold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Participant</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Check-in Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {participants.map(p => (
                                <tr key={p._id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-white group-hover:text-neon-cyan transition-colors">{p.name || 'Unknown'}</p>
                                        <p className="text-xs text-gray-500 font-mono mt-0.5">{p.studentId}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400">{p.email}</td>
                                    <td className="px-6 py-4">
                                        {p.checkedIn ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neon-green/10 text-neon-green border border-neon-green/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-neon-green"></span> Checked In
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span> Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 mono">
                                        {p.checkedInAt ? new Date(p.checkedInAt).toLocaleTimeString() : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-white/5 flex justify-between items-center bg-dark-800/30 rounded-b-2xl">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="text-gray-400 hover:text-white disabled:opacity-30 text-sm font-medium px-2"
                        >
                            Previous
                        </button>
                        <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="text-gray-400 hover:text-white disabled:opacity-30 text-sm font-medium px-2"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventDetails;
