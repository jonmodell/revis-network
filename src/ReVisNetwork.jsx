/* @flow */
/* eslint-disable no-param-reassign, no-unused-expressions, no-undef */
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  memo,
  useMemo,
} from 'react';
import uuid from 'uuid';
import { merge } from 'lodash';
import {
  getBounds,
  getBoundsScale,
  getEdgeAtPosition,
  getFitToScreen,
  getHoverPos,
  getKeyAction,
  getMousePos,
  getNodeAtPosition,
  getNodeScreenPos,
  getPositions,
  getScreenEdgePan,
  getPanScaleFromMouseWheel,
  getShapeAtPos,
  getHandleAtPos,
  setShapeByHandleDrag,
} from './util';
import { Props } from './types';
import defaultOptions from './options';
import Renderer from './Renderer';
import Node from './components/Node';
import Edge from './components/Edge';
import defaultLayout from './layout';
import usePanScale from './hooks/usePanScale';
import useInteraction from './hooks/useInteraction';

const ReVisNetwork = (props: Props) => {
  const {
    options,
    identifier,
    graph,
    images,
    nodeDrawingFunction,
    shapeDrawingFunction,
    shapes,
    callbackFn,
  } = props;
  const layouter = props.layouter || defaultLayout;

  const { psState, panScaleDispatch } = usePanScale();
  const { interactionState, interactionDispatch } = useInteraction();

  const [keyActionState, setKeyActionState] = useState(null);
  const [hoverState, setHoverState] = useState({
    item: null,
    itemType: null,
  });
  const [rolloverState, setRolloverState] = useState(null);
  const [optionState, setOptionState] = useState(
    merge(defaultOptions, options || {}),
  );

  const hoverTimer = useRef(null);
  const uid = useRef(identifier || uuid.v4());

  const nodes = useRef(new Map());
  const edges = useRef(new Map());

  const baseCanvas = useRef(null);
  const [screenState, setScreenState] = useState({
    width: 0,
    height: 0,
    ratio: 1,
    boundingRect: null,
  });

  const screen = () => ({
    width: baseCanvas.current?.clientWidth,
    height: baseCanvas.current?.clientHeight,
    ratio: window.devicePixelRatio || 1,
    boundingRect: baseCanvas.current?.getBoundingClientRect(),
  });

  const bounds = useMemo(
    () => getBounds(nodes.current.values() || [], shapes),
    [nodes, edges, shapes, getBounds],
  );

  const clearHover = () => {
    clearTimeout(hoverTimer.current);
    if (hoverState.item) {
      setHoverState({
        item: null,
        itemType: null,
      });
    }
  };

  const setShowHover = (item, itemType, pos) => {
    const delay = optionState.hover.delay || 750;
    const popupPosition = getHoverPos(
      pos,
      screen(),
      psState,
      optionState.hover,
    );
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      setHoverState({
        ...hoverState,
        item,
        itemType,
        popupPosition,
      });
    }, delay);
  };

  /*
      down -
        check node down
        check shape down

      move
        - check node move
        - check shape move
        - check node hover
        - check shape hover

      up
        - if nodes or shapes dragging, dispatch nodesDragged or shapesDragged
        - if no nodes or shapes dragging, background click
        - release dragging

      leave
        - stop edge panning

      double-click
        - check node
        - check edge
        - zoom to point

  */

  const processShapeEdit = (type, payload) => {
    const om = props.onMouse;
    // ctrl click should constrain height and width
    // node should not be negatively sized
    // node should not be allowed to become too small
    const { pos, ctrlClick, e } = payload;
    const iSt = interactionState;
    switch (type === 'dblclick' ? 'dblclick' : type.substr(5)) {
      case 'down': {
        // if a shape is already selected, check for handle clicks
        if (iSt.shape) {
          const handle = getHandleAtPos(iSt.shape, pos, psState.scale);
          if (handle) {
            interactionDispatch({ type: 'handleDown', payload: handle });
            break;
          }
        }

        // check for shape click and set edit shape id
        const shape = getShapeAtPos(shapes, pos);
        if (shape) {
          om && om('shapeClick', shape, e);
          shapes.splice(shapes.indexOf(shape), 1);
          shapes.push(shape);
          interactionDispatch({ type: 'shapeDown', payload: shape }); // pan
          // set interaction state to shape dragging
        } else {
          interactionDispatch({ type: 'pan' }); // pan
        }
        break;
      }
      case 'up': {
        if (iSt.shape && iSt.mouseMoved) {
          om && om('shapesUpdate', [...shapes], e);
        }
        interactionDispatch({ type: 'shapeUp' });
        panScaleDispatch({
          type: 'framePan',
          payload: null,
        });
        break;
      }

      case 'move': {
        if (iSt.action === 'pan') {
          // PANNING
          const newPan = { ...psState.pan };
          newPan.x = Number(newPan.x) + e.movementX;
          newPan.y = Number(newPan.y) + e.movementY;
          panScaleDispatch({
            type: 'pan',
            payload: newPan,
          });
          break;
        }

        if (iSt.action === 'shapeDrag') {
          iSt.shape.x = Number(iSt.shape.x) + e.movementX / psState.scale;
          iSt.shape.y = Number(iSt.shape.y) + e.movementY / psState.scale;
          interactionDispatch({ type: 'shapeMove' });
        }

        if (iSt.action === 'handleDrag') {
          const changes = setShapeByHandleDrag(
            iSt.shape,
            iSt.shapeHandle,
            {
              x: e.movementX / psState.scale,
              y: e.movementY / psState.scale,
            },
            ctrlClick,
          );
          iSt.shape.x = changes.x;
          iSt.shape.y = changes.y;
          iSt.shape.width = changes.width;
          iSt.shape.height = changes.height;
          interactionDispatch({ type: 'handleMove' });
        }
        break;
      }

      case 'leave': {
        console.log('leave');
        break;
      }
      default:
        break;
    }
  };

  const processMouseAction = (type, payload) => {
    const om = props.onMouse;
    if (om && optionState.blockGraphInteraction) {
      // if you have blocked basic interaction, you get regular mouse events with transformed cooridinates
      processShapeEdit(type, payload);
    } else {
      const iSt = interactionState;
      switch (type === 'dblclick' ? 'dblclick' : type.substr(5)) {
        case 'down': {
          const { pos, ctrlClick, e } = payload;
          const draggedNodes = new Set(ctrlClick ? iSt.draggedNodes : []);
          const n = getNodeAtPosition(nodes.current, pos);
          const ed = getEdgeAtPosition(
            edges.current,
            payload.pos,
            optionState.edges,
          );
          if (n) {
            // drag if we clicked on a node
            om && om('nodeClick', n, e);
            draggedNodes.add(n);
            interactionDispatch({
              type: 'addToDrag',
              payload: [...draggedNodes],
            });
          } else if (ed) {
            om && om('edgeClick', ed, e);
            interactionDispatch({
              type: 'edgeDown',
            });
          } else {
            interactionDispatch({ type: 'pan' }); // pan
          }
          clearHover();
          break;
        }
        case 'up': {
          const { e } = payload;
          // only registrer background  click if we were not dragging
          if (
            !iSt.draggedNodes.length &&
            !iSt.mouseMoved &&
            iSt.action !== 'edgeDown'
          ) {
            om && om('backgroundClick', null, e);
          }

          // if there were nodes dragging and there is a handler, alert the handler one more time
          if (iSt.draggedNodes.length && iSt.mouseMoved && props.onMouse) {
            om && om('nodesDragged', iSt.draggedNodes, e);
          }
          interactionDispatch({ type: 'releaseDrag' }); // release dragging
          panScaleDispatch({
            type: 'framePan',
            payload: null,
          });
          break;
        }

        case 'move': {
          const { pos, e } = payload;
          if (iSt.action === 'drag' && iSt.draggedNodes.length > 0) {
            // DRAGGING
            // this.clearHover();
            const lastNodeAdded = iSt.draggedNodes[iSt.draggedNodes.length - 1];
            const delta = {
              x: pos.x - Number(lastNodeAdded.x),
              y: pos.y - Number(lastNodeAdded.y),
            };
            iSt.draggedNodes.forEach((n) => {
              n.x += delta.x;
              n.y += delta.y;
              n.fixed = true;
            });

            const sp = getScreenEdgePan(screen(), e);
            interactionDispatch({
              type: 'mouseMoved',
            });
            panScaleDispatch({
              type: 'framePan',
              payload: sp,
            });
          } else if (iSt.action === 'pan') {
            // PANNING
            const newPan = { ...psState.pan };
            newPan.x = Number(newPan.x) + e.movementX;
            newPan.y = Number(newPan.y) + e.movementY;
            panScaleDispatch({
              type: 'pan',
              payload: newPan,
            });
          } else {
            // HOVERING
            const hn = getNodeAtPosition(nodes.current, pos);
            setRolloverState(hn);
            if (hn) {
              if (hn !== hoverState.item) {
                const nPos = getNodeScreenPos(hn, psState);
                setShowHover(hn, 'node', nPos);
              }
            } else {
              const he = getEdgeAtPosition(
                edges.current,
                pos,
                optionState.edges,
              );
              if (he) {
                // HOVERING EDGES, since there were no nodes -------------------
                setRolloverState(he);
                if (he && he !== hoverState.item) {
                  const ePos = { x: e.clientX, y: e.clientY };
                  setShowHover(he, 'edge', ePos);
                }
              } else {
                // WE ARE HOVING OVER BLANK SPACE ------------------------------
                clearTimeout(hoverTimer.current);
                setRolloverState(null);
              }
            }
          }
          break;
        }
        case 'leave': {
          panScaleDispatch({
            type: 'framePan',
            payload: null,
          });
          break;
        }
        case 'dblclick': {
          if (optionState.blockGraphInteraction) {
            om && om('dblclick', payload.pos);
            break;
          }

          // check node collision
          const n = getNodeAtPosition(nodes.current, payload.pos);
          if (n) {
            om && om('nodeDblClick', n, payload.e);
            break;
          }

          // check edge collision
          const edge = getEdgeAtPosition(
            edges.current,
            payload.pos,
            optionState.edges,
          );
          if (edge) {
            om && om('edgeDblClick', edge, payload.e);
            break;
          }

          // nothing found so zoom to double click point
          const newE = payload.e;
          newE.deltaY = -150;
          const { pan, scale } = getPanScaleFromMouseWheel(
            newE,
            psState,
            screen(),
            bounds,
          );
          panScaleDispatch({
            type: 'destination',
            payload: {
              pan,
              scale,
            },
          });

          break;
        }

        default:
          break;
      }
    }
    return true;
  };

  const handleMouseWheel = (e) => {
    const st = getPanScaleFromMouseWheel(
      e,
      psState,
      screen(),
      getBounds(nodes.current.values(), shapes),
    );
    panScaleDispatch({ type: 'set', payload: st });
  };

  const resize = (t) => {
    if (!t) {
      return false;
    }
    baseCanvas.current = t;
    setScreenState(screen());
    return true;
  };

  const handleMouse = (e) => {
    if (!screen().boundingRect) {
      return false;
    }
    e.preventDefault();
    e.target.focus();
    const pos = getMousePos(e, screen(), psState);
    const ctrlClick = e.ctrlKey || e.metaKey || e.shiftKey;
    processMouseAction(e.type, { pos, ctrlClick, e });
    return true;
  };

  const handleZoomClick = (e, level) => {
    e && e.preventDefault();
    baseCanvas.current.focus();
    zoomHandler(level);
  };

  const handleKey = (event) => {
    if (event.defaultPrevented) return false;
    event.stopPropagation();
    const key = event.key || event.keyCode;
    setKeyActionState(event.type === 'keydown' ? getKeyAction(key) : null);
    return true;
  };

  // KEY ACTIONS ----------------------------------------
  const handleKeyAction = (a) => {
    panScaleDispatch({ type: 'keyAction', payload: a });
  };

  const zoomToFit = useCallback(() => {
    interactionDispatch({ type: 'endLayout' });
    const b = getBounds(nodes.current.values(), shapes);
    const padding = optionState?.cameraOptions?.fitAllPadding || 10;
    const v = getFitToScreen(b, screen(), padding);
    panScaleDispatch({ type: 'destination', payload: v });
    return true;
  }, [nodes.current, shapes]);

  const zoomHandler = (level) => {
    const scr = screen();
    const bds = getBounds(nodes.current.values(), shapes);
    const newScale = getBoundsScale(scr.height, scr.width, bds);
    let dn = null;
    switch (level) {
      case 'in':
        panScaleDispatch({
          type: 'zoomIn',
          payload: { screen: scr, bounds: bds },
        });
        break;
      case 'out':
        panScaleDispatch({
          type: 'zoomOut',
          payload: { screen: scr, newScale, bounds: bds },
        });
        break;
      case 'all':
        zoomToFit();
        break;
      case 'selection':
        dn = interactionState.draggedNodes[0];
        if (dn) {
          panScaleDispatch({
            type: 'zoomSelection',
            payload: { screen: scr, dn },
          });
        }
        break;

      default:
        break;
    }
    return true;
  };

  const edgePan = () => {
    // panning at the edges of the screen changes pan and dragged nodes cooridiates
    const { scale, panPerFrame, pan } = psState;
    const pn = { ...pan };
    pn.x += panPerFrame.x * scale;
    pn.y += panPerFrame.y * scale;

    // drag the nodes directly
    interactionState.draggedNodes.forEach((n) => {
      n.x -= panPerFrame.x;
      n.y -= panPerFrame.y;
    });

    panScaleDispatch({
      type: 'pan',
      payload: pn,
    });
  };

  // do what has to be done each frame
  const tickHandler = () => {
    if (keyActionState) {
      handleKeyAction(keyActionState);
    }

    if (psState.destinationScale) {
      zoomPanimate();
    }

    if (psState.panPerFrame) {
      edgePan();
    }
  };

  const zoomPanimate = () => {
    panScaleDispatch({ type: 'zoomPanimate' });
  };

  const handlers = (type, payload) => {
    switch (type) {
      case 'resize':
        resize(payload);
        break;

      case 'tick':
        tickHandler();
        break;

      default:
        return true;
    }
    return true;
  };

  const runLayout = () => {
    interactionDispatch({ type: 'runLayout' });
    layouter(
      {
        nodeMap: nodes.current,
        edgeMap: edges.current,
        shapes,
      },
      optionState.layoutOptions,
      screen(),
      zoomToFit,
    );
  };

  const checkGraph = useCallback(
    (nextGraph) => {
      const setGraphType = (gType, mType, VisualClass) => {
        let dirty = false;
        const dupMap = {};
        gType.forEach((n) => {
          const has = mType.has(n.id);
          const diff = has && mType.get(n.id).definition !== n;
          if (!has || diff) {
            if (VisualClass === Edge) {
              // duplicate ends degection
              const to = n.to.toString();
              const from = n.from.toString();
              const toFrom = [to, from].sort().join('-');
              let dupNumber = 0;
              if (dupMap[toFrom] !== undefined) {
                dupNumber = dupMap[toFrom] + 1;
                dupMap[toFrom] = dupNumber;
              } else {
                dupMap[toFrom] = 0;
              }
              mType.set(
                n.id,
                new VisualClass(
                  n.id,
                  n,
                  nodes.current.get(to),
                  nodes.current.get(from),
                  dupNumber,
                ),
              );
            } else {
              mType.set(n.id, new VisualClass(n.id, n));
            }

            dirty = dirty || !has;
          }
        });

        mType.forEach((value, key, map) => {
          if (!gType.includes(value.definition)) {
            mType.delete(key);
            dirty = true;
          }
        });
        return dirty;
      };

      const nodesDirty = setGraphType(nextGraph.nodes, nodes.current, Node);
      const edgesDirty = setGraphType(nextGraph.edges, edges.current, Edge);
      const dirty = nodesDirty || edgesDirty;
      if (dirty) {
        runLayout();
      }
    },
    [nodes, edges, optionState],
  );

  // we need to detect changes to graph, options, nodeDrawing, edgeDrawing, shapeDrawing or layouter props
  useEffect(() => {
    callbackFn &&
      callbackFn({
        nodes,
        getPositions,
        gp: () => getPositions(nodes.current),
        fit: () => zoomToFit(),
      });
  }, []);

  useEffect(() => {
    checkGraph(graph);
  }, [checkGraph, graph]);

  useEffect(() => {
    setOptionState(merge(optionState, options));
  }, [options]);

  useEffect(() => {
    interactionDispatch({ type: 'reset' });
  }, [optionState.blockGraphInteraction, interactionDispatch, shapes]);

  if (nodes.current && edges.current) {
    return (
      <Renderer
        clearHover={clearHover}
        customControls={props.customControls}
        edges={edges.current}
        handleKey={handleKey}
        handleMouse={handleMouse}
        handleMouseWheel={handleMouseWheel}
        handlers={handlers}
        handleZoom={handleZoomClick}
        hoverState={hoverState}
        images={images}
        interactionState={interactionState}
        nodes={nodes.current}
        nodeDrawingFunction={nodeDrawingFunction}
        options={optionState}
        panScaleState={psState}
        rolloverState={rolloverState}
        screen={screenState}
        shapes={shapes || []}
        shapeDrawingFunction={shapeDrawingFunction}
        uid={uid}
        bounds={getBounds(nodes.current.values(), shapes)}
      />
    );
  }

  return null;
};

export default memo(ReVisNetwork);
