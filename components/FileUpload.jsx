import React, { useRef, useState } from 'react';

const FileUpload = ({ onFilesSelect }) => {
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = (files) => {
        const fileList = Array.from(files);
        if (fileList.length > 0) {
            onFilesSelect(fileList);
        }
    };

    const handleInputChange = (event) => {
        handleFileSelect(event.target.files);
    };

    const handleClick = () => {
        fileInputRef.current.click();
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);
        const files = event.dataTransfer.files;
        handleFileSelect(files);
    };

    return (
        <div className="file-upload">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleInputChange}
                multiple
                accept=".mp3,.wav,.m4a,.aac"
                style={{ display: 'none' }}
            />
            
            <div 
                className={`upload-area ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <div className="upload-content">
                    <div className="upload-icon">📁</div>
                    <p>Нажмите или перетащите файлы для загрузки</p>
                    <small>Поддерживаемые форматы: MP3, WAV, M4A, AAC</small>
                    <button 
                        className="upload-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClick();
                        }}
                    >
                        Выбрать файлы
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FileUpload;