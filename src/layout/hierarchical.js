/* eslint-disable no-param-reassign */
import { merge } from 'lodash';

const defaultOpts = {
  nodeSpacing: 100,
  isDirected: false, // uses the direction of edges to figure out placement
  direction: 'UD', // UD, DU, LR, RL
};

// expect data to have been put into DataSet format
// expect standard options
const Hierarchical1 = (data, options = {}, screen, onStopped) => {
  const opts = merge(defaultOpts, options);
  const { nodeSpacing, direction, isDirected } = opts;
  const { nodeMap, edgeMap } = data;

  const nodes = [];
  const edges = [];
  nodeMap.forEach((value, key, map) => {
    nodes.push(value);
  });

  edgeMap.forEach((value, key, map) => {
    edges.push(value);
  });

  /* 
  Pre-process -
  * add children to each node so they can be traversed
  * find the nodes with no parents

  rank
  * go through all the nodes until you have figured out what level each one lives out based 
    assigining a higher level to childrn than parents

  order
  * look through each level and order the members so they are grouped under parents, if nodes have 2 parents,
    move those parents closer to each other.  

  position
  * now, measuring the width required for a parent to reasonably fit all future generations, 
    x position all nodes by combination of order and parent location.  This may take a few passes.
    y position according to rank.
  */

  // clear everything
  nodes.forEach((n) => {
    n.rank = null;
    n.order = null;
    n.isChild = false;
    n.isParent = false;
    n.children = [];
    delete n.parent;
  });

  let maxRank = 0;

  // should apply width to all children
  const getWidth = (node) => {
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

  // directed version
  if (isDirected) {
    edges.forEach((ed) => {
      ed.end.isChild = true;
      ed.start.isParent = true;
    });

    // directed - rank by nodes that are only parents on top to be crawled first
    const sortedNodes = nodes.sort((a, b) => {
      const aVal = a.isParent && !a.isChild ? 1 : 0;
      const bVal = b.isParent && !b.isChild ? 1 : 0;
      return bVal - aVal || b.mass - a.mass;
    });

    const crawl = (n) => {
      edges.forEach((edge) => {
        const nid = n.id.toString();
        let otherNode;
        if (
          edge.definition.from.toString() === nid &&
          edge.definition.to !== edge.from
        ) {
          otherNode = edge.end;
        }

        if (
          otherNode &&
          otherNode.rank === null &&
          otherNode.parent === undefined
        ) {
          otherNode.parent = n;
          otherNode.rank = n.rank + 1;
          maxRank = Math.max(maxRank, otherNode.rank);
          n.children.push(otherNode);
        }
      });

      n.children.sort((a, b) => a.mass - b.mass);
      n.children.forEach((nd) => {
        crawl(nd);
      });

      getWidth(n);
    };

    sortedNodes.forEach((n) => {
      if (n.rank === null) {
        n.rank = 0;
        crawl(n);
      }
    });
  } else {
    // non-directed - rank by mass
    const massSortedNodes = nodes.sort((a, b) => {
      const aVal = a.mass || 0;
      const bVal = b.mass || 0;
      return bVal - aVal;
    });

    const crawl2 = (n) => {
      edges.forEach((edge) => {
        const nid = n.id.toString();
        let otherNode;
        if (
          edge.definition.to.toString() === nid &&
          edge.definition.to !== edge.from
        ) {
          otherNode = edge.start;
        } else if (
          edge.definition.from.toString() === nid &&
          edge.definition.to !== edge.from
        ) {
          otherNode = edge.end;
        }

        if (
          otherNode &&
          otherNode.rank === null &&
          otherNode.parent === undefined
        ) {
          otherNode.parent = n;
          otherNode.rank = n.rank + 1;
          maxRank = Math.max(maxRank, n.rank + 1);
          n.children.push(otherNode);
        }
      });

      n.children.sort((a, b) => b.mass - a.mass);
      n.children.forEach((nd) => {
        crawl2(nd);
      });
      getWidth(n);
    };

    const maxMass = massSortedNodes[0] ? massSortedNodes[0].mass : 0;
    massSortedNodes.forEach((n) => {
      if (n.mass === maxMass && n.rank === null) {
        // start with the most connected nodes
        n.rank = 0;
        crawl2(n);
      } else if (n.rank === null) {
        n.rank = 0;
        crawl2(n);
      }
    });
  }

  for (let i = 0; i < maxRank + 1; i++) {
    const sameRankNodes = nodes.filter((n) => n.rank === i);
    sameRankNodes.sort((a, b) => {
      const aVal = a.parent !== undefined ? a.parent.order : 0;
      const bVal = b.parent !== undefined ? b.parent.order : 0;
      return aVal - bVal || b.width - a.width || b.mass - a.mass;
    });

    let ct = 0;
    let oldParent = null;

    sameRankNodes.forEach((nd) => {
      // every time there is a new parent, we reset the count
      if (nd.parent && nd.parent !== oldParent) {
        ct = 0;
      }
      oldParent = nd.parent;
      if (!nd.order) {
        ct += nd.width === 1 ? 0 : nd.width / 2;
        const pw = nd.parent !== undefined ? nd.parent.width : 0;

        nd.order =
          (nd.parent !== undefined
            ? nd.parent.order - (pw > 1 ? pw / 2 : 0)
            : 0) + ct;
        ct += nd.width === 1 ? 1 : nd.width / 2;
      }
    });
  }

  // 2nd pass
  for (let i = 0; i < maxRank + 1; i++) {
    const sameRankNodes = nodes.filter((n) => n.rank === i);
    sameRankNodes.sort((a, b) => {
      const aVal = a.order;
      const bVal = b.order;
      return aVal - bVal;
    });

    let oldOrder = null;
    let shift = 0;

    sameRankNodes.forEach((nd) => {
      nd.order += shift;
      if (nd.order === oldOrder) {
        shift++;
        nd.order = nd.order + shift;
        nd.children.forEach((ch) => {
          if (ch.rank > nd.rank) {
            ch.order = ch.order + shift;
          }
        });
      }
      oldOrder = nd.order;
    });
  }

  // assign coordinates
  // direction matters!
  const isnt = (v) => v === undefined || v === null || v === false;
  nodes.forEach((nd) => {
    if (isnt(nd.x) || isnt(nd.y) || isnt(nd.fixed)) {
      let x;
      let y;
      // up-down or down-up
      if (['UD', 'DU'].includes(direction)) {
        x = nd.order * nodeSpacing || 0;
        y = (direction === 'DU' ? maxRank - nd.rank : nd.rank) * nodeSpacing;
      } else {
        // left-right or right-left
        y = nd.order * nodeSpacing || 0;
        x = (direction === 'RL' ? maxRank - nd.rank : nd.rank) * nodeSpacing;
      }

      if (nd.x !== undefined) {
        nd.destination = { x, y };
      } else {
        nd.x = x;
        nd.y = y;
      }
    }
    delete nd.width;
  });

  // call onStopped at end of pass
  if (onStopped) {
    onStopped();
  }

  return true;
};

export default Hierarchical1;
