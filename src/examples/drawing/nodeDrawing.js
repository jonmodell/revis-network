/* @flow */
/* eslint-disable no-param-reassign */

// s = scale in the functions below
function makeSquare(ctx, s) {
  const x = 0;
  const y = 0;
  const width = 10;
  const height = 10;
  const radius = 1;
  ctx.beginPath();
  ctx.save();
  ctx.scale(s, s); // NEW!  Scale after save to have scale operations only apply to drawing.
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.restore();
}

function makeHexagon(ctx, s) {
  const f = 10; // full height
  const h = 5; // half
  const ho = 2; // height offset
  const wo = 0.5;

  const radius = 0.5;
  ctx.beginPath();
  ctx.save();
  ctx.scale(s, s); // NEW!  Scale after save to have scale operations only apply to drawing.

  ctx.moveTo(h + radius * 2, radius); // top mid
  ctx.lineTo(f - radius - wo, h - ho - radius); // right upper
  ctx.quadraticCurveTo(f - wo, h - ho, f - wo, h - ho + radius);
  ctx.lineTo(f - wo, h + ho - radius); // right lower
  ctx.quadraticCurveTo(f - wo, h + ho, f - radius - wo, h + ho + radius);
  ctx.lineTo(h + radius * 2, f - radius); // bottom mid
  ctx.quadraticCurveTo(h, f, h - radius * 2, f - radius); // bottom mid
  ctx.lineTo(radius + wo, h + ho + radius); // left lower
  ctx.quadraticCurveTo(wo, h + ho, wo, h + ho - radius);
  ctx.lineTo(wo, h - ho + radius); // left upper
  ctx.quadraticCurveTo(wo, h - ho, radius + wo, h - ho - radius);
  ctx.lineTo(h - radius * 2, radius);
  ctx.quadraticCurveTo(h, 0, h + radius * 2, radius);

  ctx.restore();
  ctx.closePath();
}

function makeDiamond(ctx, s) {
  const seg = 10;
  const hSeg = seg * 0.5;
  const radius = 1;
  ctx.beginPath();
  ctx.save();
  ctx.scale(s, s); // NEW!  Scale after save to have scale operations only apply to drawing.
  ctx.moveTo(hSeg + radius, radius);
  ctx.lineTo(seg - radius, hSeg - radius);
  ctx.quadraticCurveTo(seg, hSeg, seg - radius, hSeg + radius);
  ctx.lineTo(hSeg + radius, seg - radius);
  ctx.quadraticCurveTo(hSeg, seg, hSeg - radius, seg - radius);
  ctx.lineTo(radius, hSeg + radius);
  ctx.quadraticCurveTo(0, hSeg, radius, hSeg - radius);
  ctx.lineTo(hSeg - radius, radius);
  ctx.quadraticCurveTo(hSeg, 0, hSeg + radius, radius);
  ctx.closePath();
  ctx.restore();
}

const makeCircle = (ctx, node, s) => {
  ctx.save();
  ctx.scale(s, s);
  ctx.arc(5, 5, 5, 0, 2 * Math.PI, false);
  ctx.restore();
};

// context, this.node, size, this.selected)
export const makeNodeShape = (ctx, node, size) => {
  const scale = size / 10;
  switch (node.shape) {
    case 'circle':
      makeCircle(ctx, node, scale);
      break;
    case 'square':
      makeSquare(ctx, scale);
      break;
    case 'diamond':
      makeDiamond(ctx, scale);
      break;
    case 'hexagon':
      makeHexagon(ctx, scale);
      break;
    default:
      makeSquare(ctx, scale);
      break;
  }
};

export default makeNodeShape;
