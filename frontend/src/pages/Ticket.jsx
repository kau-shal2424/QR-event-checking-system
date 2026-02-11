import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const Ticket = () => {
    const { id } = useParams();
    const [participant, setParticipant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const ticketRef = useRef(null);

    useEffect(() => {
        const fetchParticipant = async () => {
            try {
                const response = await api.get(`/participants/${id}`);
                setParticipant(response.data.data);
            } catch (err) {
                setError('Ticket not found or invalid link');
            } finally {
                setLoading(false);
            }
        };
        fetchParticipant();
    }, [id]);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${participant.eventId.name} Ticket`,
                    text: `Here is my ticket for ${participant.eventId.name}`,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            alert('Share URL copied to clipboard!');
            navigator.clipboard.writeText(window.location.href);
        }
    };

    const handleDownload = () => {
        // Use a library or canvas to download. 
        // Simple hack: Download current view? 
        // Or just the QR code? 
        // User asked for "Download QR button".
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${participant.qrToken}`;

        // Trigger download
        const link = document.createElement('a');
        link.href = qrUrl;
        link.download = `ticket-${participant.studentId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // Note: Direct download from cross-origin might be blocked by browser. 
        // Better: Fetch blob and download.
        fetch(qrUrl)
            .then(res => res.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `ticket-${participant.studentId}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            })
            .catch(err => alert('Could not download QR'));
    };

    if (loading) return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center text-white">
            <div className="text-center p-8">
                <div className="text-6xl mb-4">😕</div>
                <h1 className="text-2xl font-bold mb-2">Oops!</h1>
                <p className="text-gray-400">{error}</p>
            </div>
        </div>
    );

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${participant.qrToken}&color=0f172a&bgcolor=10b981`;
    // Custom color: dark QR on neon green background for cool effect? 
    // Or standard black on white for reliability.
    // Let's stick to standard black on white or transparent for glass effect. 
    // API supports color/bgcolor.
    // Let's do standard Black on White for maximum scan reliability.
    const reliableQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${participant.qrToken}&margin=10`;

    return (
        <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background Blobs */}
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-neon-purple/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-neon-cyan/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div ref={ticketRef} className="glass-card w-full max-w-sm overflow-hidden relative z-10 animate-fade-in-up border border-white/10 shadow-2xl">
                {/* Event Header */}
                <div className="bg-gradient-to-r from-neon-green/90 to-neon-cyan/90 p-6 text-center shadow-lg">
                    <h1 className="text-2xl font-extrabold text-dark-900 tracking-tight uppercase">
                        {participant.eventId.name || 'Event Ticket'}
                    </h1>
                    <p className="text-dark-900/80 font-medium text-sm mt-1 flex items-center justify-center gap-1">
                        <span>📍 {participant.eventId.location}</span>
                        <span>•</span>
                        <span>📅 {new Date(participant.eventId.dateTime).toLocaleDateString()}</span>
                    </p>
                </div>

                {/* QR Section */}
                <div className="p-8 flex flex-col items-center bg-white/5 backdrop-blur-3xl">
                    <div className="bg-white p-2 rounded-2xl shadow-xl shadow-neon-green/10 mb-6 group hover:scale-105 transition-transform duration-300">
                        <img
                            src={reliableQrUrl}
                            alt="Ticket QR Code"
                            className="w-48 h-48 md:w-56 md:h-56 object-contain rounded-xl"
                        />
                    </div>

                    <div className="text-center space-y-1">
                        <h2 className="text-2xl font-bold text-white tracking-wide">{participant.name}</h2>
                        <p className="text-neon-cyan font-mono text-lg">{participant.studentId}</p>
                        <p className="text-gray-400 text-sm">{participant.email}</p>
                    </div>

                    {/* Status Badge */}
                    <div className="mt-6">
                        {participant.checkedIn ? (
                            <div className="bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                ✅ Checked In
                            </div>
                        ) : (
                            <div className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                ⏳ Ready for Check-in
                            </div>
                        )}
                    </div>
                </div>

                {/* Instructions */}
                <div className="px-8 pb-8 pt-2 text-center">
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Please present this QR code at the entrance.<br />Do not share this ticket with others.
                    </p>
                </div>

                {/* Dashed Line */}
                <div className="relative h-1 w-full my-0">
                    <div className="absolute left-0 top-[-10px] w-6 h-6 bg-dark-900 rounded-full -ml-3"></div>
                    <div className="absolute right-0 top-[-10px] w-6 h-6 bg-dark-900 rounded-full -mr-3"></div>
                    <div className="border-t-2 border-dashed border-gray-600/30 w-full absolute top-1/2"></div>
                </div>

                {/* Actions */}
                <div className="p-6 bg-white/5 flex gap-4">
                    <button
                        onClick={handleDownload}
                        className="flex-1 btn bg-white/10 hover:bg-white/20 text-white border border-white/5 text-sm py-3 flex items-center justify-center gap-2"
                    >
                        <span>📥</span> Download
                    </button>
                    <button
                        onClick={handleShare}
                        className="flex-1 btn bg-neon-green/10 hover:bg-neon-green/20 text-neon-green border border-neon-green/20 text-sm py-3 flex items-center justify-center gap-2"
                    >
                        <span>🔗</span> Share
                    </button>
                </div>
            </div>

            <p className="mt-6 text-gray-600 text-xs text-center max-w-xs">
                Powered by QR Check-in System<br />&copy; 2024
            </p>
        </div>
    );
};

export default Ticket;
