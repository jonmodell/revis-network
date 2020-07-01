import { mergeDeepRight, pipe, tap } from 'ramda';
import {
  assignCoords,
  assignEdgeParentChild,
  compareByMass,
  compareByParentChild,
  crawl,
  getCoordsKeyValuePairs,
  orderNodes,
  shouldAssignCoords,
} from './utils';

/**
A layout is a function that takes a set of RevisDataset data and manipulates through it's 
own defined logic.  Said logic can be based upon arbitrary options, also passed in.
The third parameter, screen, allows for inspection of the screen size
**/

// track nodes that have already been assigned as a child to avoid double child crawling
const resetNodes = ({ data: { nodes }, options: { groupingOrder } }) =>
  nodes.forEach((node) => {
    node.rank = null;
    node.preRank = null;
    node.order = null;
    node.children = [];
    delete node.parent;
    if (node.decorationType === undefined) {
      node.decorationType = node.definition.type || 'unknown';
    }
    node.groupingIndex = groupingOrder.indexOf(
      node.decorationType.toLowerCase(),
    );
    if (node.groupingIndex === -1) {
      node.groupingIndex = groupingOrder.length - 1;
    }
  });

/**
 * RANKING
 * Go through all the nodes until you have figured out what level each one lives out based
 * on assigning a higher level to children than parents. Returns a new props object.
 *
 * @return props with extras.maxPreRank
 */
const rankNodes = (props) => {
  const { edges, nodes } = props.data;
  const { isDirected } = props.options;
  let maxPreRank = 0;

  const crawlAndSetPreRank = crawl(
    props,
    (node, child) => {
      child.preRank = node.preRank + 1;
      maxPreRank = Math.max(maxPreRank, child.preRank);
    },
    (child) => child.preRank === null,
  );

  const assignPreRank = (node) => {
    if (node.preRank === null) {
      node.preRank = 0;
      crawlAndSetPreRank(node);
    }
  };

  if (isDirected) {
    // Directed - rank by nodes that are only parents on top to be crawled first
    edges.forEach(assignEdgeParentChild);
    nodes.sort(compareByParentChild).forEach(assignPreRank);
  } else {
    // Non-directed - rank by mass
    nodes.sort(compareByMass).forEach(assignPreRank);
  }
  return mergeDeepRight(props, { extras: { maxPreRank } });
};

/**
 * GROUPING
 * 1. Group nodes by type
 * 2. Crawl the nodes in the type looking for
 *   a) nodes that have no parents of that type
 *     - assign them to top rank for that type
 *     - assign that rank the type's top rank
 *     - crawl the rest of the nodes of that type
 *     - assign the max rank for that type to the type's bottom rank
 *   b) layout x coordinates using getWidth still
 *
 * @return props with extras.maxRank
 */
const groupNodes = (props) => {
  const { nodes } = props.data;
  const { groupingOrder } = props.options;
  const { scr } = props;
  let maxRank = 0;

  // Group nodes by type, only the groups that have members get in
  const groupings = [];
  groupingOrder.forEach((go) => {
    const members = nodes.filter(
      (node) => node.decorationType.toLowerCase() === go.toLowerCase(),
    );
    if (members.length > 0) {
      const grp = {
        name: go,
        minRank: null,
        maxRank: null,
        members,
        topNodes: [],
        width: scr.width,
        x: 0,
      };
      groupings.push(grp);
    }
  });

  const crawlInGroup = (node) => {
    node.children.forEach((child) => {
      if (!child.rank && child.groupingIndex === node.groupingIndex) {
        child.rank = node.rank + 1;
        maxRank = Math.max(maxRank, node.rank + 1);
        crawlInGroup(child);
      }
    });
  };

  // Crawl the nodes in the type looking for nodes that have no parents of that type
  groupings.forEach((grouping) => {
    grouping.minRank = maxRank;
    grouping.members.sort((b, a) => b.preRank - a.preRank);
    grouping.members.forEach((node) => {
      if (
        !node.rank ||
        !node.parent ||
        node.parent.groupingIndex !== node.groupingIndex
      ) {
        node.rank = grouping.minRank;
        crawlInGroup(node);
      }
    });

    grouping.members.forEach((node) => {
      if (!node.rank) {
        node.rank = grouping.minRank;
      }
    });

    grouping.maxRank = maxRank;
    maxRank++;
  });

  return mergeDeepRight(props, { extras: { groupings, maxRank } });
};

/**
 * ORDERING
 */
const orderNodesWithMaxPreRank = orderNodes(
  (node) => node.preRank,
  ({ extras: { maxPreRank } }) => maxPreRank,
);

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
  options: { horizontalNodeSpacing, verticalNodeSpacing },
}) => {
  const nodesToAssignCoords = nodes.filter(shouldAssignCoords);
  const coords = nodesToAssignCoords.map(({ id, order, rank }) => ({
    id,
    x: order * horizontalNodeSpacing,
    y: rank * verticalNodeSpacing,
  }));
  const coordsByNodeId = new Map(getCoordsKeyValuePairs(coords));
  nodesToAssignCoords.forEach(assignCoords(({ id }) => coordsByNodeId.get(id)));
};

/**
 * DECORATION RENDERING
 *
 * @return {void} use with tap()
 */
const renderDecorations = ({
  data: { shapes },
  extras: { groupings },
  options: { decoratorSpacing, verticalNodeSpacing },
}) => {
  if (shapes?.length) {
    shapes.forEach((decoration) => {
      const decorationMatch = groupings.find(
        (grouping) =>
          grouping.name.toLowerCase() === decoration.group.toLowerCase(),
      );
      if (decorationMatch) {
        decoration.y =
          decorationMatch.minRank * verticalNodeSpacing -
          verticalNodeSpacing / 2 +
          decoratorSpacing / 2;
        decoration.height =
          (decorationMatch.maxRank - decorationMatch.minRank + 1) *
            verticalNodeSpacing -
          decoratorSpacing;
        decoration.x = 0;
        decoration.width = decorationMatch.width;
        decoration.visible = true;
      } else {
        decoration.visible = false;
      }
    });
  }
};

const layoutNodes = pipe(
  tap(resetNodes),
  rankNodes,
  groupNodes,
  tap(orderNodesWithMaxPreRank),
  tap(positionNodes),
  tap(renderDecorations),
);

const defaultOptions = {
  horizontalNodeSpacing: 100,
  verticalNodeSpacing: 200,
  decoratorSpacing: 20,
  groupingOrder: [
    'businessservice',
    'itservice',
    'deviceservice',
    'application',
    'applicationcomponent',
    'device',
    'unknown',
  ],
};

// expect data to have been put into DataSet format
// expect standard options
const tieredHierarchical = (data, options, scr, onStopped) => {
  const allOptions = options
    ? mergeDeepRight(defaultOptions, options)
    : { ...defaultOptions };

  const { nodeMap, edgeMap } = data;

  const nodes = [];
  const edges = [];
  nodeMap.forEach((value, key, map) => {
    nodes.push(value);
  });

  edgeMap.forEach((value, key, map) => {
    edges.push(value);
  });

  const arrayedData = { nodes, edges, shapes: data.shapes };

  layoutNodes({ data: arrayedData, options: allOptions, scr });

  // call onStopped at end of pass
  if (onStopped) {
    onStopped();
  }
  return true;
};

export default tieredHierarchical;
