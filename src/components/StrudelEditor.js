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
    }));

    return (
        <div>
            {/* ONLY THIS CARD — NO DUPLICATES */}
            <div className="card shadow-sm mb-3">
                <div className="card-header gradient fw-semibold">Strudel Editor</div>
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
        </div>
    );
});

export default StrudelEditor;
