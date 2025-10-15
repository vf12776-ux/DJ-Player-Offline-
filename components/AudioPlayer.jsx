import React, { useState, useRef, useEffect } from 'react';

// Глобальная переменная для хранения текущего аудио
let currentAudio = null;

const AudioPlayer = ({ track }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef(null);

    useEffect(() => {
        const audio = audioRef.current;
        
        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handleEnd = () => {
            setIsPlaying(false);
            currentAudio = null;
        };

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnd);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnd);
        };
    }, []);

    const togglePlay = () => {
        if (isPlaying) {
            // Пауза текущего трека
            audioRef.current.pause();
            setIsPlaying(false);
            if (currentAudio === audioRef.current) {
                currentAudio = null;
            }
        } else {
            // Останавливаем предыдущий трек
            if (currentAudio && currentAudio !== audioRef.current) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
                
                // Сбрасываем состояние у других плееров
                const event = new CustomEvent('trackStopped');
                window.dispatchEvent(event);
            }
            
            // Запускаем текущий трек
            audioRef.current.play()
                .then(() => {
                    setIsPlaying(true);
                    currentAudio = audioRef.current;
                })
                .catch(error => {
                    console.error('Error playing audio:', error);
                });
        }
    };

    // Слушаем событие остановки других треков
    useEffect(() => {
        const handleTrackStopped = () => {
            if (!isPlaying) return;
            setIsPlaying(false);
        };

        window.addEventListener('trackStopped', handleTrackStopped);
        
        return () => {
            window.removeEventListener('trackStopped', handleTrackStopped);
        };
    }, [isPlaying]);

    const handleSeek = (e) => {
        const seekTime = parseFloat(e.target.value);
        audioRef.current.currentTime = seekTime;
        setCurrentTime(seekTime);
    };

    const formatTime = (time) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`audio-player ${isPlaying ? 'active' : ''}`}>
            <audio ref={audioRef} src={track.url} preload="metadata" />
            
            <div className="player-controls">
                <button className={`play-button ${isPlaying ? 'playing' : ''}`} onClick={togglePlay}>
                    {isPlaying ? '⏸️' : '▶️'}
                </button>
                
                <div className="progress-container">
                    <span className="time-current">{formatTime(currentTime)}</span>
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="progress-bar"
                    />
                    <span className="time-duration">{formatTime(duration)}</span>
                </div>
                
                <div className="track-info">
                    <strong>{track.name}</strong>
                    <span>{track.artist}</span>
                    {isPlaying && <span className="now-playing">▶️ Играет</span>}
                </div>
            </div>
        </div>
    );
};

export default AudioPlayer;