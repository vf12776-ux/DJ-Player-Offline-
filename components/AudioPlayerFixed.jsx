import React, { useState, useRef, useEffect } from 'react';

const AudioPlayerFixed = ({ track, isPlaying, onPlay, onPause, onEnded }) => {
    const audioRef = useRef(null);

    // Синхронизация состояния воспроизведения
    useEffect(() => {
        if (isPlaying) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying]);

    // Обработчик окончания трека
    useEffect(() => {
        const audio = audioRef.current;
        const handleEnded = () => {
            if (onEnded) onEnded();
        };

        audio.addEventListener('ended', handleEnded);
        
        return () => {
            audio.removeEventListener('ended', handleEnded);
        };
    }, [onEnded]);

    const togglePlay = () => {
        if (isPlaying) {
            if (onPause) onPause();
        } else {
            if (onPlay) onPlay();
        }
    };

    return (
        <div style={{
            border: isPlaying ? '3px solid red' : '1px solid gray',
            padding: '10px',
            margin: '10px',
            background: isPlaying ? '#ffe6e6' : 'white'
        }}>
            <audio ref={audioRef} src={track.url} />
            <button onClick={togglePlay} style={{
                background: isPlaying ? 'red' : 'green',
                color: 'white',
                padding: '10px'
            }}>
                {isPlaying ? '⏸️ STOP' : '▶️ PLAY'}
            </button>
            <span><strong>{track.name}</strong></span>
            {isPlaying && <span style={{color: 'red', fontWeight: 'bold'}}> - СЕЙЧАС ИГРАЕТ</span>}
        </div>
    );
};

export default AudioPlayerFixed;
