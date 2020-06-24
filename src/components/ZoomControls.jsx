import React from 'react';
import {
  fitAllData,
  fitSelectionData,
  zoomOutData,
  zoomInData,
} from './zoomImages';

const ZoomControls = (props) => {
  // return a function that calls this.zoom from the outside
  const getZoomFn = (level: string) => {
    return (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
      props.zoom(event, level);
  };

  const { customControls } = props;

  return (
    <div>
      {customControls ? (
        customControls({
          zoomIn: getZoomFn('in'),
          zoomOut: getZoomFn('out'),
          fitAll: getZoomFn('all'),
          fitSelection: getZoomFn('selection'),
        })
      ) : (
        <div className='controls'>
          <button type='button' onClick={getZoomFn('in')}>
            <div
              className='control-button'
              style={{ background: `url(${zoomInData})`, right: '1px' }}
            />
          </button>
          <button type='button' onClick={getZoomFn('out')}>
            <div
              className='control-button'
              style={{
                background: `url(${zoomOutData})`,
                right: '1px',
                top: '-12px',
              }}
            />
          </button>
          <button type='button' onClick={getZoomFn('all')}>
            <div
              className='control-button'
              style={{ background: `url(${fitAllData})`, top: '-14px' }}
            />
          </button>
          <button type='button' onClick={getZoomFn('selection')}>
            <div
              className='control-button'
              style={{
                background: `url(${fitSelectionData})`,
                top: '-26px',
              }}
            />
          </button>
        </div>
      )}
    </div>
  );
};

export default ZoomControls;
