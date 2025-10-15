import React, { useState, useRef, useEffect } from 'react';

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
            // Удаляем из глобального списка при завершении
            if (window.playingAudios) {
                window.playingAudios = window.playingAudios.filter(a => a !== audio);
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

    // Функция для остановки всех других аудио
    const stopAllOtherAudios = () => {
        if (!window.playingAudios) window.playingAudios = [];
        
        // Останавливаем все аудио кроме текущего
        window.playingAudios.forEach(otherAudio => {
            if (otherAudio !== audioRef.current) {
                otherAudio.pause();
                otherAudio.currentTime = 0;
            }
        });
        
        // Очищаем массив и добавляем текущее аудио
        window.playingAudios = [audioRef.current];
    };

    const togglePlay = () => {
        if (isPlaying) {
            // Пауза
            audioRef.current.pause();
            setIsPlaying(false);
            if (window.playingAudios) {
                window.playingAudios = window.playingAudios.filter(a => a !== audioRef.current);
            }
        } else {
            // Запуск - сначала останавливаем все другие
            stopAllOtherAudios();
            
            // Затем запускаем текущее
            audioRef.current.play()
                .then(() => {
                    setIsPlaying(true);
                    if (!window.playingAudios) window.playingAudios = [];
                    if (!window.playingAudios.includes(audioRef.current)) {
                        window.playingAudios.push(audioRef.current);
                    }
                })
                .catch(error => {
                    console.error('Error playing audio:', error);
                });
        }
    };

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