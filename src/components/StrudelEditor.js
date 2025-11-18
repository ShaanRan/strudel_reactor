import React, { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { StrudelMirror } from "@strudel/codemirror";
import { drawPianoroll } from "@strudel/draw";
import { transpiler } from "@strudel/transpiler";
import { evalScope } from "@strudel/core";
import {
    initAudioOnFirstClick,
    getAudioContext,
    webaudioOutput,
    registerSynthSounds,
} from "@strudel/webaudio";

const StrudelEditor = forwardRef(({ code }, ref) => {
    const editorRoot = useRef(null);
    const canvasRef = useRef(null);
    const editorInstance = useRef(null);

    useEffect(() => {
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
                    if (!canvasRef.current) return;
                    const ctx = canvasRef.current.getContext("2d");

                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

                    drawPianoroll({
                        haps,
                        time,
                        ctx,
                        drawTime: [-2, 2],
                        fold: 0,
                    });
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
            editor.setCode(code);
        })();
    }, []);

    useEffect(() => {
        if (editorInstance.current) {
            editorInstance.current.setCode(code);
        }
    }, [code]);

    useImperativeHandle(ref, () => ({
        play: async () => {
            if (editorInstance.current?.evaluate) {
                await initAudioOnFirstClick();
                await editorInstance.current.evaluate();
            }
        },
        stop: async () => {
            if (editorInstance.current?.stop) {
                await editorInstance.current.stop();
            }
        },
        setCode: (newCode) => {
            editorInstance.current?.setCode(newCode);
        }
    }));


    return (
        <div className="strudel-editor-wrapper">

            <div
                ref={editorRoot}
                className="strudel-editor"
                style={{ minHeight: "180px", marginBottom: "12px" }}
            ></div>

            <div className="card shadow-sm piano-roll-card">
                <div className="card-header gradient fw-semibold">🎹 Piano Roll</div>
                <canvas
                    ref={canvasRef}
                    width={900}
                    height={180}
                    className="piano-roll-canvas"
                />
            </div>
        </div>
    );
});

export default StrudelEditor;
