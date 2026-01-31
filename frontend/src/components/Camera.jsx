import React, { useRef, useCallback } from 'react';
import Webcam from 'react-webcam';

const Camera = ({ onCapture }) => {
    const webcamRef = useRef(null);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        onCapture(imageSrc);
    }, [webcamRef, onCapture]);

    return (
        <div>
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={320}
                height={240}
                onUserMediaError={(err) => {
                    console.error("Camera Component Error:", err);
                    alert(`Camera Error: ${err.name || "Access Failed"}`);
                }}
            />
            <button onClick={capture}>Capture Photo</button>
        </div>
    );
};
export default Camera;
