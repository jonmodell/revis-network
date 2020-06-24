import { useReducer } from 'react';

export const initialPanScaleState = {
  destinationScale: null,
  destinationPan: null,
  scale: 1,
  pan: { x: 300, y: 300 },
  panPerFrame: null,
};

const actionTypes = {
  destination: 'destination',
  edgePan: 'edgePan',
  framePan: 'framePan',
  keyAction: 'keyAction',
  pan: 'pan',
  set: 'set',
  zoomIn: 'zoomIn',
  zoomOut: 'zoomOut',
  zoomPanimate: 'zoomPanimate',
  zoomSelection: 'zoomSelection',
  zoomToFit: 'zoomToFit',
  zoomToPoint: 'zoomToPoint',
};

const KEY_PAN_FACTOR = 10;
const SCALE_FACTOR = 0.5;
const MIN_ZOOM = 0.6;
const MAX_ZOOM = 6;

function panScaleReducer(state, action) {
  switch (action.type) {
    case actionTypes.keyAction: {
      const a = action.payload;
      let { pan, scale } = { ...state };
      switch (a) {
        case '_moveUp':
          pan.y -= KEY_PAN_FACTOR;
          break;
        case '_moveDown':
          pan.y += KEY_PAN_FACTOR;
          break;
        case '_moveLeft':
          pan.x -= KEY_PAN_FACTOR;
          break;
        case '_moveRight':
          pan.x += KEY_PAN_FACTOR;
          break;
        case '_zoomIn':
          scale = Math.min(MAX_ZOOM, scale + SCALE_FACTOR / 5);
          break;
        case '_zoomOut':
          scale = Math.max(MIN_ZOOM, scale - SCALE_FACTOR / 5);
          break;
        default:
          break;
      }

      return { ...state, pan, scale };
    }
    case actionTypes.set: {
      return action.payload;
    }
    case actionTypes.destination: {
      return {
        ...state,
        destinationScale: action.payload.scale,
        destinationPan: action.payload.pan,
      };
    }
    case actionTypes.pan: {
      return {
        ...state,
        pan: action.payload,
      };
    }
    case actionTypes.framePan: {
      return {
        ...state,
        panPerFrame: action.payload,
      };
    }
    case actionTypes.zoomPanimate: {
      const { pan, scale, destinationScale, destinationPan } = state;
      const scaleDiff = destinationScale - scale;
      const xDiff = destinationPan.x - pan.x;
      const yDiff = destinationPan.y - pan.y;
      if (
        scaleDiff * scaleDiff > 0.0005 ||
        xDiff * xDiff > 4 ||
        yDiff * yDiff > 4
      ) {
        const calculatedScale = scale + scaleDiff / 4;
        return {
          ...state,
          scale: calculatedScale,
          pan: {
            x: Number(pan.x) + xDiff / 4,
            y: Number(pan.y) + yDiff / 4,
          },
        };
      }

      return {
        ...state,
        scale: destinationScale,
        pan: { x: Number(destinationPan.x), y: Number(destinationPan.y) },
        destinationScale: null,
        destinationPan: null,
      };
    }
    case actionTypes.edgePan: {
      // panning at the edges of the screen changes pan and dragged nodes cooridiates
      const { scale, panPerFrame, pan } = state;
      const pn = { ...pan };
      pn.x += panPerFrame.x * scale;
      pn.y += panPerFrame.y * scale;

      return {
        ...state,
        pan: pn,
      };
    }
    case actionTypes.zoomOut: {
      const { newScale, bounds, screen } = action.payload;
      const nsf = Math.max(
        state.scale - SCALE_FACTOR,
        Math.min(MIN_ZOOM, newScale),
      );
      const x = screen.width / 2 - (bounds.width / 2 + bounds.minX) * nsf;
      const y = screen.height / 2 - (bounds.height / 2 + bounds.minY) * nsf;
      return {
        ...state,
        destinationScale: nsf,
        destinationPan: { x, y },
      };
    }
    case actionTypes.zoomIn: {
      const { bounds, screen } = action.payload;
      const nsf = Math.min(state.scale + SCALE_FACTOR, MAX_ZOOM);
      const x = screen.width / 2 - (bounds.width / 2 + bounds.minX) * nsf;
      const y = screen.height / 2 - (bounds.height / 2 + bounds.minY) * nsf;
      return {
        ...state,
        destinationScale: nsf,
        destinationPan: { x, y },
      };
    }
    case actionTypes.zoomSelection: {
      const { dn, screen } = action.payload;
      return {
        ...state,
        destinationScale: 2,
        destinationPan: {
          x: screen.width / 2 - dn.x * 2,
          y: screen.height / 2 - dn.y * 2,
        },
      };
    }

    case actionTypes.zoomToPoint: {
      const { pos, screen } = action.payload;
      const nsf = Math.min(state.scale + SCALE_FACTOR, MAX_ZOOM);
      return {
        ...state,
        destinationScale: nsf,
        destinationPan: {
          x: (screen.width / 2 - pos.x) * nsf,
          y: (screen.height / 2 - pos.y) * nsf,
        },
      };
    }

    default: {
      throw new Error(`Unhandled type: ${action.type}`);
    }
  }
}

export default function usePanScale({ reducer = panScaleReducer } = {}) {
  const [psState, dispatch] = useReducer(reducer, initialPanScaleState);
  return { psState, panScaleDispatch: dispatch };
}
