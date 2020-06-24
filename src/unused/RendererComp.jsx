/* @flow */
/* eslint-disable no-param-reassign, no-unused-expressions, no-undef */
import React, { memo, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import ZoomControls from './components/ZoomControls';
import HoverPopup from './components/HoverPopup';
import LayerItem from './components/LayerItem';
import {
  ActionLayer,
  NodeLayer,
  EdgeLayer,
  ShapeLayer,
} from './renderingLayers';

const MS_PER_RENDER = 30;

const Container = styled.div`
  display: block;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  canvas {
    display: block;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    &:focus {
      outline: none;
    }

    &.action-canvas {
      &.blocked {
      }
    }
  }
  .controls {
    display: block;
    position: absolute;
    top: 10px;
    right: 10px;
    width: 39px;

    .control-button {
      position: relative;
      height: 36px;
      width: 36px;
      opacity: 0.7;
      &:hover {
        opacity: 0.9;
      }
    }
    button {
      background: none;
      padding: 0;
      margin: 1px 0;
      border: none;
      &:focus {
        outline: 0;
      }
    }
  }
  .node-detail {
    display: block;
    position: relative;
  }
`;

const Renderer = (props) => {
  // canvases and refs
  const nodesRef = useRef();
  const edgesRef = useRef();
  const shapesRef = useRef();
  const editRef = useRef();
  const containerRef = useRef();

  const lastFrameTime = useRef(0);
  const animRequest = useRef(null);

  const {
    blockGraphInteraction,
    className,
    clearHover,
    customControls,
    edges,
    handleKey,
    handleMouse,
    handleMouseWheel,
    handlers,
    handleZoom,
    hoverState,
    images,
    nodeDrawingFunction,
    nodes,
    options,
    rolloverState,
    panScaleState,
    screen,
    shapeDrawingFunction,
    shapes,
    uid,
  } = props;

  const loop = useCallback(
    (elapsedTime = 0) => {
      console.log('loop', screen);
      // calculate the delta since the last frame
      const delta = elapsedTime - (lastFrameTime.current || 0);

      // queue up an rAF draw call
      const lp = loop;
      animRequest.current = window.requestAnimationFrame(lp);

      // if we *don't* already have a first frame, and the
      // delta <  milliseconds per render, don't do anything and return
      if (lastFrameTime.current && delta < MS_PER_RENDER) return;

      // capture the last frame draw time so we can work out a delta next time.
      lastFrameTime.current = elapsedTime;

      handlers && handlers('tick');

      // now do the frame update and render work
      draw();
    },
    [screen],
  );

  const draw = useCallback(() => {
    if (!screen) return;

    const ndf = nodeDrawingFunction || null;
    const sdf = shapeDrawingFunction || null;
    // shapes
    drawObjects(shapes, shapesRef, sdf);
    // edges
    drawObjects(edges, edgesRef, null);
    // nodes
    drawObjects(nodes, nodesRef, ndf);
  }, [
    nodeDrawingFunction,
    shapeDrawingFunction,
    nodes,
    edges,
    screen,
    shapeDrawingFunction,
  ]);

  const drawObjects = useCallback(
    (items, ref, drawingFunction) => {
      if (!items || !ref.current === null) return false;
      const context = ref.current.getContext('2d');
      context.save();
      // clear
      context.clearRect(0, 0, screen.width, screen.height);
      context.transform(
        panScaleState.scale,
        0,
        0,
        panScaleState.scale,
        panScaleState.pan.x,
        panScaleState.pan.y,
      );
      const st = {
        ...panScaleState,
        options,
        rolloverItem: rolloverState,
      };

      for (const item of items.values()) {
        if (item.render !== undefined) {
          item.render(st, context, images, drawingFunction);
        }
      }
      context.restore();
      return true;
    },
    [panScaleState, screen, options, rolloverState],
  );

  // called when we destroy, but could be used to stop the loop when not needed
  const stop = () => {
    window.cancelAnimationFrame(animRequest);
  };

  // mount and unmount
  useEffect(() => {
    loop();
    return () => {
      stop();
    };
  }, []);

  useEffect(() => {}, [screen]);

  const hideControls = customControls === null;
  console.log('renderer');

  return (
    <Container ref={containerRef} className={className} key={uid}>
      <>
        <canvas
          ref={shapesRef}
          width={screen.width}
          height={screen.height}
          tabIndex={0}
        />

        <canvas
          ref={edgesRef}
          width={screen.width}
          height={screen.height}
          tabIndex={-1}
        />

        <canvas
          ref={nodesRef}
          width={screen.width}
          height={screen.height}
          tabIndex={-2}
        />

        <ActionLayer
          blockGraphInteraction={blockGraphInteraction}
          handlers={handlers}
          handleMouse={handleMouse}
          handleMouseWheel={handleMouseWheel}
          handleKey={handleKey}
        />
      </>

      <HoverPopup
        tracking={hoverState}
        options={options.hover}
        clearHover={() => clearHover()}
      />

      {!hideControls && (
        <ZoomControls customControls={customControls} zoom={handleZoom} />
      )}
    </Container>
  );
};

function memoCompare(prevProps, nextProps) {
  return true;
}

export default memo(Renderer);

