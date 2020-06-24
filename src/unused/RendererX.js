/* @flow */
/* eslint-disable no-param-reassign, no-unused-expressions, no-undef */
import React, { Component, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import uuid from 'uuid';
import { cloneDeep, merge } from 'lodash';
import styled from 'styled-components';
import ReactResizeDetector from 'react-resize-detector';
import defaultOptions from './options/';
import ReVisDataSet from './ReVisDataSet';
import ZoomControls from './ZoomControls';
import HoverPopup from './HoverPopup';
import LayerItem from './LayerItem';
import {
  fitAllData,
  fitSelectionData,
  zoomOutData,
  zoomInData,
} from './images';
import {
  getScreenEdgePan,
  getHoverPos,
  getNodeScreenPos,
  checkNodeAtPosition,
  getScreenStateFromMouseWheel,
  getFitToScreen,
  getKeyAction,
  addGraphEvents,
  removeGraphEvents,
  getNodeAtPosition,
  getEdgeAtPosition
} from './util';

type CustomControlsFn = (
  event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
) => void;

type CustomControlsData = {
  zoomIn: CustomControlsFn,
  zoomOut: CustomControlsFn,
  fitAll: CustomControlsFn,
  fitSelection: CustomControlsFn,
};

type Props = {
  blockGraphInteraction: string,
  className: string,
  customControls: (data: CustomControlsData) => React.Node,
  debug: boolean,
  decoratorDrawingFunction: () => void,
  graph: { nodes: [], edges: [], decorations: [] },
  handler: ( type: string, payload: any) => void,
  images: {},
  layers: [{ data: any, drawingFunction: () => void }],
  layouter: (data: any, options: any, screen: any) => void,
  nodeDrawingFunction: (context: any, definition: any, size: number) => void,
  onEditMouse: (type: string, pos: any, ctrlClic: boolean) => void,
  onMouse: (type: string, items: any, event: any, network: any) => void,
  options: {},
  reducer: () => { state: any },
  shapeDrawingFunction: (context: any, definition: any, size: number) => void,
};

const ZOOM_FACTOR = 0.002;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;
const NODE_SIZE = 50;
const KEY_PAN_FACTOR = 10;
const MS_PER_RENDER = 30;

class ReVisNetwork extends Component<Props> {
  constructor(props) {
    const { identifier, options } = props;
    super(props);

    // gives this instance a unique react key so you can have more than 1 map on a screen
    this.identifier = identifier !== undefined ? identifier : uuid.v4();

    // canvases and refs
    this.nodesRef = React.createRef();
    this.edgesRef = React.createRef();
    this.shapesRef = React.createRef();
    this.editRef = React.createRef();
    this.actionRef = React.createRef();

    this.options = merge(defaultOptions, options || {});

    this.screenState = {
      screen: {
        width: 1000,
        height: 500,
        ratio: 1,
      },
      scale: 1,
      pan: { x: 0, y: 0 },
      screenEdgePan: { x: 0, y: 0 },
    };
    this.keyAction = null;
    this.dragTracking = {
      dragging: false,
      draggedNodes: [],
      mouseMoved: false,
    };
    this.panning = false;
    this.state = {
      hoverTracking: {
        item: null,
        itemType: null,
        popupPosition: { x: 0, y: 0 },
      }
    };
    this.rollover = null;
    // set up dataset
    this.dataset = new ReVisDataSet(
      props.graph,
      props.layouter || null,
      props.debug,
      this.options,
    );

    // the screen should be it's own shared state
    this.dataset.screen = this.screenState.screen;
    // preferable not to set these handlers on the dataset, but rather have the dataset return use promises
    this.dataset.onLayoutStopped = () => {
      this.fit(this.dataset);
    };
    // set up layers
    this.layers = props.layers || [];
    this.userLayers = [];
    this.setupLayers(this.layers);

    // other flags and settings
    this.lastFrameTime = 0;
    this.hoverTimeout = null;
    this.animRequest = null;
    this.debug = props.debug;
  }

  componentDidMount() {
    addGraphEvents(this.actionRef.current, this);
    
    //MOVE
    if (this.dataset) {
      this.dataset.screen = this.screenState.screen;
      this.dataset.onLayoutStopped = () => {
        this.fit(this.dataset);
      };
    }

    this.loop();
  }

  // MOVE ALL THIS
  componentDidUpdate(prevProps: Props) {
    const { graph, layouter, debug, options, layers } = this.props;

    if (prevProps.graph !== graph) {
      // trigger changes on DataSet.data only when graph prop changes from the outside
      this.dataset.data = graph;
    }

    if (prevProps.layers !== layers) {
      this.layers = layers || [];
      this.setupLayers(this.layers);
    }

    // if the layouter changed
    if (prevProps.layouter !== layouter) {
      const newOptions = merge(this.options, options);
      this.dataset.destroy(); // cleanup
      this.dataset = new ReVisDataSet(
        graph,
        layouter || null,
        debug,
        newOptions,
        this.screenState.screen,
        () => {
          this.fit(this.dataset);
        },
        () => {
          this.play();
        },
      );
      if (this.props.onMounted) {
        this.props.onMounted(this.dataset);
      }
      this.decoratorDrawingFunction = this.props.decoratorDrawingFunction;
      this.options = newOptions;
    } else if (prevProps.options !== options) {
      // allows for partial options to be sent in and extended with a full set of options
      const newOptions = merge(this.options, options);
      this.dataset.options = newOptions;
      this.options = newOptions;
    }
  }

  componentWillUnmount() {
    clearTimeout(this.hoverTimeout);
    this.stop();
    removeGraphEvents(this.actionRef.current, this);
    this.dataset.destroy();
  }

  onResize() {
    const screen = { ...this.screenState.screen };
    if(!this.actionRef?.current){
      return false;
    }

    const newScreen = {
      width: this.actionRef.current.clientWidth,
      height: this.actionRef.current.clientHeight,
      ratio: window.devicePixelRatio || 1,
    };

    const ratio = newScreen.width / screen.width;
    const newScale = this.screenState.scale * ratio;

    // update settings without using state
    this.screenState.scale = newScale;
    this.screenState.screen = newScreen;
    if (this.screenState.pan.x === 0 && this.screenState.pan.y === 0) {
      this.screenState.pan = {
        x: newScreen.width / 2,
        y: newScreen.height / 2,
      };
    }
    this.forceUpdate();
    this.dataset.screen = newScreen;
  }

  // key commands
  handleKey(value, event) {
    if(event.defaultPrevented)
      return false;

    event.stopPropagation();
    const key = event.key || event.keyCode
    if(event.type === 'keydown'){
      this.keyAction = getKeyAction(key);
    }else{
      this.keyAction = null;
    }
  }

  // create foreground and background layer refs
  setupLayers(layers) {
    this.userLayers = [];
    layers.forEach((l) => {
      const ref = React.createRef();
      const layerToAdd = { ...l, ref, items: [] };
      layerToAdd.data.forEach((d) => {
        layerToAdd.items.push(new LayerItem(null, d));
      });
      this.userLayers.push(layerToAdd);
    });
    if (this.lastFrameTime) {
      this.forceUpdate();
    }
  }

  // EVENTS -----------------------------------
  // helper function for mouse clicks and hovers
  getMousePos(e) {
    const { pan, scale } = this.screenState;
    const rect = this.actionRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - pan.x) / scale,
      y: (e.clientY - rect.top - pan.y) / scale,
    };
  }

  // zoom around the mouse position
  handleMouseWheel(value, e, returnValue = false) {
    clearInterval(this.zoomPanInterval);
    e.preventDefault && e.preventDefault(); // stops default screen scrolling
    const rect = this.actionRef.current.getBoundingClientRect();
    const bounds = this.dataset.bounds;
    const newState = getScreenStateFromMouseWheel(e, this.screenState, bounds, rect);
    this.screenState = newState;
    if (returnValue) {
      return { scale: newState.scale, pan: newState.pan };
    }
    return null;
  }

  getCallBacker() {
    return {
      fit: this.fit,
      zoomToSelection: this.zoomToSelection,
      getNodePositions: () => this.dataset.getPositions(),
      refreshLayout: this.dataset.refresh,
    };
  }

  // Hover functions
  clearHover() {
    clearTimeout(this.hoverTimeout);
    if (this.state.hoverTracking.item) {
      this.setState({
        hoverTracking: {
          ...this.state.hoverTracking,
          item: null,
          itemType: null,
        },
      });
    }
  }

  setShowHover(item, itemType, pos) {
    const delay = this.options.hover.delay || 750;
    const popupPosition = getHoverPos(
      pos,
      this.screenState,
      this.options.hover,
    );
    clearTimeout(this.hoverTimeout);
    this.hoverTimeout = setTimeout(() => {
      this.setState({
        hoverTracking: {
          ...this.state.hoverTracking,
          item,
          itemType,
          popupPosition,
        },
      });
    }, delay);
  }

  // passes the internal position of the mouse along, not the screen position
  handleEditMouse(pos, e, em) {
    const ctrlClick = e.ctrlKey || e.metaKey || e.shiftKey;
    // TODO: if it stays this simple, just pass the e.type along or even the e
    console.log(e.type.substr(5));
    switch (e.type) {
      case 'mousedown': {
        em && em('down', pos, ctrlClick);
        break;
      }
      case 'mousemove': {
        this.props.onEditMouse &&
          this.props.onEditMouse('move', pos, ctrlClick);
        break;
      }
      case 'mouseup': {
        this.props.onEditMouse && this.props.onEditMouse('up', pos, ctrlClick);
        break;
      }
      case 'mouseleave': {
        this.props.onEditMouse &&
          this.props.onEditMouse('leave', pos, ctrlClick);
        break;
      }
      default:
        break;
    }
  }

  handleMouse(value, e) {
    const pos = this.getMousePos(e);
    this.actionRef.current.focus();

    // disable these mouse functions these mode and use the handleEditMouse handlers
    if (this.props.blockGraphInteraction) {
      this.handleEditMouse(pos, e, this.props.onEditMouse);
      return false;
    }
    const edgeOpts = this.options.edges || {};
    const de = this.dataset.edges;
    const dt = this.dragTracking;
    const ht = this.state.hoverTracking;
    const callBacker = this.getCallBacker();
    const { onMouse } = this.props;
    
    this.props.mouseHandler(e.type, 'foo');
    
    e.preventDefault();
    switch (e.type) {
      case 'mousedown': {
        // adds nodes to dragging if there is a collision
        const ctrlClick = e.ctrlKey || e.metaKey || e.shiftKey;
        const draggedNodes = new Set(
          ctrlClick ? this.dragTracking.draggedNodes : [],
        );

        // CHECK FOR NODE CLICK && add to draggedNodes
        const n = getNodeAtPosition(this.dataset.nodes, pos);
        if (n) {
          onMouse && onMouse('nodeClick', n, e, callBacker);
          draggedNodes.add(n);
          this.dragTracking = {
            ...dt,
            dragging: true,
            draggedNodes: [...draggedNodes],
          };
        } else {
          this.panning = true;
        }

        this.clearHover();
        return false;
      }
      case 'mousemove': {
        if (dt.dragging && dt.draggedNodes.length > 0) {
          // DRAGGING
          this.clearHover();
          const lastNodeAdded = dt.draggedNodes[dt.draggedNodes.length - 1];
          const delta = {
            x: pos.x - Number(lastNodeAdded.x),
            y: pos.y - Number(lastNodeAdded.y),
          };
          dt.draggedNodes.forEach((n) => {
            n.x += delta.x;
            n.y += delta.y;
            n.fixed = true;
          });
          this.dragTracking.mouseMoved = true;  // if the mouse never moved, we didn't actually drag
          this.setScreenEdgePan(e);             // special screen pan feature for dragging nodes to edge of canvas
        } else if (this.panning) {
          // PANNING
          const newPan = { ...this.screenState.pan };
          newPan.x += e.movementX;
          newPan.y += e.movementY;
          this.screenState.pan = newPan;
        } else {
          // HOVERING                            
          const hn = getNodeAtPosition(this.dataset.nodes, pos);
          this.rollover = hn;
          if (hn) {
            if (hn !== ht.item) {
              const nPos = getNodeScreenPos(hn, this.screenState);
              this.setShowHover(hn, 'node', nPos);
            }
          } else {
            const he = getEdgeAtPosition(this.dataset.edges, pos, this.options.edges);
            if (he) {
              // HOVERING EDGES, since there were no nodes -------------------
              this.rollover = he;
              if (he && he !== ht.item) {
                const ePos = { x: e.layerX, y: e.layerY };
                this.setShowHover(he, 'edge', ePos);
              }
            } else {
              // WE ARE HOVING OVER BLANK SPACE ------------------------------
              clearTimeout(this.hoverTimeout);
              this.rollover = null;
            }
          }
        }
        return false;
      }
      case 'mouseup': {
        this.panning = false;
        // only registrer background  click if we were not dragging
        if (!dt.draggedNodes.length && !dt.mouseMoved) {
          onMouse && onMouse('backgroundClick', null, e, callBacker);
        }

        // if there were nodes dragging and there is a handler, alert the handler one more time
        if (dt.draggedNodes.length > 0 && dt.mouseMoved && onMouse) {
          onMouse && onMouse('nodesDragged', dt.draggedNodes, e, callBacker);
        }

        this.releaseDragging();
        return false;
      }

      case 'mouseleave': {
        this.panning = false;
        if (dt.dragging) {
          this.releaseDragging();
        }
        return false;
      }

      default: {
        return false;
      }
    }
  }

  releaseDragging() {
    // liberates dragged nodes
    this.dragTracking = {
      ...this.dragTracking,
      dragging: false,
      mouseMoved: false,
    };
    this.screenState.screenEdgePan = { x: 0, y: 0 };
  }

  setScreenEdgePan(e) {
    this.screenState.screenEdgePan = getScreenEdgePan(
      this.screenState.screen,
      e,
    );
  }

  handleDblClick(value, e) {
    const pos = this.getMousePos(e);
    if (this.props.blockGraphInteraction) {
      this.props.onEditMouse && this.props.onEditMouse('dblclick', pos);
      return false;
    }
    const onMouse = this.props.onMouse;
    const callBacker = this.getCallBacker();
    // check node collision
    const n = getNodeAtPosition(this.dataset.nodes, pos);
    if (n) {
      onMouse && onMouse('nodeDblClick', n, e, callBacker);
      return true;
    }
    // check edge collision
    const edge = getEdgeAtPosition(this.dataset.edges, pos, this.options.edges);
    if (edge) {
      onMouse && onMouse('edgeDblClick', edge, e, callBacker);
      return true;
    }
    // nothing found so zoom to double click point
    const newE = e;
    newE.deltaY = -150;
    const ret = this.handleMouseWheel(null, newE, true);
    this.zoomPanimate(ret.scale, ret.pan);
    return true;
  }

  zoom(e, level) {
    e && e.preventDefault();
    const bounds = this.dataset.bounds;
    const screen = this.screenState.screen;
    const hf = screen.height / (bounds.height + NODE_SIZE * 2);
    const wf = screen.width / (bounds.width + NODE_SIZE * 2);
    const newScale = Math.min(hf, wf);
    const scaleFactor = (MAX_ZOOM - MIN_ZOOM) * 0.1;
    const realMinZoom = Math.min(MIN_ZOOM, newScale);
    if (level === 'in') {
      const nsf = Math.min(this.screenState.scale + scaleFactor, MAX_ZOOM);
      const x = screen.width / 2 - (bounds.width / 2 + bounds.minX) * nsf;
      const y = screen.height / 2 - (bounds.height / 2 + bounds.minY) * nsf;
      this.zoomPanimate(nsf, { x, y });
    } else if (level === 'out') {
      const nsf = Math.max(this.screenState.scale - scaleFactor, realMinZoom);
      const x = screen.width / 2 - (bounds.width / 2 + bounds.minX) * nsf;
      const y = screen.height / 2 - (bounds.height / 2 + bounds.minY) * nsf;
      this.zoomPanimate(nsf, { x, y });
    } else if (level === 'all') {
      this.fit(bounds);
    } else if (
      level === 'selection' &&
      this.props.selected &&
      this.props.selected.nodes
    ) {
      this.zoomToSelection(this.props.selected.nodes);
    }
  }

  // zoom and pan to fit all on screen
  fit() {
    const v = getFitToScreen(this.dataset.bounds, this.screenState.screen, this.options.cameraOptions.fitAllPadding);
    this.zoomPanimate(v.scale, v.pan);
    return true;
  }

  zoomToSelection(nid, newScale = 2) {
    let target = (Array.isArray(nid) && nid[0]) ? nid[0].toString() : nid;
    const { screen } = this.screenState;
    if (target) {
      // get the actual node coordinates for a node
      const nodes = this.dataset.nodes;
      let tempNode = null;
      nodes.forEach((n) => {
        if (n.id.toString() === target) {
          tempNode = n;
        }
      });

      if (tempNode) {
        const x = screen.width / 2 - tempNode.x * newScale;
        const y = screen.height / 2 - tempNode.y * newScale;
        this.zoomPanimate(2, { x, y });
      }
      // TODO: when zooming, invalidate hover pop up
    }
  }

  // animate zooming
  zoomPanimate(newScale, newPan) {
    const screenState = this.screenState;
    clearInterval(this.zoomPanInterval);
    this.zoomPanInterval = setInterval(() => {
      const sPan = this.screenState.pan;
      const ssc = this.screenState.scale;
      const scDiff = newScale - ssc;
      const xDiff = newPan.x - sPan.x;
      const yDiff = newPan.y - sPan.y;
      if (scDiff * scDiff > 0.0005 || xDiff * xDiff > 4 || yDiff * yDiff > 4) {
        const calculatedScale = ssc + scDiff / 4;
        screenState.scale = calculatedScale;
        screenState.pan = {
          x: sPan.x + xDiff / 4,
          y: sPan.y + yDiff / 4,
        };
      } else {
        screenState.scale = newScale;
        screenState.pan = newPan;
        clearInterval(this.zoomPanInterval);
      }
    }, MS_PER_RENDER);
  }
  // END EVENTS ------------------------------------------

  // KEY ACTIONS ----------------------------------------
  handleKeyAction(a) {
    const pt = { ...this.screenState.pan };
    let scale = this.screenState.scale;
    switch (a) {
      case '_moveUp':
        pt.y -= KEY_PAN_FACTOR;
        break;
      case '_moveDown':
        pt.y += KEY_PAN_FACTOR;
        break;
      case '_moveLeft':
        pt.x -= KEY_PAN_FACTOR;
        break;
      case '_moveRight':
        pt.x += KEY_PAN_FACTOR;
        break;
      case '_zoomIn':
        scale = Math.min(MAX_ZOOM, scale + ZOOM_FACTOR * 20);
        break;
      case '_zoomOut':
        scale = Math.max(MIN_ZOOM, scale) - ZOOM_FACTOR * 20;
        break;
      default:
        break;
    }
    this.screenState = { ...this.screenState, scale, pan: pt };
  }

  //  DRAWING / LOOPING / TICKING FUNCTIONS
  draw() {
    if (this.keyAction) {
      this.handleKeyAction(this.keyAction);
    }

    // fetch context and screen size, save context
    const { screen, scale, screenEdgePan, pan } = this.screenState;

    // panning at the edges of the screen changes pan and dragged nodes cooridiates
    const pn = { ...pan };
    pn.x += screenEdgePan.x * scale;
    pn.y += screenEdgePan.y * scale;

    this.dragTracking.draggedNodes.forEach((n) => {
      n.x -= screenEdgePan.x;
      n.y -= screenEdgePan.y;
    });

    this.screenState.pan = pn;

    // get the basic refs
    const refs = [this.nodesRef, this.edgesRef, this.shapesRef];

    // get the refs for each layer
    this.userLayers.forEach((l) => {
      refs.push(l.ref);
    });

    // if there is a 'current' prop for each ref (it has been created), save, clearn and transform the context
    refs.forEach((r) => {
      if (r.current) {
        const context = r.current.getContext('2d');
        context.save();
        // clear
        context.clearRect(0, 0, screen.width, screen.height);
        context.transform(scale, 0, 0, scale, pn.x, pn.y);
      }
    });

    // draw each layer

    this.userLayers.forEach((l) => {
      this.drawLayer(l);
    });

    if (this.dataset.decorations && this.dataset.decorations.length) {
      this.drawObjects(
        this.dataset.decorations,
        this.shapesRef,
        this.props.decoratorDrawingFunction || null,
      );
    }

    // draw the edges
    this.drawObjects(this.dataset.edges, this.edgesRef, null);

    // draw the nodes
    this.drawObjects(
      this.dataset.nodes,
      this.nodesRef,
      this.props.nodeDrawingFunction || null,
    );

    // finish up by restoring each ref's context
    refs.forEach((r) => {
      if (r.current) {
        const context = r.current.getContext('2d');
        context.restore();
      }
    });
  }

  loop(elapsedTime = 0) {
    // calculate the delta since the last frame
    const delta = elapsedTime - (this.lastFrameTime || 0);

    // queue up an rAF draw call
    const lp = this.loop.bind(this);
    this.animRequest = window.requestAnimationFrame(lp);

    // if we *don't* already have a first frame, and the
    // delta <  milliseconds per render, don't do anything and return
    if (this.lastFrameTime && delta < MS_PER_RENDER) {
      return;
    }

    // capture the last frame draw time so we can work out a delta next time.
    this.lastFrameTime = elapsedTime;

    // now do the frame update and render work
    const draw = this.draw.bind(this);
    draw();
  }

  // called when we destroy, but could be used to stop the loop when not needed
  stop() {
    window.cancelAnimationFrame(this.animRequest);
  }

  // TODO: could check to see if nodes are in viewport before calling render
  drawObjects(items, ref, drawingFunction) {
    const context = ref.current.getContext('2d');
    const st = {
      ...this.screenState,
      options: this.options,
      rolloverItem: this.rollover,
    };
    for (const item of items) {
      if (item.render !== undefined) {
        item.render(st, context, this.props.images, drawingFunction);
      }
    }
  }

  drawLayer(layer) {
    const ref = this.shapesRef;
    const context = ref.current && ref.current.getContext('2d');
    if (context) {
      this.drawObjects(
        layer.items,
        ref,
        layer.drawingFunction || null,
        'layer',
      );
    }
  }

  render() {
    const hideControls = this.props.customControls === null;
    const { className, customControls, blockGraphInteraction } = this.props;
    const { screen } = this.screenState;
    return (
      <div ref='revisContainer' className={className} key={this.identifier}>
        <ReactResizeDetector
          handleWidth
          handleHeight
          onResize={() => this.onResize()}
        />

        <canvas
          ref={this.shapesRef}
          width={screen.width}
          height={screen.height}
          tabIndex={2}
        />

        <canvas
          ref={this.edgesRef}
          width={screen.width}
          height={screen.height}
          tabIndex={1}
        />

        <canvas
          ref={this.nodesRef}
          width={screen.width}
          height={screen.height}
          tabIndex={0}
        />

        <canvas
          ref={this.actionRef}
          width={screen.width}
          height={screen.height}
          tabIndex={0}
          className={`action-canvas ${blockGraphInteraction ? 'blocked' : ''}`}
        />

        <HoverPopup
          tracking={this.state.hoverTracking}
          options={this.options.hover}
          clearHover={this.clearHover.bind(this)}
        />

        {!hideControls && (
          <ZoomControls
            customControls={customControls}
            zoom={this.zoom.bind(this)}
          />
        )}
      </div>
    );
  }
}

export default styled(ReVisNetwork)`
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

    &.action-canvas {
      &.blocked {
      }
      &:focus {
        outline: none;
      }
    }

    &.foreground-background {
      &:focus {
        outline: none;
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
