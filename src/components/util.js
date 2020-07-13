export function drawText(
  ctx,
  lbl,
  fill,
  fontSize,
  allowedCharacters,
  sizeFactor,
) {
  const txt = typeof lbl === 'string' ? lbl : JSON.stringify(lbl); // for non string labels
  ctx.fillStyle = fill;
  ctx.font = `${fontSize}px Lato, Arial`;
  ctx.textAlign = 'center';
  const fitText = `${txt.substring(0, allowedCharacters)}${
    txt.length > allowedCharacters ? '…' : ''
  }`;
  ctx.fillText(fitText, 0, 0);
}

export function drawImage(ctx, definition, images, size) {
  if (definition.image || definition.img) {
    const defImg = definition.image || definition.img;
    let img = new Image();
    // if the image is not a .svg file and it can be found by id in state.images
    if (images && images && images[defImg] !== undefined) {
      img = images[defImg].element || images[defImg];
      // otherwise we expect the image to be a fully loaded element
    } else if (
      defImg instanceof HTMLImageElement ||
      defImg instanceof HTMLCanvasElement
    ) {
      img = defImg;
    }

    if (img.src || img instanceof HTMLCanvasElement) {
      const imgSize = (size / 2) * ((images && images[defImg]?.scale) || 1); // image should be 50% of the node by default and 20 % from the top
      const offsetX = images[defImg].offsetX || 0;
      const offsetY = images[defImg].offsetY || 0;

      ctx.beginPath();
      const imgRatio = (img.height / img.width).toFixed(2); // an attempt to keep the image ratio constant
      // save and restore are just for translations /  x and y could be used in drawing instead
      ctx.drawImage(
        img,
        size / 2 - imgSize / 2 + offsetX,
        size * 0.2 + offsetY,
        imgSize,
        imgSize * imgRatio,
      );
    }
  }
}
