export function drawText(
  ctx,
  lbl,
  size,
  fill,
  fontSize,
  allowedCharacters,
  sizeFactor,
) {
  const txt = typeof lbl === 'string' ? lbl : JSON.stringify(lbl); // for non string labels
  ctx.fillStyle = fill;
  ctx.font = `${fontSize * 0.8}px Lato, Arial`;
  ctx.textAlign = 'center';
  const fitText = `${txt.substring(0, allowedCharacters)}${
    txt.length > allowedCharacters ? '…' : ''
  }`;
  ctx.fillText(fitText, 0, size / 1.8 * sizeFactor);
}
