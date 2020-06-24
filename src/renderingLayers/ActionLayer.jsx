import React, { useRef, useLayoutEffect } from 'react';
import ReactResizeDetector from 'react-resize-detector';

const ActionLayer = (props) => {
  const {
    blockGraphInteraction,
    handlers,
    handleMouse,
    handleMouseWheel,
    handleKey,
  } = props;

  const actionRef = useRef(null);

  const onResize = () => {
    if (!actionRef?.current) {
      handlers && handlers('resize', null);
      return false;
    }

    handlers && handlers('resize', actionRef.current);

    return true;
  };

  // send the actual screen size on the first render only
  useLayoutEffect(() => {
    onResize();
  }, []);

  return (
    <>
      <ReactResizeDetector
        handleWidth
        handleHeight
        onResize={() => onResize()}
      />
      <canvas
        ref={actionRef}
        tabIndex={0}
        className={`action-canvas ${blockGraphInteraction ? 'blocked' : ''}`}
        onWheel={handleMouseWheel}
        onMouseDown={handleMouse}
        onMouseMove={handleMouse}
        onDoubleClick={handleMouse}
        onMouseUp={handleMouse}
        onMouseLeave={handleMouse}
        onKeyDown={handleKey}
        onKeyUp={handleKey}
      />
    </>
  );
};

export default ActionLayer;
