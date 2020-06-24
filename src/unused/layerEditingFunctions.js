const HANDLE_OFFSET = 8;

export function getHandles(item) {
  const getHandleData = () => ({
    width: HANDLE_OFFSET * 2,
    height: HANDLE_OFFSET * 2,
    shape: 'handle',
    style: { fill: 'rgba(100,100,100, 1)', line: '#dddddd', lineWidth: 1 },
  });
  const width = item.width || item.size;
  const height = item.height || item.size;
  const c = item.x + width / 2 - HANDLE_OFFSET;
  const m = item.y + height / 2 - HANDLE_OFFSET;
  const l = item.x - HANDLE_OFFSET * 2;
  const r = item.x + width;
  const t = item.y - HANDLE_OFFSET * 2;
  const b = item.y + height;
  return [
    {
      id: 'boundingBox',
      noClick: true,
      x: item.x - HANDLE_OFFSET,
      y: item.y - HANDLE_OFFSET,
      width: width + HANDLE_OFFSET * 2,
      height: height + HANDLE_OFFSET * 2,
      shape: 'rectangle',
      style: { fill: 'rgba(100,100,100, 0)', line: '#aaaaaa', lineWidth: 1 },
    },
    {
      id: 'lt',
      x: l,
      y: t,
      ...getHandleData(),
    },
    {
      id: 'ct',
      x: c,
      y: t,
      ...getHandleData(),
    },
    {
      id: 'rt',
      x: r,
      y: t,
      ...getHandleData(),
    },
    {
      id: 'rm',
      x: r,
      y: m,
      ...getHandleData(),
    },
    {
      id: 'rb',
      x: r,
      y: b,
      ...getHandleData(),
    },
    {
      id: 'cb',
      x: c,
      y: b,
      ...getHandleData(),
    },
    {
      id: 'lb',
      x: l,
      y: b,
      ...getHandleData(),
    },
    {
      id: 'lm',
      x: l,
      y: m,
      ...getHandleData(),
    },
  ];
}

export function updateHandles(item, handles) {
  const width = item.width || item.size;
  const height = item.height || item.size;
  const c = item.x + width / 2 - HANDLE_OFFSET;
  const m = item.y + height / 2 - HANDLE_OFFSET;
  const l = item.x - HANDLE_OFFSET * 2;
  const r = item.x + width;
  const t = item.y - HANDLE_OFFSET * 2;
  const b = item.y + height;
  handles.forEach((h) => {
    switch (h.id) {
      case 'lt':
        h.x = l;
        h.y = t;
        break;
      case 'ct':
        h.x = c;
        h.y = t;
        break;
      case 'rt':
        h.x = r;
        h.y = t;
        break;
      case 'rm':
        h.x = r;
        h.y = m;
        break;
      case 'rb':
        h.x = r;
        h.y = b;
        break;
      case 'cb':
        h.x = c;
        h.y = b;
        break;
      case 'lb':
        h.x = l;
        h.y = b;
        break;
      case 'lm':
        h.x = l;
        h.y = m;
        break;
      case 'boundingBox':
        h.x = item.x - HANDLE_OFFSET;
        h.y = item.y - HANDLE_OFFSET;
        h.width = width + HANDLE_OFFSET * 2;
        h.height = height + HANDLE_OFFSET * 2;
        break;
      default:
        break;
    }
  });
}

const checkItemClick = (n, pos) => {
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

export function checkLayerClick(layer, pos) {
  if (!layer.data) {
    return false;
  }
  // for is more performant because we break when a node is found
  for (let i = layer.data.length - 1; i >= 0; i--) {
    const n = layer.data[i];
    const clicked = checkItemClick(n, pos);
    if (clicked) {
      return n;
    }
  }
  return false;
}
