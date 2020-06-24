import React, { useRef, useEffect, memo } from 'react';
import ReactResizeDetector from 'react-resize-detector';

const ActionLayer = (props) => {
  const {
    screen,
    blockGraphInteraction,
    handlers,
    handleMouse,
    handleMouseWheel,
    handleKey,
  } = props;

  const actionRef = useRef(null);

  let getRect = () => actionRef?.current?.getBoundingClientRect();

  if(actionRef?.current){
    actionRef.current.focus();
  }

  const onResize = () => {
    if (!actionRef?.current) {
      handlers && handlers('resize', null);
      return false;
    }

    handlers &&
      handlers('resize', {
        width: actionRef?.current.clientWidth,
        height: actionRef?.current.clientHeight,
        ratio: window.devicePixelRatio || 1,
        boundingRect: getRect(),
      });
  };

  return (
    <>
      <ReactResizeDetector
        handleWidth
        handleHeight
        onResize={() => onResize()}
      />
      <canvas
        ref={actionRef}
        width={screen.width}
        height={screen.height}
        tabIndex={0}
        className={`action-canvas ${blockGraphInteraction ? 'blocked' : ''}`}
        onWheel={handleMouseWheel}
        onMouseDown={(e) => handleMouse(e, getRect())}
        onMouseMove={(e) => handleMouse(e, getRect())}
        onMouseUp={(e) => handleMouse(e, getRect())}
        onMouseLeave={(e) => handleMouse(e, getRect())}
        onKeyDown={handleKey}
        onKeyUp={handleKey}
      />
    </>
  );
};

// only re-render when we have new screen settings
const compare = (p, p1) => {
  const comp = p.screen === p1.screen && p.blockGraphInteraction === p1.blockGraphInteraction;
  return comp;
}

export default memo(ActionLayer, compare);
