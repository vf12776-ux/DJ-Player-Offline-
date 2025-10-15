import React, { useState, useRef, useEffect } from 'react';

let currentAudio = null;

const AudioPlayer = ({ track }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
            if (currentAudio === audioRef.current) {
                currentAudio = null;
            }
        } else {
            if (currentAudio && currentAudio !== audioRef.current) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
            }
            
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
                padding: '10px'
            }}>
                {isPlaying ? '⏸️ STOP' : '▶️ PLAY'}
            </button>
            <div>
                <strong>{track.name} [V3]</strong>
                {isPlaying && <span style={{color: 'red', fontWeight: 'bold'}}> - PLAYING</span>}
            </div>
        </div>
    );
};

export default AudioPlayer;
