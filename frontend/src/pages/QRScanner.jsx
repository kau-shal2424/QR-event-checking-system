import { useState, useEffect, useRef } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import api from '../services/api';

const QRScanner = () => {
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [scanResult, setScanResult] = useState(null);
    const [points, setPoints] = useState(''); // Manually entered points/code
    const [isScanning, setIsScanning] = useState(true);
    const [manualMode, setManualMode] = useState(false);
    const [feedbackEnabled, setFeedbackEnabled] = useState(true);
    const [loading, setLoading] = useState(false);

    const videoRef = useRef(null);
    const codeReader = useRef(new BrowserMultiFormatReader());
    const audioRef = useRef(new Audio('/beep.mp3')); // Assuming beep.mp3 exists in public or using synthetic

    useEffect(() => {
        fetchEvents();
        return () => {
            codeReader.current.reset();
        };
    }, []);

    useEffect(() => {
        if (selectedEventId && isScanning && !manualMode) {
            startScanning();
        } else {
            codeReader.current.reset();
        }
    }, [selectedEventId, isScanning, manualMode]);

    const fetchEvents = async () => {
        try {
            const response = await api.get('/events');
            if (response.data.data.length > 0) {
                setEvents(response.data.data);
                setSelectedEventId(response.data.data[0]._id);
            }
        } catch (err) {
            console.error("Failed to fetch events");
        }
    };

    const startScanning = async () => {
        try {
            const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
            const selectedDeviceId = videoInputDevices[0].deviceId; // Default to first (usually back cam on mobile if configured, or need logic)
            // Zxing browser usually picks result. 
            // Better to use decodeFromVideoDevice

            await codeReader.current.decodeFromVideoDevice(
                undefined, // undefined selects default, usually environment facing on mobile
                videoRef.current,
                (result, err) => {
                    if (result) {
                        handleScan(result.getText());
                    }
                }
            );
        } catch (err) {
            console.error(err);
        }
    };

    const handleScan = async (code) => {
        if (!isScanning) return; // Prevent multiple scans
        stopScanning();
        playFeedback();

        // Mock processing or real API
        await processCheckIn(code);
    };

    const processCheckIn = async (code) => {
        setLoading(true);
        // Extract studentId from code if it's a JSON or URL, assuming raw ID for now
        // If code is URL "http://.../checkin/ID", extract ID.
        // For simplicity: assume code IS the studentId or email.
        const studentId = code;

        try {
            const response = await api.post('/participants/checkin', {
                eventId: selectedEventId,
                studentId: studentId
            });
            setScanResult({ success: true, data: response.data.data });
        } catch (err) {
            setScanResult({
                success: false,
                message: err.response?.data?.message || 'Check-in failed',
                code: studentId
            });
        } finally {
            setLoading(false);
        }
    };

    const stopScanning = () => {
        setIsScanning(false);
        codeReader.current.reset();
    };

    const resumeScanning = () => {
        setScanResult(null);
        setPoints('');
        setManualMode(false);
        setIsScanning(true);
    };

    const playFeedback = () => {
        if (!feedbackEnabled) return;
        if (navigator.vibrate) navigator.vibrate(200);
        // Simple beep using Web Audio API if no file
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        osc.frequency.value = 800;
        osc.connect(ctx.destination);
        osc.start();
        osc.stop(0.1);
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        handleScan(points);
    };

    return (
        <div className="fixed inset-0 bg-black overflow-hidden flex flex-col font-sans">
            {/* 1. Fullscreen Camera Layer */}
            <div className="absolute inset-0 z-0">
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover opacity-80"
                />
                {!isScanning && !manualMode && !scanResult && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                        <p className="text-gray-400">Camera Paused</p>
                    </div>
                )}
            </div>

            {/* 2. Top Bar (Event Selector) */}
            <div className="relative z-20 pt-12 pb-4 px-4 bg-gradient-to-b from-black/90 to-transparent">
                <div className="glass-card p-2 flex items-center gap-2">
                    <span className="text-neon-green pl-2 text-xl">📅</span>
                    <select
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                        className="bg-transparent text-white font-medium text-lg w-full focus:outline-none py-1 [&>option]:bg-dark-900"
                    >
                        {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                        {events.length === 0 && <option>Loading Events...</option>}
                    </select>
                    <div className="pointer-events-none pr-2 text-gray-400">▼</div>
                </div>
            </div>

            {/* 3. Empty State / Manual Mode Layer */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">

                {/* Scanning Overlay (Frame) */}
                {!manualMode && !scanResult && isScanning && (
                    <div className="relative w-72 h-72 border-2 border-white/20 rounded-3xl overflow-hidden mt-[-10vh]">
                        {/* Corners */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-neon-green rounded-tl-xl"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-neon-green rounded-tr-xl"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-neon-green rounded-bl-xl"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-neon-green rounded-br-xl"></div>

                        {/* Scan Line Animation */}
                        <div className="absolute w-full h-[2px] bg-neon-green shadow-[0_0_20px_rgba(16,185,129,0.8)] animate-scan-line"></div>

                        <p className="absolute bottom-[-40px] w-full text-center text-white/80 font-medium text-sm animate-pulse">
                            Align QR code within frame
                        </p>
                    </div>
                )}

                {/* Manual Entry Form */}
                {manualMode && !scanResult && (
                    <div className="w-full max-w-sm glass-card p-6 animate-fade-in-up">
                        <h2 className="text-xl font-bold text-white mb-4 text-center">Manual Entry</h2>
                        <form onSubmit={handleManualSubmit}>
                            <input
                                type="text"
                                value={points}
                                onChange={(e) => setPoints(e.target.value)}
                                className="input-field mb-4 text-center text-lg tracking-wider"
                                placeholder="Enter ID / Email"
                                autoFocus
                            />
                            <button type="submit" className="btn btn-primary w-full py-3 text-lg font-bold">
                                Check In
                            </button>
                            <button
                                type="button"
                                onClick={() => setManualMode(false)}
                                className="mt-4 w-full text-gray-400 text-sm py-2"
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* 4. Bottom Controls */}
            {!scanResult && !manualMode && (
                <div className="relative z-20 p-8 pb-12 flex justify-center items-end gap-8 bg-gradient-to-t from-black/90 to-transparent">
                    <button
                        onClick={() => setFeedbackEnabled(!feedbackEnabled)}
                        className={`p-4 rounded-full backdrop-blur-md transition-all ${feedbackEnabled ? 'bg-white/10 text-neon-green' : 'bg-black/40 text-gray-500'
                            }`}
                    >
                        {feedbackEnabled ? '🔊' : '🔇'}
                    </button>

                    {/* Shutter Button (Pause/Resume) */}
                    <button
                        onClick={() => isScanning ? stopScanning() : resumeScanning()}
                        className={`w-20 h-20 rounded-full border-4 flex items-center justify-center shadow-lg transition-all transform active:scale-95 ${isScanning
                            ? 'border-neon-green bg-transparent lg:hover:bg-neon-green/10'
                            : 'border-red-500 bg-red-500/20 text-red-500'
                            }`}
                    >
                        {isScanning ? (
                            <div className="w-14 h-14 rounded-full bg-neon-green/20"></div> // Stop Style
                        ) : (
                            <div className="text-3xl">▶</div>
                        )}
                    </button>

                    <button
                        onClick={() => { stopScanning(); setManualMode(true); }}
                        className="p-4 rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-all"
                    >
                        ⌨️
                    </button>
                </div>
            )}

            {/* 5. Result Overlay (Success/Error) */}
            {scanResult && (
                <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center p-8 backdrop-blur-xl animate-fade-in-up ${scanResult.success ? 'bg-green-900/40' : 'bg-red-900/40'
                    }`}>
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 shadow-2xl ${scanResult.success ? 'bg-gradient-to-tr from-green-500 to-emerald-400' : 'bg-gradient-to-tr from-red-500 to-pink-600'
                        }`}>
                        <span className="text-6xl text-white">
                            {scanResult.success ? '✓' : '✕'}
                        </span>
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-2 text-center">
                        {scanResult.success ? 'Checked In!' : 'Error'}
                    </h2>

                    <p className="text-lg text-gray-200 mb-8 text-center max-w-xs">
                        {scanResult.success
                            ? scanResult.data?.name || scanResult.data?.studentId
                            : scanResult.message}
                    </p>

                    {scanResult.success && (
                        <div className="glass-card p-4 mb-8 w-full max-w-sm">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">Time</span>
                                <span className="text-white">{new Date().toLocaleTimeString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">ID</span>
                                <span className="text-white font-mono">{scanResult.data?.studentId}</span>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={resumeScanning}
                        className="btn w-full max-w-xs bg-white text-dark-900 font-bold py-4 rounded-xl shadow-xl hover:scale-105 transition-transform"
                    >
                        Scan Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default QRScanner;
