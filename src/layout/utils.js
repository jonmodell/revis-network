export const compareByParentChild = (a, b) => {
  const aVal = a.isParent && !a.isChild ? 1 : 0;
  const bVal = b.isParent && !b.isChild ? 1 : 0;
  return bVal - aVal || b.mass - a.mass;
};

export const compareByMass = (a, b) => {
  const aVal = a.mass || 0;
  const bVal = b.mass || 0;
  return bVal - aVal;
};

export const compareByOrder = (a, b) => {
  const aVal = a?.parent?.order || 0;
  const bVal = b?.parent?.order || 0;
  return aVal - bVal || b.width - a.width || b.mass - a.mass;
};

export const assignEdgeParentChild = (edge) => {
  edge.end.isChild = true;
  edge.start.isParent = true;
};

// Applies width to node and all its children
export const getWidth = (node) => {
  if (node) {
    const w = Math.max(
      1,
      node.children.reduce((acc, c) => acc + getWidth(c), 0),
    );
    node.width = w;
    return w;
  }
  return 1;
};

// Crawls through a node and all its children. nodeCallback is called for each node.
export const crawl = (
  props,
  nodeCallback = () => {},
  childCondition = (child) => child.rank === null,
) => (node) => {
  const { edges } = props.data;
  const { isDirected } = props.options;
  edges.forEach((edge) => {
    const nid = node.id.toString();
    let child;
    // Only do this if non-directed
    if (
      !isDirected &&
      edge.definition.to.toString() === nid &&
      edge.definition.to !== edge.from
    ) {
      child = edge.start;
    } else if (
      edge.definition.from.toString() === nid &&
      edge.definition.to !== edge.from
    ) {
      child = edge.end;
    }

    if (child && childCondition(child) && child.parent === undefined) {
      child.parent = node;
      nodeCallback(node, child);
      node.children.push(child);
    }
  });

  node.children.sort((a, b) => a.mass - b.mass);
  node.children.forEach((child) => {
    crawl(props, nodeCallback, childCondition)(child);
  });

  getWidth(node);
};

/**
 * ORDERING
 * Looks through each level and order the members so they are grouped under parents, if
 * nodes have 2 parents, move those parents closer to each other.
 * Requires props.extras.maxRank
 *
 * @return {void} use with tap()
 */
export const orderNodes = (
  getNodeRank = (node) => node.rank,
  getMaxRank = ({ extras: { maxRank } }) => maxRank,
) => (props) => {
  const { nodes } = props.data;
  const maxRank = getMaxRank(props);
  for (let i = 0; i < maxRank + 1; i++) {
    const sameRankNodes = nodes.filter((node) => getNodeRank(node) === i);
    sameRankNodes.sort(compareByOrder);

    let count = 0;
    let oldParent = null;

    sameRankNodes.forEach((node) => {
      // every time there is a new parent, we reset the count
      if (node.parent && node.parent !== oldParent) {
        count = 0;
      }
      oldParent = node.parent;
      if (!node.order) {
        count += node.width === 1 ? 0 : node.width / 2;
        const parentWidth = node.parent !== undefined ? node.parent.width : 0;

        node.order =
          (node.parent !== undefined
            ? node.parent.order - (parentWidth > 1 ? parentWidth / 2 : 0)
            : 0) + count;
        count += node.width === 1 ? 1 : node.width / 2;
      }
    });
  }

  // 2nd pass
  for (let i = 0; i < maxRank + 1; i++) {
    const sameRankNodes = nodes.filter((node) => getNodeRank(node) === i);
    sameRankNodes.sort((a, b) => {
      const aVal = a.order;
      const bVal = b.order;
      return aVal - bVal;
    });

    let oldOrder = null;
    let shift = 0;

    sameRankNodes.forEach((node) => {
      node.order += shift;
      if (node.order === oldOrder) {
        shift++;
        node.order = node.order + shift;
        node.children.forEach((child) => {
          if (getNodeRank(child) > getNodeRank(node)) {
            child.order = child.order + shift;
          }
        });
      }
      oldOrder = node.order;
    });
  }
};

const falsyNonNumeric = (v) => v === undefined || v === null || v === false;

export const scaleCoords = (xSpacing, ySpacing) => (coords) => ({
  ...coords,
  x: coords.x * xSpacing,
  y: coords.y * ySpacing,
});

export const getBounds = (coords) => {
  let minX = 0;
  let minY = 0;
  let maxX = 0;
  let maxY = 0;
  coords.forEach(({ x, y }) => {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });
  return { minX, minY, maxX, maxY, height: maxY - minY, width: maxX - minX };
};

export const getNodeBounds = (nodes) => {
  let minX = 0;
  let minY = 0;
  let maxX = 0;
  let maxY = 0;
  nodes.forEach((n) => {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x);
    maxY = Math.max(maxY, n.y);
  });
  return { minX, minY, maxX, maxY, height: maxY - minY, width: maxX - minX };
};

// Returns a scaleCoords function based on screen size
export const scaleCoordsByScreenSize = (coords, screen) => {
  const { width: screenWidth, height: screenHeight } = screen;
  const { minX, minY, maxX, maxY } = getBounds(coords);

  // Determine width and height by getting distance between mins and maxes
  const layoutWidth = maxX - minX || 1;
  const layoutHeight = maxY - minY || 1;

  // Determine spacing by getting multiplier to match layout to screen
  const xSpacing = screenWidth / layoutWidth;
  const ySpacing = screenHeight / layoutHeight;

  // Make sure x spacing is at least 50 to prevent overlap (labels too) when zoomed in
  const adjustedXSpacing = 100;
  // Scale y spacing based on adjusted x spacing
  const adjustedYSpacing = Math.max(
    Math.min((ySpacing * adjustedXSpacing) / xSpacing, 500),
    100,
  );

  return scaleCoords(adjustedXSpacing, adjustedYSpacing);
};

export const getCoordsKeyValuePairs = (coords) => coords.map((c) => [c.id, c]);

export const shouldAssignCoords = ({ x, y, fixed }) =>
  falsyNonNumeric(x) || falsyNonNumeric(y) || falsyNonNumeric(fixed);

export const assignCoords = (getCoords) => (node) => {
  const { x, y } = getCoords(node);
  if (node.x !== undefined || node.y !== undefined) {
    node.destination = { x, y };
  } else {
    node.x = x;
    node.y = y;
  }
};
