import * as dagre from 'dagre';
import { merge } from 'lodash';
import { pipe } from 'ramda';
import {
  assignCoords,
  scaleCoords,
  scaleCoordsByScreenSize,
  shouldAssignCoords,
} from './utils';

const defaultOpts = {
  horizontalNodeSpacing: 100,
  spaceNodesByScreenSize: true,
  verticalNodeSpacing: 100,
};

const multiParentHierarchical = (data, options, screen, onStopped) => {
  const opts = options ? merge(defaultOpts, options) : { ...defaultOpts };
  const {
    horizontalNodeSpacing,
    spaceNodesByScreenSize,
    verticalNodeSpacing,
  } = opts;

  const { nodeMap, edgeMap } = data;

  const nodes = [];
  const edges = [];
  nodeMap.forEach((value, key, map) => {
    nodes.push(value);
  });

  edgeMap.forEach((value, key, map) => {
    edges.push(value);
  });

  const graph = new dagre.graphlib.Graph({});

  // Set an object for the graph label
  graph.setGraph({});

  // Default to assigning a new object as a label for each new edge.
  graph.setDefaultEdgeLabel(() => ({}));

  // Add nodes to the graph. The first argument is the node id. The second is
  // metadata about the node. In this case we're going to add labels to each of
  // our nodes.
  nodes.forEach(({ id, label }) => {
    graph.setNode(id, { label, width: 20, height: 20 });
  });

  // Add edges to the graph.
  edges.forEach(({ start, end }) => {
    graph.setEdge(start.id, end.id);
  });

  // Next we can ask dagre to do the layout for these nodes and edges
  dagre.layout(graph);

  // Apply spacing and assign the coordinates
  const nodesToAssignCoords = nodes.filter(shouldAssignCoords);
  const coords = nodesToAssignCoords.map(({ id }) => {
    const { x, y } = graph.node(id);
    return { id, x, y };
  });
  const spacingFn = spaceNodesByScreenSize
    ? scaleCoordsByScreenSize(coords, screen)
    : scaleCoords(horizontalNodeSpacing, verticalNodeSpacing);
  const scaledCoords = coords.map(pipe(spacingFn, scaleCoords(0.015, 0.015)));
  const coordsById = new Map(scaledCoords.map((c) => [c.id, c]));
  // Assign the coordinates for ReVisNetwork
  nodesToAssignCoords.forEach(assignCoords(({ id }) => coordsById.get(id)));
  // call onStopped at end of pass
  if (onStopped) {
    onStopped();
  }

  return true;
};

export default multiParentHierarchical;
