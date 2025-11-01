import React, { useMemo, useRef, useState } from "react";
import { StrudelMirror } from "@strudel/codemirror";
import { drawPianoroll } from "@strudel/draw";
import {
    initAudioOnFirstClick,
    getAudioContext,
    webaudioOutput,
    registerSynthSounds,
} from "@strudel/webaudio";
import { transpiler } from "@strudel/transpiler";
import { stranger_tune } from "./tunes";
import "./App.css";

export default function App() {
    const editorRoot = useRef(null);
    const canvasRef = useRef(null);
    const editorInstance = useRef(null);

    const [procText, setProcText] = useState(stranger_tune);
    const [p1Hush, setP1Hush] = useState(false);
    const [tempo, setTempo] = useState(1.0);
    const [started, setStarted] = useState(false);

    function preprocess(text, p1Hush, tempo) {
        let processed = text.replace(/<p1_Radio>/g, p1Hush ? "_" : "");
        processed = processed.replace(/<tempo>/g, tempo.toFixed(2));
        return processed;
    }

    const processedText = useMemo(
        () => preprocess(procText, p1Hush, tempo),
        [procText, p1Hush, tempo]
    );

    React.useEffect(() => {
        (async () => {
            await registerSynthSounds();
            const editor = new StrudelMirror({
                defaultOutput: webaudioOutput,
                getTime: () =>
                    getAudioContext() ? getAudioContext().currentTime : 0,
                transpiler,
                root: editorRoot.current,
                drawTime: [-2, 2],
                onDraw: (haps, time) => {
                    const ctx = canvasRef.current.getContext("2d");
                    drawPianoroll({ haps, time, ctx, drawTime: [-2, 2], fold: 0 });
                },
                prebake: async () => {
                    initAudioOnFirstClick();
                    await Promise.all([
                        import("@strudel/core"),
                        import("@strudel/mini"),
                        import("@strudel/tonal"),
                        import("@strudel/webaudio"),
                    ]);
                },
            });
            editorInstance.current = editor;
            editor.setCode(processedText);
        })();
    }, []);

    const handlePreprocess = (playAfter = false) => {
        const editor = editorInstance.current;
        if (!editor) return;
        editor.setCode(processedText);
        if (playAfter) handlePlay();
    };

    const handlePlay = async () => {
        await initAudioOnFirstClick();
        if (editorInstance.current?.evaluate) {
            await editorInstance.current.evaluate();
            setStarted(true);
        }
    };

    const handleStop = async () => {
        if (editorInstance.current?.stop) {
            await editorInstance.current.stop();
            setStarted(false);
        }
    };

    return (
        <div className="container py-3">
            <h2 className="text-center mb-3 fw-bold text-primary">
                Strudel Reactor — Part A
            </h2>

            <div className="row g-3">
                {/* Left: Text editor and controls */}
                <div className="col-md-6">
                    <div className="card mb-3 shadow-sm">
                        <div className="card-header bg-primary text-white fw-semibold">
                            Preprocessor Editor
                        </div>
                        <div className="card-body">
                            <textarea
                                className="form-control mb-2"
                                rows="12"
                                value={procText}
                                onChange={(e) => setProcText(e.target.value)}
                            ></textarea>
                            <small className="text-muted">
                                Use &lt;p1_Radio&gt; and &lt;tempo&gt; tags in the text.
                            </small>
                        </div>
                    </div>

                    <div className="card shadow-sm">
                        <div className="card-header bg-secondary text-white fw-semibold">
                            Controls
                        </div>
                        <div className="card-body">
                            <div className="d-flex flex-wrap gap-2 mb-3">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handlePreprocess(false)}
                                >
                                    Preprocess
                                </button>
                                <button
                                    className="btn btn-success"
                                    onClick={() => handlePreprocess(true)}
                                >
                                    Preprocess & Play
                                </button>
                                <button className="btn btn-outline-primary" onClick={handlePlay}>
                                    Play
                                </button>
                                <button className="btn btn-outline-danger" onClick={handleStop}>
                                    Stop
                                </button>
                            </div>

                            {/* p1 radio */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold">p1 Radio</label>
                                <div className="form-check">
                                    <input
                                        type="radio"
                                        id="p1on"
                                        className="form-check-input"
                                        checked={!p1Hush}
                                        onChange={() => setP1Hush(false)}
                                    />
                                    <label htmlFor="p1on" className="form-check-label">
                                        ON
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input
                                        type="radio"
                                        id="p1hush"
                                        className="form-check-input"
                                        checked={p1Hush}
                                        onChange={() => setP1Hush(true)}
                                    />
                                    <label htmlFor="p1hush" className="form-check-label">
                                        HUSH
                                    </label>
                                </div>
                            </div>

                            {/* tempo slider */}
                            <div>
                                <label htmlFor="tempo" className="form-label fw-semibold">
                                    Tempo
                                </label>
                                <input
                                    id="tempo"
                                    type="range"
                                    className="form-range"
                                    min="0.5"
                                    max="2"
                                    step="0.05"
                                    value={tempo}
                                    onChange={(e) => setTempo(parseFloat(e.target.value))}
                                />
                                <div>Speed: {tempo.toFixed(2)}×</div>
                            </div>

                            <div className="mt-3 text-muted small">
                                REPL Status: <strong>{started ? "Running" : "Stopped"}</strong>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Strudel editor */}
                <div className="col-md-6">
                    <div className="card shadow-sm">
                        <div className="card-header bg-info text-white fw-semibold">
                            Strudel REPL
                        </div>
                        <div className="card-body">
                            <div
                                ref={editorRoot}
                                id="strudel-editor-root"
                                style={{
                                    border: "1px solid #dee2e6",
                                    minHeight: "200px",
                                    borderRadius: "5px",
                                    marginBottom: "10px",
                                }}
                            ></div>
                            <canvas
                                ref={canvasRef}
                                id="roll"
                                width="600"
                                height="150"
                                style={{ width: "100%", borderRadius: "4px" }}
                            ></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="text-center mt-4 text-muted small border-top pt-2">
                <p>
                    Part A Submission — Strudel Reactor with Tempo Slider and p1 Controls
                </p>
            </footer>
        </div>
    );
}
