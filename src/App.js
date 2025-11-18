import React, { useMemo, useRef, useState } from "react";
import { barbie_tune } from "./barbieSong";

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

    function preprocess(text) {
        return text
            .replace(/<p1_Radio>/g, p1Hush ? "_" : "")
            .replace(/<tempo>/g, tempo.toFixed(2))
            .replace(/<master_gain>/g, masterGain.toFixed(2))
            .replace(/<reverb_amount>/g, reverb.toFixed(2))
            .replace(/<pattern_index>/g, patternIndex.toString())
            .replace(/<drums2_gain>/g, extraDrums ? "1" : "0");
    }

    const processedText = useMemo(
        () => preprocess(procText),
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

            <h2 className="text-center mb-4 fw-bold page-header">
                🎶 SHAAN'S STRUDEL REACTER 🎛️
            </h2>

            <div className="row g-4">

                <div className="col-md-6">

                    <div className="card shadow-sm mb-3">
                        <div className="card-header gradient fw-semibold">
                            🎼 Strudel Live Editor
                        </div>

                        <div className="card-body">
                            <StrudelEditor ref={editorRef} code={processedText} />

                            <div className="mt-4">
                                <TempoGraph tempoHistory={tempoHistory} />
                            </div>
                        </div>
                    </div>
                </div>

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
                                Tags: &lt;p1_Radio&gt;, &lt;tempo&gt;, &lt;master_gain&gt;, &lt;pattern_index&gt;, &lt;reverb_amount&gt;
                            </small>
                        </div>
                    </div>

                    <div className="card shadow-sm mb-3">
                        <div className="card-header gradient fw-semibold">
                            Controls
                        </div>

                        <div className="card-body">

                            <div className="d-flex flex-wrap gap-2 mb-3">
                                <button className="btn btn-primary" onClick={() => handlePreprocess(false)}>Preprocess</button>
                                <button className="btn btn-success" onClick={() => handlePreprocess(true)}>Preprocess & Play</button>
                                <button className="btn btn-primary glow-btn" onClick={handlePlay}>▶ Play</button>
                                <button className="btn btn-outline-danger" onClick={handleStop}>Stop</button>
                            </div>


                            <div className="mt-3 text-center">
                                <button
                                    className="btn btn-barbie"
                                    onClick={() => {
                                        setProcText(barbie_tune);

                                        const processed = preprocess(barbie_tune);
                                        editorRef.current?.setCode(processed);

                                        setShowAlert(true);

                                        setTimeout(() => editorRef.current?.play(), 300);
                                    }}
                                >
                                    🎀 PLAY BARBIE SONG 🎀
                                </button>
                            </div>


                            <div className="mb-3">
                                <label className="form-label fw-semibold">p1 Radio</label>
                                <div className="form-check">
                                    <input type="radio" checked={!p1Hush} onChange={() => setP1Hush(false)} className="form-check-input" />
                                    <label className="form-check-label">ON</label>
                                </div>
                                <div className="form-check">
                                    <input type="radio" checked={p1Hush} onChange={() => setP1Hush(true)} className="form-check-input" />
                                    <label className="form-check-label">HUSH</label>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-semibold">Tempo</label>

                                <input
                                    type="range"
                                    min="0.5"
                                    max="2"
                                    step="0.05"
                                    className="form-range"
                                    value={tempo}
                                    onChange={(e) => {
                                        const t = parseFloat(e.target.value);
                                        setTempo(t);
                                        setTempoHistory(prev => [...prev, { time: Date.now(), tempo: t }]);
                                    }}
                                />

                                <div>Speed: {tempo.toFixed(2)}×</div>

                                <div className="progress mt-2 tempo-progress">
                                    <div
                                        className="progress-bar tempo-bar bg-success"
                                        style={{ width: `${((tempo - 0.5) / 1.5) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
>

                            <div className="mb-3">
                                <label className="form-label fw-semibold">Master Volume</label>
                                <input
                                    type="range"
                                    min="0.3"
                                    max="2"
                                    step="0.1"
                                    className="form-range"
                                    value={masterGain}
                                    onChange={(e) => setMasterGain(parseFloat(e.target.value))}
                                />
                                <div>Gain: {masterGain.toFixed(1)}</div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-semibold">Reverb Amount</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    className="form-range"
                                    value={reverb}
                                    onChange={(e) => setReverb(parseFloat(e.target.value))}
                                />
                                <div>Reverb: {reverb.toFixed(2)}</div>
                            </div>

                        </div>
                    </div>

                    <div className="card shadow-sm mb-3 producer-card">
                        <div className="card-header gradient fw-semibold">
                            🎛️ Producer Control Deck
                        </div>

                        <div className="card-body">
                            <div className="accordion" id="producerAccordion">

                                <div className="accordion-item glass-acc">
                                    <h2 className="accordion-header" id="eqHeading">
                                        <button className="accordion-button collapsed"
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#eqBox"
                                            aria-expanded="false">
                                            🎚️ Equalizer (EQ)
                                        </button>
                                    </h2>
                                    <div id="eqBox" className="accordion-collapse collapse" data-bs-parent="#producerAccordion">
                                        <div className="accordion-body">

                                            <label className="form-label">Bass</label>
                                            <input type="range" className="form-range" min="-1" max="1" step="0.1" />

                                            <label className="form-label mt-2">Mid</label>
                                            <input type="range" className="form-range" min="-1" max="1" step="0.1" />

                                            <label className="form-label mt-2">Treble</label>
                                            <input type="range" className="form-range" min="-1" max="1" step="0.1" />

                                        </div>
                                    </div>
                                </div>

                                <div className="accordion-item glass-acc">
                                    <h2 className="accordion-header" id="waveHeading">
                                        <button className="accordion-button collapsed"
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#waveBox">
                                            🎵 Synth Waveform
                                        </button>
                                    </h2>
                                    <div id="waveBox" className="accordion-collapse collapse" data-bs-parent="#producerAccordion">
                                        <div className="accordion-body">
                                            <select className="form-select">
                                                <option>saw</option>
                                                <option>square</option>
                                                <option>sine</option>
                                                <option>triangle</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="accordion-item glass-acc">
                                    <h2 className="accordion-header" id="filterHeading">
                                        <button className="accordion-button collapsed"
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#filterBox">
                                            🎧 Filters
                                        </button>
                                    </h2>
                                    <div id="filterBox" className="accordion-collapse collapse" data-bs-parent="#producerAccordion">
                                        <div className="accordion-body">

                                            <label className="form-label">Low-Pass Filter</label>
                                            <input type="range" min="200" max="15000" step="100" className="form-range" />

                                            <label className="form-label mt-2">High-Pass Filter</label>
                                            <input type="range" min="20" max="2000" step="50" className="form-range" />

                                        </div>
                                    </div>
                                </div>

                                <div className="accordion-item glass-acc">
                                    <h2 className="accordion-header" id="drumHeading">
                                        <button className="accordion-button collapsed"
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#drumBox">
                                            🥁 Drum Machine
                                        </button>
                                    </h2>
                                    <div id="drumBox" className="accordion-collapse collapse" data-bs-parent="#producerAccordion">
                                        <div className="accordion-body">

                                            <div className="form-check">
                                                <input className="form-check-input" type="checkbox" />
                                                <label className="form-check-label">Kick</label>
                                            </div>

                                            <div className="form-check">
                                                <input className="form-check-input" type="checkbox" />
                                                <label className="form-check-label">Snare</label>
                                            </div>

                                            <div className="form-check">
                                                <input className="form-check-input" type="checkbox" />
                                                <label className="form-check-label">Hi-Hat</label>
                                            </div>

                                        </div>
                                    </div>
                                </div>

                                <div className="accordion-item glass-acc">
                                    <h2 className="accordion-header" id="reverbHeading">
                                        <button className="accordion-button collapsed"
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#reverbBox">
                                            🎤 Reverb Modes
                                        </button>
                                    </h2>
                                    <div id="reverbBox" className="accordion-collapse collapse" data-bs-parent="#producerAccordion">
                                        <div className="accordion-body">
                                            <select className="form-select">
                                                <option>Room</option>
                                                <option>Hall</option>
                                                <option>Plate</option>
                                                <option>Cathedral</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>


                </div>
            </div>

            <footer className="text-center mt-4 text-muted small border-top pt-2">
                Part B Submission — Enhanced Controls + Improved UI + Producer Deck + D3 Visualisation
            </footer>
        </div>
    );
}
