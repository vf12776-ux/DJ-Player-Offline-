import React, { useState, useRef } from 'react';

let currentAudio = null;

const AudioPlayerFixed = ({ track }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            // Останавливаем предыдущий трек
            if (currentAudio) {
                currentAudio.pause();
            }
            // Запускаем новый
            audioRef.current.play();
            setIsPlaying(true);
            currentAudio = audioRef.current;
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
