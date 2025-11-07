import React, { useMemo, useRef, useState } from "react";

import StrudelEditor from "./components/StrudelEditor";
import TempoGraph from "./components/TempoGraph";

import { stranger_tune } from "./tunes";
import "./App.css";

export default function App() {
    const editorRef = useRef(null);

    const [procText, setProcText] = useState(stranger_tune);
    const [p1Hush, setP1Hush] = useState(false);
    const [tempo, setTempo] = useState(1.0);
    const [tempoHistory, setTempoHistory] = useState([]);
    const [started, setStarted] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

    const [masterGain, setMasterGain] = useState(1.0);
    const [reverb, setReverb] = useState(0.6);
    const [patternIndex, setPatternIndex] = useState(0);
    const [extraDrums, setExtraDrums] = useState(true);

    function preprocess(text, p1Hush, tempo, masterGain, reverb, patternIndex, extraDrums) {
        let processed = text.replace(/<p1_Radio>/g, p1Hush ? "_" : "");
        processed = processed.replace(/<tempo>/g, tempo.toFixed(2));
        processed = processed.replace(/<master_gain>/g, masterGain.toFixed(2));
        processed = processed.replace(/<reverb_amount>/g, reverb.toFixed(2));
        processed = processed.replace(/<pattern_index>/g, patternIndex.toString());
        processed = processed.replace(/<drums2_gain>/g, extraDrums ? "1" : "0");
        return processed;
    }

    const processedText = useMemo(
        () =>
            preprocess(
                procText,
                p1Hush,
                tempo,
                masterGain,
                reverb,
                patternIndex,
                extraDrums
            ),
        [procText, p1Hush, tempo, masterGain, reverb, patternIndex, extraDrums]
    );

    const handlePreprocess = (playAfter = false) => {
        setShowAlert(true);
        if (playAfter) handlePlay();
    };

    const handlePlay = async () => {
        await editorRef.current?.play();
        setStarted(true);
    };

    const handleStop = async () => {
        await editorRef.current?.stop();
        setStarted(false);
    };

    return (
        <div className="container py-3">
            {showAlert && (
                <div className="alert alert-info alert-dismissible fade show" role="alert">
                    ✅ Preprocessing complete!
                    <button className="btn-close" onClick={() => setShowAlert(false)}></button>
                </div>
            )}

            <h2 className="text-center mb-3 fw-bold text-primary">
                Strudel Reactor — Part B
            </h2>

            <div className="row g-3">
                <div className="col-md-6">
                    <div className="card mb-3 shadow-sm">
                        <div className="card-header gradient fw-semibold">
                            Preprocessor Editor
                        </div>
                        <div className="card-body">
                            <textarea
                                className="form-control mb-2"
                                rows="12"
                                value={procText}
                                onChange={(e) => setProcText(e.target.value)}
                            />
                            <small className="text-muted">
                                Use &lt;p1_Radio&gt; and &lt;tempo&gt; tags.
                            </small>
                        </div>
                    </div>

                    <div className="card shadow-sm">
                        <div className="card-header gradient fw-semibold">Controls</div>
                        <div className="card-body">

                            <div className="d-flex flex-wrap gap-2 mb-3">
                                <button className="btn btn-primary" onClick={() => handlePreprocess(false)}>
                                    Preprocess
                                </button>

                                <button className="btn btn-success" onClick={() => handlePreprocess(true)}>
                                    Preprocess & Play
                                </button>

                                <button className="btn btn-primary glow-btn" onClick={handlePlay}>
                                    ▶ Play
                                </button>

                                <button className="btn btn-outline-danger" onClick={handleStop}>
                                    Stop
                                </button>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-semibold">p1 Radio</label>

                                <div className="form-check">
                                    <input
                                        type="radio"
                                        className="form-check-input"
                                        checked={!p1Hush}
                                        onChange={() => setP1Hush(false)}
                                    />
                                    <label className="form-check-label">ON</label>
                                </div>

                                <div className="form-check">
                                    <input
                                        type="radio"
                                        className="form-check-input"
                                        checked={p1Hush}
                                        onChange={() => setP1Hush(true)}
                                    />
                                    <label className="form-check-label">HUSH</label>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-semibold">Tempo</label>

                                <input
                                    type="range"
                                    className="form-range"
                                    min="0.5"
                                    max="2"
                                    step="0.05"
                                    value={tempo}
                                    onChange={(e) => {
                                        const t = parseFloat(e.target.value);
                                        setTempo(t);
                                        setTempoHistory(prev => [
                                            ...prev,
                                            { time: Date.now(), tempo: t }
                                        ]);
                                    }}
                                />

                                <div>Speed: {tempo.toFixed(2)}×</div>

                                <div className="progress mt-2">
                                    <div
                                        className="progress-bar bg-success tempo-bar"
                                        style={{ width: `${(tempo - 0.5) * 67}%` }}
                                    ></div>
                                </div>
                            </div>

                            <hr className="my-3" />

                            <div className="mb-3">
                                <label className="form-label fw-semibold">Master Volume</label>
                                <input
                                    type="range"
                                    className="form-range"
                                    min="0"
                                    max="2"
                                    step="0.1"
                                    value={masterGain}
                                    onChange={(e) => setMasterGain(parseFloat(e.target.value))}
                                />
                                <div>Gain: {masterGain.toFixed(1)}</div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-semibold">Reverb Amount</label>
                                <input
                                    type="range"
                                    className="form-range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={reverb}
                                    onChange={(e) => setReverb(parseFloat(e.target.value))}
                                />
                                <div>Room: {reverb.toFixed(2)}</div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-semibold">Pattern Variant</label>
                                <select
                                    className="form-select"
                                    value={patternIndex}
                                    onChange={(e) => setPatternIndex(parseInt(e.target.value))}
                                >
                                    <option value={0}>Variant A (Default)</option>
                                    <option value={1}>Variant B</option>
                                    <option value={2}>Variant C</option>
                                </select>
                                <small className="text-muted">
                                    Changes which drum/bass pattern is used.
                                </small>
                            </div>

                            <div className="form-check mb-2">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="extraDrums"
                                    checked={extraDrums}
                                    onChange={(e) => setExtraDrums(e.target.checked)}
                                />
                                <label className="form-check-label" htmlFor="extraDrums">
                                    Enable extra drums layer
                                </label>
                            </div>

                            <div className="mt-3 text-muted small">
                                REPL Status:
                                <strong> {started ? "Running" : "Stopped"}</strong>
                                {started && <span className="pulse-dot"></span>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card shadow-sm">
                    <div className="card-header gradient fw-semibold">
                        Strudel REPL & Visualisation
                    </div>
                    <div className="card-body">

                        <StrudelEditor ref={editorRef} code={processedText} />

                        <div className="mt-3 pt-3 border-top">
                            <TempoGraph tempoHistory={tempoHistory} />
                        </div>

                    </div>
                </div>

            </div>

            <footer className="text-center mt-4 text-muted small border-top pt-2">
                Part B Submission — Extended Controls & Audio Interaction
            </footer>
        </div>
    );
}
