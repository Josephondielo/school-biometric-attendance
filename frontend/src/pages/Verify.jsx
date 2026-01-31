import React, { useState } from 'react';
import Camera from '../components/Camera';

const Verify = () => {
    const [status, setStatus] = useState('');

    const handleCapture = async (imgSrc) => {
        setStatus('Verifying...');
        // Call verification API
        console.log("Verifying face...");
        setTimeout(() => setStatus('Verified: Alice (Present)'), 1000);
    };

    return (
        <div>
            <h1>Take Attendance</h1>
            <Camera onCapture={handleCapture} />
            {status && <h3>{status}</h3>}
        </div>
    );
};
export default Verify;
