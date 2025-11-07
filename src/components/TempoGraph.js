import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function TempoGraph({ tempoHistory }) {
    const d3Ref = useRef(null);

    useEffect(() => {
        if (!d3Ref.current || tempoHistory.length === 0) return;

        const svg = d3.select(d3Ref.current);
        svg.selectAll("*").remove();

        const width = 520;
        const height = 150;
        const margin = { top: 10, right: 20, bottom: 30, left: 40 };

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
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(4));

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));
    }, [tempoHistory]);

    return (
        <svg
            ref={d3Ref}
            width="520"
            height="150"
            style={{ width: "100%", display: "block" }}
        ></svg>
    );
}
