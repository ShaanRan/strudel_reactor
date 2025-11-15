import React, { useRef, useEffect } from "react";

export default function PianoRoll({ onCanvasReady }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (canvasRef.current && onCanvasReady) {
            onCanvasReady(canvasRef.current);
        }
    }, [onCanvasReady]);

    return (
        <canvas
            ref={canvasRef}
            width="1000"
            height="180"
            style={{
                width: "100%",
                borderRadius: "8px",
                background: "#111",
            }}
        ></canvas>
    );
}
