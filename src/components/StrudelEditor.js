import React, {
    useEffect,
    useRef,
    forwardRef,
    useImperativeHandle
} from "react";

import { StrudelMirror } from "@strudel/codemirror";
import { drawPianoroll } from "@strudel/draw";        // <-- MUST BE HERE
import { transpiler } from "@strudel/transpiler";
import { evalScope } from "@strudel/core";
import {
    initAudioOnFirstClick,
    getAudioContext,
    webaudioOutput,
    registerSynthSounds,
} from "@strudel/webaudio";

const StrudelEditor = forwardRef(({ code, pianoCanvas }, ref) => {
    const editorRoot = useRef(null);
    const editorInstance = useRef(null);

    useEffect(() => {
        if (!pianoCanvas) return;   // 👈 wait until the canvas exists

        (async () => {
            await registerSynthSounds();

            const editor = new StrudelMirror({
                defaultOutput: webaudioOutput,

                getTime: () =>
                    getAudioContext() ? getAudioContext().currentTime : 0,

                transpiler,
                root: editorRoot.current,
                drawTime: [-2, 2],

                // 👇 THIS DRAWS YOUR PIANO ROLL
                onDraw: (haps, time) => {
                    if (!pianoCanvas) return;

                    const ctx = pianoCanvas.getContext("2d");
                    if (!ctx) return;

                    drawPianoroll({
                        haps,
                        time,
                        ctx,
                        drawTime: [-2, 2],
                        fold: 0
                    });
                },

                // Load instrument scope
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
    }, [pianoCanvas]);  // <-- rerun when canvas becomes available

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
        <div className="strudel-editor-wrapper">
            <div ref={editorRoot} className="strudel-editor"></div>
        </div>
    );
});

export default StrudelEditor;
