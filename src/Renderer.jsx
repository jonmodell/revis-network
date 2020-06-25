/* @flow */
/* eslint-disable no-param-reassign, no-unused-expressions, no-undef */
import React, { Component } from 'react';
import styled from 'styled-components';
import { isEqual } from 'lodash';
import { ZoomControls, HoverPopup } from './components';
import { ActionLayer, EditLayer } from './renderingLayers';
import { inViewPort } from './util';

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
    &.editing {
      background: rgba(250, 250, 250, 0.3);
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

const DEFAULT_SHAPE_STYLE = {
  fill: '#ffffff',
  stroke: '#333333',
  lineWidth: 2,
  font: '16px lato, Arial',
};

/*
const RevisNetwork = props => {
  // gives this instance a unique react key so you can have more than 1 map on a screen
  this.identifier = identifier !== undefined ? identifier : uuid.v4();

  // canvases and refs
  this.nodesRef = useRef();
  this.edgesRef = useRef();
  this.shapesRef = useRef();
  this.editRef = useRef();
  this.containerRef = React.createRef();

  return (
  
  )
}

function memoCompare(prevProps, nextProps) {
  return false;
}
export default memo(ReVisNetwork, memoCompare);

*/

class Renderer extends Component {
  constructor(props) {
    super(props);

    // canvases and refs
    this.nodesRef = React.createRef();
    this.edgesRef = React.createRef();
    this.shapesRef = React.createRef();
    this.containerRef = React.createRef();
    this.hoverRef = React.createRef();

    // other flags and settings
    this.lastFrameTime = 0;
    this.animRequest = null;
    this.lastScale = null;
    this.lastRollOver = props.rolloverState;
    this.lastScreen = null;
    this.lastOptions = null;
    this.dirty = false;
  }

  componentDidMount() {
    this.loop();
  }

  shouldComponentUpdate(props, prevProps) {
    return true;
  }

  componentDidUpdate() {
    this.dirty = true;
  }

  componentWillUnmount() {
    this.stop();
  }

  loop = (elapsedTime = 0) => {
    // calculate the delta since the last frame
    const delta = elapsedTime - (this.lastFrameTime || 0);
    const { handlers } = this.props;

    // queue up an rAF draw call
    const lp = this.loop;
    this.animRequest = window.requestAnimationFrame(lp);

    // if we *don't* already have a first frame, and the
    // delta <  milliseconds per render, don't do anything and return
    if (this.lastFrameTime && delta < MS_PER_RENDER) {
      return;
    }

    // capture the last frame draw time so we can work out a delta next time.
    this.lastFrameTime = elapsedTime;

    handlers && handlers('tick');

    // now do the frame update and render work
    // const draw = this.draw.bind(this);
    const ps = this.props.panScaleState;
    const is = this.props.interactionState;
    if (this.dirty || is.action || ps.destinationPan || ps.destinationScale) {
      this.draw();
      this.dirty = false;
    }
  };

  draw = () => {
    const ndf = this.props.nodeDrawingFunction || null;
    const sdf = this.props.shapeDrawingFunction || null;
    // shapes
    this.drawShapes(this.props.shapes, this.shapesRef, sdf);
    // edges
    this.drawObjects(this.props.edges.values(), this.edgesRef, null);
    // nodes
    this.drawObjects(this.props.nodes.values(), this.nodesRef, ndf);

    // draw boundaires for debugging
    // this.drawBounds(this.props.bounds);

    if (this.props.editItem) {
      drawEditHandles();
    }
  };

  // called when we destroy, but could be used to stop the loop when not needed
  stop() {
    window.cancelAnimationFrame(this.animRequest);
  }

  drawBounds(bounds) {
    if (!bounds || !this.shapesRef.current) return false;
    const ctx = this.shapesRef.current.getContext('2d');
    const { panScaleState } = this.props;
    const { scale, pan } = panScaleState;
    ctx.save();
    //   ctx.clearRect(0, 0, width, height);
    ctx.transform(scale, 0, 0, scale, pan.x, pan.y);
    // draw
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.strokeStyle = '#222222';
    ctx.beginPath();
    ctx.fillRect(bounds.minX, bounds.minY, bounds.width, bounds.height);
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
    return true;
  }

  drawShapes(items, ref, drawingFunction) {
    if (!items || !ref.current) return false;
    const ctx = ref.current.getContext('2d');
    const { panScaleState, screen } = this.props;
    const { scale, pan } = panScaleState;
    const { width, height } = screen;
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.transform(scale, 0, 0, scale, pan.x, pan.y);
    items.forEach((i) => {
      if (i.visible !== false) {
        const style = { ...DEFAULT_SHAPE_STYLE, ...(i.style || {}) };
        // draw
        ctx.save();
        ctx.translate(i.x, i.y);
        ctx.lineWidth = style.lineWidth;
        ctx.fillStyle = style.background || style.fillColor || style.fill;
        ctx.strokeStyle =
          style.border || style.strokeColor || style.stroke || style.line;
        ctx.beginPath();
        if (drawingFunction) {
          drawingFunction(ctx, i);
        } else {
          ctx.fillRect(0, 0, i.width, i.height);
        }

        if (i.shape && i.shape !== 'image') {
          // not an image
          ctx.closePath();
          if (style && style.fill !== null) {
            ctx.fill();
          }
          ctx.stroke();
        } else if (i.image) {
          // image support is a little different
          const sc = i.scale || 1;
          ctx.drawImage(i.image, 0, 0, i.width * sc, i.height * sc);
        }

        ctx.restore();
      }
    });
    ctx.restore();
    return true;
  }

  // TODO: could check to see if nodes are in viewport before calling render
  drawObjects(items, ref, drawingFunction) {
    const {
      panScaleState,
      options,
      rolloverState,
      images,
      screen,
    } = this.props;
    if (!items) return false;
    const { scale, pan } = panScaleState;
    const { width, height, boundingRect } = screen;
    const viewPort = {
      left: (-10 - pan.x) / scale,
      top: (-10 - pan.y) / scale,
      right: (10 + boundingRect?.right - pan.x) / scale,
      bottom: (10 + height - pan.y) / scale,
    };

    const context = ref.current.getContext('2d');
    context.save();
    // clear
    context.clearRect(0, 0, width, height);
    context.transform(scale, 0, 0, scale, pan.x, pan.y);
    const st = {
      ...panScaleState,
      options,
      rolloverItem: rolloverState,
    };

    for (const item of items) {
      if (
        item.render !== undefined &&
        (ref !== this.nodesRef || inViewPort(item, viewPort))
      ) {
        item.render(st, context, images, drawingFunction);
      }
    }
    context.restore();
    return true;
  }

  render() {
    const {
      className,
      customControls,
      screen,
      hoverState,
      clearHover,
      handlers,
      handleKey,
      handleMouse,
      handleMouseWheel,
      handleZoom,
      options,
      panScaleState,
      interactionState,
      uid,
    } = this.props;

    const hideControls = customControls === null;
    const { width, height } = screen;
    // console.log('renderer re-rendering ');
    return (
      <Container ref={this.containerRef} className={className} key={uid}>
        <>
          <canvas
            ref={this.shapesRef}
            width={width}
            height={height}
            tabIndex={-4}
          />

          <canvas
            ref={this.edgesRef}
            width={width}
            height={height}
            tabIndex={-3}
          />

          <canvas
            ref={this.nodesRef}
            width={width}
            height={height}
            tabIndex={-0}
          />

          <canvas
            ref={this.hoverRef}
            width={width}
            height={height}
            tabIndex={-1}
          />

          <EditLayer
            interactionState={interactionState}
            screen={screen}
            panScaleState={panScaleState}
          />

          <ActionLayer
            blockGraphInteraction={options.blockGraphInteraction || false}
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
  }
}

export default Renderer;
