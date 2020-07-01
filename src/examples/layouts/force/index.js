/* eslint-disable no-param-reassign */
import seedrandom from 'seedrandom';
import { merge } from 'lodash';
import {
  forceSimulation,
  forceLink,
  forceX,
  forceY,
  forceManyBody,
  forceCenter,
} from 'd3-force';

/**
A layout is a function that takes a set of RevisDataset data and manipulates through it's 
own defined logic.  Said logic can be based upon arbitrary options, also passed in.
The third parameter, screen, allows for inspection of the screen size
**/

const defaultOpts = {
  forceNodeSpacing: 5,
  alphaMin: 0.05,
  forceType: 'directedTree',
};

// expect data to have been put into DataSet format
const ForceAtlasLayout = (data, options, screen, onStopped) => {
  const SCREEN = screen || { width: 600, height: 600 };
  const opts = options ? merge(defaultOpts, options) : { ...defaultOpts };

  const { forceNodeSpacing, alphaMin, forceType } = opts;
  const { nodeMap, edgeMap } = data;

  let nodes = [];
  const edges = [];
  nodeMap.forEach((value, key, map) => {
    nodes.push(value);
  });

  edgeMap.forEach((value, key, map) => {
    edges.push(value);
  });

  // random assign coordinates
  const rnd = seedrandom('hello sweetheart');
  nodes.forEach((nd) => {
    const x = (rnd() * SCREEN.width) / 3 - SCREEN.width / 6;
    const y = (rnd() * SCREEN.height) / 3 - SCREEN.height / 6;
    if (!nd.x || !nd.y) {
      nd.x = x;
      nd.y = y;
    }
  });

  const links = edges.map((d) => ({
    id: d.id,
    source: d.start.id,
    target: d.end.id,
    d,
  }));
  nodes = nodes.map((d) => ({ id: d.id, d, fixed: d.fixed }));

  let simulation = null;
  if (forceType === 'directedTree') {
    // force directed tree like https://observablehq.com/@d3/force-directed-tree
    simulation = forceSimulation(nodes)
      .alphaMin(alphaMin)
      .force(
        'link',
        forceLink(links)
          .id((d) => d.id)
          .distance(0)
          .strength(1),
      )
      .force('charge', forceManyBody().strength(-50))
      .force('x', forceX())
      .force('y', forceY());
  } else if (forceType === 'forceCenter') {
    // centered force like https://bl.ocks.org/mbostock/ad70335eeef6d167bc36fd3c04378048
    simulation = forceSimulation(nodes)
      .alphaMin(alphaMin)
      .force(
        'link',
        forceLink(links).id((d) => d.id),
      )
      .force('charge', forceManyBody())
      .force('center', forceCenter(0, 0));
  } else {
    // disjoint force like https://observablehq.com/@d3/disjoint-force-directed-graph
    simulation = forceSimulation(nodes)
      .alphaMin(alphaMin)
      .force(
        'link',
        forceLink(links).id((d) => d.id),
      )
      .force('charge', forceManyBody())
      .force('x', forceX())
      .force('y', forceY());
  }

  simulation.on('tick', () => {
    nodes.forEach((n) => {
      // don't effect fixed nodes
      if (!n.fixed) {
        n.d.x = n.x * forceNodeSpacing;
        n.d.y = n.y * forceNodeSpacing;
      }
    });
  });

  simulation.on('end', () => {
    if (onStopped) {
      onStopped();
    }
  });

  // if we want to return anything after the initial run, we can do so here
  return true;
};

export default ForceAtlasLayout;
