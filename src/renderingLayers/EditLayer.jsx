import React, { useRef, memo } from 'react';

const HANDLE_OFFSET = 8;
const DEF_COLOR = 'rgb(200,200,200)';

const EditLayer = (props) => {
  const { panScaleState, screen, interactionState, color, shapes } = props;
  const { shape, shapeHandle } = interactionState;
  const { height, width } = screen;

  const drawColor = color || DEF_COLOR;

  const editRef = useRef();

  const drawHandle = (context, x, y, s, selected = false) => {
    if (selected) {
      context.fillStyle = drawColor;
    }
    context.beginPath();
    context.rect(x, y, s, s);
    context.closePath();
    context.fill();
    if (selected) {
      context.fillStyle = drawColor;
    }
  };

  if (shape && shapes.includes(shape) && editRef.current) {
    const { scale, pan } = panScaleState;
    const context = editRef.current.getContext('2d');

    const itemWidth = shape.width || shape.size;
    const itemHeight = shape.height || shape.size;
    const handleSize = HANDLE_OFFSET / scale;
    const offset = handleSize * 0.5;
    const c = shape.x + itemWidth / 2 - offset;
    const m = shape.y + itemHeight / 2 - offset;
    const l = shape.x - handleSize * 2 + offset;
    const r = shape.x + itemWidth + offset;
    const t = shape.y - handleSize - offset;
    const b = shape.y + itemHeight + offset;

    // draw handles
    context.save();
    context.clearRect(0, 0, width, height);
    context.transform(scale, 0, 0, scale, pan.x, pan.y);
    context.strokeStyle = drawColor;
    context.lineWidth = 1 / scale;

    // bounding box
    context.beginPath();
    context.rect(
      shape.x - handleSize,
      shape.y - handleSize,
      itemWidth + handleSize * 2,
      itemHeight + handleSize * 2,
    );
    context.closePath();
    context.stroke();
    context.fillStyle = drawColor;

    drawHandle(context, l, t, handleSize, shapeHandle === 'tl');
    drawHandle(context, c, t, handleSize, shapeHandle === 'tc');
    drawHandle(context, r, t, handleSize, shapeHandle === 'tr');
    drawHandle(context, l, b, handleSize, shapeHandle === 'bl');
    drawHandle(context, c, b, handleSize, shapeHandle === 'bc');
    drawHandle(context, r, b, handleSize, shapeHandle === 'br');
    drawHandle(context, l, m, handleSize, shapeHandle === 'ml');
    drawHandle(context, r, m, handleSize, shapeHandle === 'mr');
    context.restore();
  } else {
    const context = editRef?.current?.getContext('2d');
    context && context.clearRect(0, 0, width, height);
  }

  return (
    <canvas
      ref={editRef}
      tabIndex={0}
      className={`edit-canvas ${shape ? 'editing' : ''}`}
      width={width}
      height={height}
    />
  );
};

export default memo(EditLayer);
