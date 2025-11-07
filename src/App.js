
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
import { evalScope } from "@strudel/core";
import * as d3 from "d3";

import { stranger_tune } from "./tunes";
import "./App.css";

export default function App() {
    const editorRoot = useRef(null);
    const canvasRef = useRef(null);
    const editorInstance = useRef(null);
    const d3Ref = useRef(null);

    const [procText, setProcText] = useState(stranger_tune);
    const [p1Hush, setP1Hush] = useState(false);
    const [tempo, setTempo] = useState(1.0);
    const [tempoHistory, setTempoHistory] = useState([]);
    const [started, setStarted] = useState(false);
    const [showAlert, setShowAlert] = useState(false);


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

                    const scopeLoader = evalScope(
                        import("@strudel/core"),
                        import("@strudel/draw"),
                        import("@strudel/mini"),
                        import("@strudel/tonal"),
                        import("@strudel/webaudio"),
                        import("@strudel/soundfonts")
                    );

                    await Promise.all([scopeLoader, registerSynthSounds()]);
                },
            });

            editorInstance.current = editor;
            editor.setCode(processedText);
        })();
    }, []);


    const handlePreprocess = (playAfter = false) => {
        if (!editorInstance.current) return;

        editorInstance.current.setCode(processedText);
        setShowAlert(true);

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


    React.useEffect(() => {
        if (!d3Ref.current) return;
        const svg = d3.select(d3Ref.current);
        svg.selectAll("*").remove();

        const width = 500;
        const height = 150;
        const margin = { top: 10, right: 20, bottom: 30, left: 40 };

        if (tempoHistory.length === 0) return;

        const x = d3.scaleTime()
            .domain(d3.extent(tempoHistory, d => d.time))
            .range([margin.left, width - margin.right]);

        const y = d3.scaleLinear()
            .domain([0.5, 2])
            .range([height - margin.bottom, margin.top]);

        const line = d3.line()
            .x(d => x(d.time))
            .y(d => y(d.tempo))
            .curve(d3.curveMonotoneX);

        svg.append("path")
            .datum(tempoHistory)
            .attr("fill", "none")
            .attr("stroke", "#0d6efd")
            .attr("stroke-width", 2.5)
            .attr("d", line);

        svg.append("g")
            .attr("transform", `translate(0, ${height - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(4));

        svg.append("g")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(y));
    }, [tempoHistory]);


    return (
        <div className="container py-3">


            {showAlert && (
                <div className="alert alert-info alert-dismissible fade show" role="alert">
                    ✅ Preprocessing complete!
                    <button className="btn-close" onClick={() => setShowAlert(false)}></button>
                </div>
            )}

            <h2 className="text-center mb-3 fw-bold text-primary">
                Strudel Reactor — Part A
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
                        <div className="card-header gradient fw-semibold">
                            Controls
                        </div>
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
                                    <input type="radio" className="form-check-input" checked={!p1Hush}
                                        onChange={() => setP1Hush(false)} />
                                    <label className="form-check-label">ON</label>
                                </div>
                                <div className="form-check">
                                    <input type="radio" className="form-check-input" checked={p1Hush}
                                        onChange={() => setP1Hush(true)} />
                                    <label className="form-check-label">HUSH</label>
                                </div>
                            </div>


                            <div>
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
                                        setTempoHistory(prev => [...prev, { time: Date.now(), tempo: t }]);
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

                            <div className="mt-3 text-muted small">
                                REPL Status:
                                <strong> {started ? "Running" : "Stopped"}</strong>
                                {started && <span className="pulse-dot"></span>}
                            </div>

                        </div>
                    </div>
                </div>

                <div className="col-md-6">

                    <div className="card shadow-sm">
                        <div className="card-header gradient fw-semibold">Strudel REPL</div>
                        <div className="card-body">
                            <div
                                ref={editorRoot}
                                style={{
                                    border: "1px solid #dee2e6",
                                    minHeight: "200px",
                                    borderRadius: "5px",
                                    marginBottom: "10px",
                                }}
                            ></div>

                            <canvas
                                ref={canvasRef}
                                width="600"
                                height="150"
                                style={{ width: "100%", borderRadius: "4px" }}
                            ></canvas>
                        </div>
                    </div>

                    <div className="card shadow-sm mt-3">
                        <div className="card-header gradient fw-semibold">
                            Tempo History Graph (D3.js)
                        </div>
                        <div className="card-body">
                            <svg
                                ref={d3Ref}
                                width="500"
                                height="150"
                                style={{ width: "100%", display: "block" }}
                            ></svg>
                        </div>
                    </div>

                </div>
            </div>

            <footer className="text-center mt-4 text-muted small border-top pt-2">
                Part A Submission — Enhanced UI + D3 Visualisation
            </footer>
        </div>
    );
}

