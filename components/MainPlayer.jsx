// MainPlayer.jsx
import React, { useState, useEffect } from 'react';
import AudioPlayer from './AudioPlayer';

const MainPlayer = () => {
    const [tracks, setTracks] = useState([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // Загрузка треков из базы данных
    useEffect(() => {
        loadTracks();
    }, []);

    const loadTracks = async () => {
        try {
            await window.playlistManager.init();
            const tracksFromDB = await window.playlistManager.getAllTracks();
            setTracks(tracksFromDB);
        } catch (error) {
            console.error('Ошибка загрузки треков:', error);
        }
    };

    // АВТОМАТИЧЕСКОЕ ВОСПРОИЗВЕДЕНИЕ СЛЕДУЮЩЕГО ТРЕКА
    useEffect(() => {
        if (!isPlaying && currentTrackIndex > 0) {
            const timer = setTimeout(() => {
                setIsPlaying(true);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [currentTrackIndex, isPlaying]);

    const handlePlay = (index) => {
        setCurrentTrackIndex(index);
        setIsPlaying(true);
    };

    const handlePause = () => {
        setIsPlaying(false);
    };

    const handleTrackEnd = () => {
        if (tracks.length === 0) return;
        const nextIndex = (currentTrackIndex + 1) % tracks.length;
        setCurrentTrackIndex(nextIndex);
        setIsPlaying(false);
    };

    return (
        <div>
            <h1>DJ Плеер</h1>
            
            <div style={{
                marginBottom: '20px', 
                padding: '15px', 
                background: '#f5f5f5',
                borderRadius: '8px'
            }}>
                <strong>Сейчас играет: </strong>
                {tracks[currentTrackIndex]?.name || 'Нет трека'}
                <br />
                <strong>Статус: </strong>
                {isPlaying ? '▶️ Воспроизведение' : '⏸️ Пауза'}
                <br />
                <strong>Трек: </strong>
                {currentTrackIndex + 1} из {tracks.length}
            </div>

            {tracks.map((track, index) => (
                <AudioPlayer
                    key={track.id || index}
                    track={track}
                    isPlaying={index === currentTrackIndex && isPlaying}
                    onPlay={() => handlePlay(index)}
                    onPause={handlePause}
                    onEnded={index === currentTrackIndex ? handleTrackEnd : undefined}
                />
            ))}
        </div>
    );
};

export default MainPlayer;
