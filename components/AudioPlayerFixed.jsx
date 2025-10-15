import React, { useState, useRef } from 'react';

let currentAudio = null;

const AudioPlayerFixed = ({ track }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    const togglePlay = () => {
        if (isPlaying) {
            // Пауза
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
            }
            
            // Запускаем текущий
            audioRef.current.play()
                .then(() => {
                    setIsPlaying(true);
                    currentAudio = audioRef.current;
                });
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
                padding: '10px',
                fontSize: '16px'
            }}>
                {isPlaying ? '⏸️ STOP' : '▶️ PLAY NEW'}
            </button>
            <div>
                <strong>{track.name} [FIXED VERSION]</strong>
                {isPlaying && <span style={{color: 'red', fontWeight: 'bold'}}> - NOW PLAYING</span>}
            </div>
        </div>
    );
};

export default AudioPlayerFixed;
