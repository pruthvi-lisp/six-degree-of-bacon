import * as d3 from "d3";
import { Simulation } from "d3";
import React, { useEffect, useRef } from "react";

import { D3Link, D3Node } from "../types";

function Node({ node, color }: { node: D3Node; color: string }) {
  let thisRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    d3.select(thisRef).data([node]);
  });

  return (
    <circle className="node" fill={color} r={5} ref={(ref) => (thisRef = ref)}>
      <title>{node.id}</title>
    </circle>
  );
}

export default function Nodes({
  nodes,
  simulation,
}: {
  nodes: Array<D3Node>;
  simulation: Simulation<D3Node, D3Link>;
}) {
  useEffect(() => {
    d3.selectAll<Element, D3Node>(".node").call(
      d3
        .drag<Element, D3Node>()
        .on("start", (d) => {
          if (!d3.event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (d) => {
          d.fx = d3.event.x;
          d.fy = d3.event.y;
        })
        .on("end", (d) => {
          if (!d3.event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
    );
  });

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  return (
    <g className="nodes">
      {nodes.map((node, index) => (
        <Node color={color(node.group.toString())} key={index} node={node} />
      ))}
    </g>
  );
}