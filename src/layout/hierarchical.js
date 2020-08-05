/* eslint-disable no-param-reassign */
import { mergeDeepRight, pipe, tap } from 'ramda';
import {
  assignCoords,
  assignEdgeParentChild,
  compareByMass,
  compareByParentChild,
  crawl,
  getCoordsKeyValuePairs,
  orderNodes,
  scaleCoords,
  scaleCoordsByScreenSize,
  shouldAssignCoords,
} from './utils';

/**
 * Clears everything.
 *
 * @return {void} use with tap()
 */
const clearNodes = ({ data: { nodes } }) => {
  nodes.forEach((node) => {
    node.rank = null;
    node.order = null;
    node.isChild = false;
    node.isParent = false;
    node.children = [];
    delete node.parent;
  });
};

/**
 * RANKING
 * Go through all the nodes until you have figured out what level each one lives out based
 * on assigning a higher level to children than parents. Returns a new props object.
 *
 * @return a new props object with extras.maxRank
 */
const rankNodes = (props) => {
  const { edges, nodes } = props.data;
  const { isDirected } = props.options;
  let maxRank = 0;

  const setRank = (node, child) => {
    child.rank = node.rank + 1;
    maxRank = Math.max(maxRank, child.rank);
  };

  const crawlAndSetRank = crawl(props, setRank);

  const assignRank = (node) => {
    if (node.rank === null) {
      node.rank = 0;
      crawlAndSetRank(node);
    }
  };

  // directed version
  if (isDirected) {
    // directed - rank by nodes that are only parents on top to be crawled first
    edges.forEach(assignEdgeParentChild);
    nodes.sort(compareByParentChild).forEach(assignRank);
  } else {
    // non-directed - rank by mass
    nodes.sort(compareByMass).forEach((node) => {
      if (node.rank === null) {
        node.rank = 0;
        crawlAndSetRank(node);
      }
    });
  }
  return mergeDeepRight(props, { extras: { maxRank } });
};

/**
 * ORDERING
 */
const orderNodesWithRank = orderNodes(); // Gets max rank from extras by default

/**
 * POSITIONING
 * Measuring the width required for a parent to reasonably fit all future generations:
 * - x position all nodes by combination of order and parent location. This may take a few passes.
 * - y position according to rank.
 *
 * @return {void} use with tap()
 */
const positionNodes = ({
  data: { nodes },
  options: {
    direction,
    horizontalNodeSpacing,
    verticalNodeSpacing,
    spaceNodesByScreenSize,
  },
  extras: { maxRank },
  scr,
}) => {
  // Get the initial coordinates based on direction
  const nodesToAssignCoords = nodes.filter(shouldAssignCoords);
  const coords = nodesToAssignCoords.map((node) => {
    let x;
    let y;
    // up-down or down-up
    if (['UD', 'DU'].includes(direction)) {
      x = node.order || 0;
      y = direction === 'DU' ? maxRank - node.rank : node.rank;
    } else {
      // left-right or right-left
      x = direction === 'RL' ? maxRank - node.rank : node.rank;
      y = node.order || 0;
    }
    return { id: node.id, x, y };
  });

  const spacingFn = spaceNodesByScreenSize
    ? scaleCoordsByScreenSize(coords, scr)
    : scaleCoords(horizontalNodeSpacing, verticalNodeSpacing);
  // Apply spacing and assign the coordinates
  const coordsWithSpacing = coords.map(spacingFn);
  const coordsByNodeId = new Map(getCoordsKeyValuePairs(coordsWithSpacing));
  nodesToAssignCoords.forEach(assignCoords(({ id }) => coordsByNodeId.get(id)));
};

const layoutNodes = pipe(
  tap(clearNodes),
  rankNodes,
  tap(orderNodesWithRank),
  tap(positionNodes),
);

const defaultOptions = {
  horizontalNodeSpacing: 100,
  verticalNodeSpacing: 200,
  isDirected: false, // uses the direction of edges to figure out placement
  spaceNodesByScreenSize: true, // Automatically determine node spacing based on screen size
  direction: 'UD', // UD, DU, LR, RL
};

// expect data to have been put into DataSet format
// expect standard options
const hierarchical = (data, options, scr, onStopped) => {
  const opts = mergeDeepRight(defaultOptions, options);
  const { nodeMap, edgeMap } = data;

  const nodes = [];
  const edges = [];
  nodeMap.forEach((value, key, map) => {
    nodes.push(value);
  });

  edgeMap.forEach((value, key, map) => {
    edges.push(value);
  });
  layoutNodes({ data: { nodes, edges }, scr, options: opts });
  nodes.forEach((n) => {
    delete n.width;
    delete n.parent;
    delete n.isParent;
    delete n.isChild;
    delete n.children;
    delete n.order;
    delete n.rank;
  });

  // call onStopped at end of pass
  if (onStopped) {
    onStopped();
  }

  return true;
};

export default hierarchical;
