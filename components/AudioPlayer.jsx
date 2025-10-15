import React, { useState, useRef, useEffect } from 'react';

// Глобальная переменная для отслеживания текущего аудио
let currentPlayingAudio = null;

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
            if (currentPlayingAudio === audio) {
                currentPlayingAudio = null;
            }
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
            if (currentPlayingAudio === audioRef.current) {
                currentPlayingAudio = null;
            }
        } else {
            // Останавливаем предыдущий трек если он есть
            if (currentPlayingAudio && currentPlayingAudio !== audioRef.current) {
                currentPlayingAudio.pause();
                currentPlayingAudio.currentTime = 0;
                
                // Создаем событие чтобы другие плееры обновили свой статус
                const stopEvent = new Event('audioStopped');
                window.dispatchEvent(stopEvent);
            }
            
            // Запускаем текущий трек
            audioRef.current.play()
                .then(() => {
                    setIsPlaying(true);
                    currentPlayingAudio = audioRef.current;
                })
                .catch(error => {
                    console.error('Error playing audio:', error);
                });
        }
    };

    // Слушаем события остановки от других плееров
    useEffect(() => {
        const handleAudioStopped = () => {
            if (isPlaying && currentPlayingAudio !== audioRef.current) {
                setIsPlaying(false);
            }
        };

        window.addEventListener('audioStopped', handleAudioStopped);
        
        return () => {
            window.removeEventListener('audioStopped', handleAudioStopped);
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
                    {isPlaying ? '⏸️ СТОП' : '▶️ ИГРАТЬ'}
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
                    <strong>{track.name} [NEW VERSION]</strong>
                    <span>{track.artist}</span>
                    {isPlaying && <span className="now-playing">▶️ СЕЙЧАС ИГРАЕТ</span>}
                </div>
            </div>
        </div>
    );
};

export default AudioPlayer;