/* @flow */

// s = scale in the functions below
function makeSquare(ctx, x, y, s) {
  ctx.rect(0, 0, s, s);
}

function makeLine(ctx, x, y) {
  ctx.moveTo(0, 0);
  ctx.lineTo(x, y);
}

function makeCloud(ctx, width, height) {
  const faces = 9;
  const x = width / 2;
  const y = height / 2;
  ctx.moveTo(x + x * Math.cos(0), y + y * Math.sin(0));
  for (let side = 0; side < faces; side++) {
    ctx.quadraticCurveTo(
      x + x * 1.3 * Math.cos(((side + 0.5) * 2 * Math.PI) / faces),
      y + y * 1.3 * Math.sin(((side + 0.5) * 2 * Math.PI) / faces),
      x + x * Math.cos(((side + 1) * 2 * Math.PI) / faces),
      y + y * Math.sin(((side + 1) * 2 * Math.PI) / faces),
    );
  }
}

function makeRect(ctx, width, height) {
  ctx.rect(0, 0, width, height);
}

function makePolygon(ctx, faces, x, y, width, height) {
  ctx.moveTo(x + width * Math.cos(0), y + height * Math.sin(0));
  for (let side = 0; side < faces + 1; side++) {
    ctx.lineTo(
      x + width * Math.cos((side * 2 * Math.PI) / faces),
      y + height * Math.sin((side * 2 * Math.PI) / faces),
    );
  }
}

function getLines(ctx, text, maxWidth) {
  if (!text) {
    return [];
  }
  const paragraphs = text ? text.split('\n') : '';
  const lines = [];
  paragraphs.forEach((p) => {
    const words = p.split(' ');
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(`${currentLine} ${word}`).width;
      if (width < maxWidth) {
        currentLine += ` ${word}`;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
  });

  return lines;
}
function makeText(ctx, node) {
  const d = node;
  const { text } = d;
  let { fontSize } = d;
  if (fontSize === undefined) {
    fontSize = 20;
  }
  const width = node.width;
  const height = node.height;
  const alignment = d.textAlign || 'left';
  const background = d.background || false;
  if (background) {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = `rgba(100,100,100,0.2)`;
    ctx.rect(0, 0, width, height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.beginPath();
  }

  ctx.font = `${fontSize}px Lato`;
  const lines = getLines(ctx, text, width - 10);
  ctx.textAlign = alignment;
  if (alignment === 'center') {
    ctx.translate(width / 2, 0);
  } else if (alignment === 'right') {
    ctx.translate(width - 10, 5);
  } else {
    ctx.translate(10, 5);
  }
  let heightTracker = fontSize;
  lines.forEach((l) => {
    if (heightTracker < height) {
      ctx.fillText(l, 0, fontSize);
      ctx.translate(0, fontSize * 1.5);
      heightTracker += fontSize * 1.5;
    }
  });
}

const makeCircle = (ctx, width, height) => {
  ctx.ellipse(width, height, width, height, 0, 0, 2 * Math.PI);
  // ctx.arc(width, width, width, 0, 2 * Math.PI, false);
};

function makeImage(ctx, node) {
  const sc = node.scale || 1;
  ctx.rect(0, 0, node.width * sc, node.height * sc);
}

// context, this.node, size, this.selected)
const makeShape = (ctx, node) => {
  const width = node.width || node.size;
  const height = node.height || node.size;
  switch (node.shape) {
    case 'circle':
      makeCircle(ctx, width / 2, height / 2);
      break;
    case 'ellipse':
      makeCircle(ctx, width / 2, height / 2);
      break;
    case 'line':
      makeLine(ctx, width / 2, height / 2);
      break;
    case 'cloud':
      makeCloud(ctx, width, height);
      break;
    case 'square':
      makeSquare(ctx, 0, 0, width);
      break;
    case 'rectangle':
      makeRect(ctx, width, height);
      break;
    case 'text':
      makeText(ctx, node);
      break;
    case 'hexagon':
      makePolygon(ctx, 6, width / 2, width / 2, width / 2);
      break;
    case 'polygon':
      makePolygon(
        ctx,
        node.faces,
        width / 2,
        height / 2,
        width / 2,
        height / 2,
      );
      break;
    case 'image':
      makeImage(ctx, node);
      break;
    default:
      makeSquare(ctx, 0, 0, 50);
      break;
  }
};

export default makeShape;
