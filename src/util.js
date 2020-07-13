const SCREEN_PAN_MARGIN = 35;
const ZOOM_FACTOR = 0.002;
const MIN_ZOOM = 0.6;
const MAX_ZOOM = 6;

// if we are dragging off screen, pan with the edges of the screen
// the screenSettings.screenPan setting changes the pan by that amount during the ReVisNetwork.draw function
export function getScreenEdgePan(sc, e) {
  const br = sc.boundingRect;
  const d = SCREEN_PAN_MARGIN;
  const screenPan = { x: 0, y: 0 };
  // if the mouse x is less than the margin for panning, we change the screenPan
  if (e.clientX < d + br.left) {
    screenPan.x = d + br.left - e.clientX;
  } else if (e.clientX > br.width + br.left - d) {
    screenPan.x = -(d - (br.width + br.left - e.clientX));
  }

  if (e.clientY < d + br.top) {
    screenPan.y = d + br.top - e.clientY;
  } else if (e.clientY > br.height + br.top - d) {
    screenPan.y = -(d - (br.height + br.top - e.clientY));
  }
  return screenPan.x || screenPan.y ? screenPan : null;
}

// translate a node position into DOM coordinates relative to the canvas
export function getNodeScreenPos(n, tracking) {
  const { pan, scale } = tracking;
  const x = n.x * scale + pan.x;
  const y = n.y * scale + pan.y;
  return { x, y };
}

// figure out if a hover window should go left, right, above or below based on screen position
export function getHoverPos(pos, screen, panScaleState, opts) {
  const nodeSize = opts.nodes.defaultSize;
  const { width, height } = screen.boundingRect;
  const { scale } = panScaleState;
  const nodeOffset = (nodeSize * scale) / 2;
  const x = pos.x > width * 0.5 ? pos.x - opts.hover.width : pos.x;
  const y =
    pos.y > height * 0.5
      ? pos.y - opts.hover.height - nodeOffset
      : pos.y + nodeOffset;
  return { x, y };
}

// detect node and mouse collisions for nodeClicking
export function checkNodeAtPosition(node, position) {
  const offset = node.bSize / 2;
  return (
    position.x > node.x - offset &&
    position.x < node.x + offset &&
    position.y > node.y - offset &&
    position.y < node.y + offset
  );
}

// looks through the dataset and returns a node at a given mouse position if there is one
export function getNodeAtPosition(nodes, pos) {
  for (const node of nodes.values()) {
    if (checkNodeAtPosition(node, pos)) {
      return node;
    }
  }
  return null;
}

// looks through the dataset and returns an edge at a given mouse position if there is one
export function getEdgeAtPosition(edges, pos, edgeOptions) {
  for (const edge of edges.values()) {
    if (edge.getDistanceFrom(pos, edgeOptions) < 10) {
      return edge;
    }
  }
  return null;
}

export const getBounds = (nds = [], shps = []) => {
  const combined = [
    ...nds,
    ...shps.filter((s) => s && s.boundsIgnore === undefined),
  ];
  const first = combined[0];
  if (!first) {
    return { maxX: 100, minX: 0, maxY: 100, minY: 0, width: 100, height: 100 };
  }
  const bds = { maxX: first.x, minX: first.x, maxY: first.y, minY: first.y };
  combined.forEach((n) => {
    const newX = n.destination?.x || n.x || 0;
    const newY = n.destination?.y || n.y || 0;
    bds.maxX = Math.max(bds.maxX, newX + (n.width || n.size || 30));
    bds.maxY = Math.max(bds.maxY, newY + (n.height || n.size || 30));
    bds.minX = Math.min(bds.minX, newX - 30);
    bds.minY = Math.min(bds.minY, newY - 30);

    bds.width = bds.maxX - bds.minX;
    bds.height = bds.maxY - bds.minY;
  });
  return bds;
};

export const getBoundsScale = (height, width, bounds, opts) => {
  const nodeSize = opts.nodes.defaultSize;
  const hf = height / (bounds.height + nodeSize * 2); // height factor
  const wf = width / (bounds.width + nodeSize * 2); // width factor
  return Math.min(hf, wf); // return the lesser of the 2
};

export function getPanScaleFromMouseWheel(
  e,
  panScaleState,
  screen,
  bounds,
  opts,
) {
  const { scale, pan } = panScaleState;
  const { height, width, boundingRect } = screen;
  const boundScale = getBoundsScale(height, width, bounds, opts);
  const realMinZoom = Math.min(MIN_ZOOM, boundScale) * 0.95; // * 0.95 provides a margin
  const newScale = Math.min(
    Math.max(realMinZoom, scale - ZOOM_FACTOR * e.deltaY),
    MAX_ZOOM,
  );

  // raw mouse cooridnates
  const mouseX = e.clientX - boundingRect.left;
  const mouseY = e.clientY - boundingRect.top;

  // account for pan, but not scale.  pm = panMouse
  const pm = { x: mouseX - pan.x, y: mouseY - pan.y };
  const diffPt = {
    x: (pm.x * newScale - pm.x * scale) / scale,
    y: (pm.y * newScale - pm.y * scale) / scale,
  };

  // offset so the mouse stays at the center of the zoom
  const newPan = {
    x: pan.x - diffPt.x,
    y: pan.y - diffPt.y,
  };

  return { ...panScaleState, scale: newScale, pan: newPan };
}

export function getFitToScreen(bounds, screen, padding, opts) {
  if (!bounds) {
    return null;
  }
  const nodeSize = opts.nodes.defaultSize;
  const { horizontal, vertical } = padding;
  const hf = (screen.height - vertical) / (bounds.height + nodeSize * 2);
  const wf = (screen.width - horizontal) / (bounds.width + nodeSize * 2);
  const scale = Number(Math.min(hf, wf).toFixed(4));
  const x = screen.width / 2 - (bounds.width / 2 + bounds.minX) * scale;
  const y = screen.height / 2 - (bounds.height / 2 + bounds.minY) * scale;
  const pan = { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
  return { scale, pan };
}

export const getMousePos = (e, screen, panZoomState) => {
  const { boundingRect } = screen;
  const { scale, pan } = panZoomState;
  if (!boundingRect) {
    return { x: -1000, y: -1000 };
  }
  return {
    x: (e.clientX - boundingRect.left - pan.x) / scale,
    y: (e.clientY - boundingRect.top - pan.y) / scale,
  };
};

export const getNodePositions = (nodes) => {
  const ret = {};
  for (const node of nodes.values()) {
    ret[node.id] = { x: node.x, y: node.y };
  }
  return ret;
};

const keyMap = {
  ArrowUp: '_moveUp',
  ArrowDown: '_moveDown',
  ArrowLeft: '_moveLeft',
  ArrowRight: '_moveRight',
  '[': '_zoomOut',
  ']': '_zoomIn',
  pageup: '_zoomIn',
  pagedown: '_zoomOut',
  '1': '_1',
  '2': '_2',
  '3': '_3',
  '5': '_0.5',
};

export const getKeyAction = (key) => keyMap[key] || null;

export function addGraphEvents(canvas, scope) {
  if (!canvas || !canvas.focus) return false;
  canvas.focus();
  canvas.addEventListener('dblclick', scope.handleMouse.bind(scope, false));
  canvas.addEventListener('wheel', scope.handleMouseWheel.bind(scope, false));
  canvas.addEventListener('mousedown', scope.handleMouse.bind(scope, false));
  canvas.addEventListener('mousemove', scope.handleMouse.bind(scope, false));
  canvas.addEventListener('mouseup', scope.handleMouse.bind(scope, false));
  canvas.addEventListener('mouseleave', scope.handleMouse.bind(scope, false));
  canvas.addEventListener('keydown', scope.handleKey.bind(scope, false));
  canvas.addEventListener('keyup', scope.handleKey.bind(scope, false));
  return true;
}

export function removeGraphEvents(canvas, scope) {
  if (!canvas.removeEventListener) return false;
  canvas.removeEventListener('dblclick', scope.handleMouse);
  canvas.removeEventListener('wheel', scope.handleMouseWheel);
  canvas.removeEventListener('mousedown', scope.handleMouse);
  canvas.removeEventListener('mousemove', scope.handleMouse);
  canvas.removeEventListener('mouseup', scope.handleMouse);
  canvas.removeEventListener('mouseleave', scope.handleMouse);
  canvas.removeEventListener('keydown', scope.handleKey);
  canvas.removeEventListener('keyup', scope.handleKey);
  return true;
}

const checkShapeClick = (n, pos) => {
  if (
    n.noClick ||
    n.x === undefined ||
    n.y === undefined ||
    (n.size === undefined && n.width === undefined && n.height === undefined)
  ) {
    return false;
  }
  const bounds = {
    minX: n.x,
    maxX: n.x + (n.width || n.size),
    minY: n.y,
    maxY: n.y + (n.height || n.size),
  };
  if (
    pos.x > bounds.minX &&
    pos.x < bounds.maxX &&
    pos.y > bounds.minY &&
    pos.y < bounds.maxY
  ) {
    return true;
  }
  return false;
};

export function getShapeAtPos(shapes, pos) {
  for (let i = shapes.length - 1; i >= 0; i--) {
    const n = shapes[i];
    const clicked = checkShapeClick(n, pos);
    if (clicked) {
      return n;
    }
  }
  return false;
}

export function inViewPort(item, viewPort) {
  return (
    viewPort &&
    item.x < viewPort.right &&
    item.x > viewPort.left &&
    item.y > viewPort.top &&
    item.y < viewPort.bottom
  );
}

const HANDLE_OFFSET = 8;
const MIN_SHAPE_SIZE = 10;

export function getHandleAtPos(item, pos, scale) {
  const itemWidth = item.width || item.size;
  const itemHeight = item.height || item.size;
  const handleSize = HANDLE_OFFSET / scale;
  const offset = handleSize * 0.5;

  // drawHandle(context, l, t, handleSize);
  // context.rect(x, y, s, s);
  const c = item.x + itemWidth / 2 - offset;
  const m = item.y + itemHeight / 2 - offset;
  const l = item.x - handleSize * 2 + offset;
  const r = item.x + itemWidth + offset;
  const t = item.y - handleSize - offset;
  const b = item.y + itemHeight + offset;
  const handles = [
    { id: 'tl', x: l, y: t, size: handleSize },
    { id: 'tc', x: c, y: t, size: handleSize },
    { id: 'tr', x: r, y: t, size: handleSize },
    { id: 'bl', x: l, y: b, size: handleSize },
    { id: 'bc', x: c, y: b, size: handleSize },
    { id: 'br', x: r, y: b, size: handleSize },
    { id: 'ml', x: l, y: m, size: handleSize },
    { id: 'mr', x: r, y: m, size: handleSize },
  ];
  const handle = getShapeAtPos(handles, pos);
  return handle?.id;
}

export function setShapeByHandleDrag(si, handle, delta, ctrl) {
  const ret = { ...si };
  if (si && handle) {
    switch (handle) {
      case 'tl':
        ret.width = (si.width || si.size) - delta.x;
        ret.x += delta.x;
        ret.height = (si.height || si.size) - delta.y;
        ret.y += delta.y;
        break;
      case 'bl':
        ret.width = (si.width || si.size) - delta.x;
        ret.x += delta.x;
        ret.height = (si.height || si.size) + delta.y;
        break;
      case 'ml':
        ret.width = (si.width || si.size) - delta.x;
        ret.x += delta.x;
        break;
      case 'tr':
        ret.width = (si.width || si.size) + delta.x;
        ret.height = (si.height || si.size) - delta.y;
        ret.y += delta.y;
        break;
      case 'br':
        ret.width = (si.width || si.size) + delta.x;
        ret.height = (si.height || si.size) + delta.y;
        break;
      case 'mr':
        ret.width = (si.width || si.size) + delta.x;
        break;
      case 'bc':
        ret.height = (si.height || si.size) + delta.y;
        break;
      case 'tc':
        ret.height = (si.height || si.size) - delta.y;
        ret.y += delta.y;
        break;
      default:
        break;
    }
  }
  ret.width = Math.max(ret.width, MIN_SHAPE_SIZE);
  ret.height = Math.max(ret.height, MIN_SHAPE_SIZE);
  if (ctrl) {
    const smaller = Math.min(ret.width, ret.height);
    ret.height = smaller;
    ret.width = smaller;
  }
  return ret;
}
