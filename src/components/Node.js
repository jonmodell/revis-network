import { drawText } from './util';

const DEFAULT_STYLE = {
  background: '#ffffff',
  border: '#333333',
  lineWidth: 2,
  font: '8px lato',
  fontColor: '#555555',
};

const MAX_INNER_LABEL_CHARS = 10;
const MIN_INNER_LABEL_CHARS = 7;
const MAX_OUTER_LABEL_CHARS = 35;
const MIN_OUTER_LABEL_CHARS = 12;
/*
instead of having the node support predefined states like selected, hovering, faded, etc...
have animations run from methods like bounce() or even animate(animateFunction => sizeModifier)
have the node call state.getStyleForNode(definition) => {background, border, lineWidth} to get
style information.  The node would not hold status or state properties, those would have to be 
kept in the implementation - a list of selected, faded, etc... to figure out the style
*/
export default class Node {
  constructor(id, definition) {
    this.id = id.toString();

    // definition can be set from the outside, and it can change
    this.definition = definition;

    // mass and size properties
    this.bSize = definition.size || 30;
    this.size = definition.size || 30;
    this.mass = definition.mass || 1;

    // location properties
    this.x = definition.x || 0;
    this.y = definition.y || 0;
    this.fixed = definition.fixed || false;
    this.destination = null;

    // style
    this.style = { ...DEFAULT_STYLE, ...(definition.style || {}) };

    // these are internal to keep track of animation
    this.bounceCounter = 0;
  }

  // allows style to be set from parent
  setStyle(style) {
    this.style = style;
  }

  destroy() {
    this.delete = true;
  }

  render(state, context, images, drawingFunction) {
    const hovering = state.rolloverItem === this;

    // adjust size
    // NODE SCALEFACTOR and SCALE COEFICIENT SHOULD CHANGE WHEN THE SCREEN.SCALE CHANGES ONLY, then get pass in as part of the state
    let scaleCoeficient = 1;
    if (state.scale > 1.5) {
      scaleCoeficient = 0.5;
    } else if (state.scale < 0.5) {
      scaleCoeficient = 2;
    }
    const scaleFactor =   scaleCoeficient;

    // NODE BASE SIZE SHOULD CHANGE WHEN node.definition.style.size OR node.definition.size changes only
    const size =
      (((this.style && this.style.size) || this.definition.size || this.size) +
        (hovering ? 5 : 0)); // / scaleFactor;

    // this.bSize must be set because it is used publicly by collision detection, but it is still just the node's (baseSize (+5 if hovering)) / scaleFactor
    this.bSize = size;

    // move
    if (this.destination) {
      if (
        Math.abs(this.x - this.destination.x) > 1 ||
        Math.abs(this.y - this.destination.y) > 1
      ) {
        this.x += (this.destination.x - this.x) * 0.5;
        this.y += (this.destination.y - this.y) * 0.5;
      } else {
        this.destination = null;
      }
    }

    // calculate styles like css 1. this.style, 2. this.definition.style, 3. DEFAULT_STYLE
    const fill = this.style.fill || this.style.background;
    const stroke = this.style.stroke || this.style.border;
    const fontColor = this.style.fontColor;
    const innerLabelColor = this.style.innerLabelColor || fontColor;
    const lineWidth = this.style.lineWidth / (scaleFactor * 4);
    const opacity = this.style.opacity || 1;

    // DRAW the main shape
    const ctx = context;
    ctx.save();
    ctx.translate(this.x - size / 2, this.y - size / 2); // traslate to a left top that will center the drawing

    ctx.lineWidth = lineWidth;
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;

    ctx.beginPath();

    // shape
    if (drawingFunction) {
      drawingFunction(ctx, this.definition, size);
    } else {
      ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI, false);
    }

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.save(); // saving where we drew the shape

    // text
    ctx.translate(size / 2, size / 2); // traslate back to the center point
    const fontSize = scaleCoeficient < 1 ? 8 / scaleFactor : 12 / scaleFactor;

    // inner text
    if (this.definition.innerLabel) {
      const lbl = this.definition.innerLabel;
      const allowedCharacters =
        scaleCoeficient < 1 ? MAX_INNER_LABEL_CHARS : MIN_INNER_LABEL_CHARS;
      drawText(
        ctx,
        lbl,
        size,
        innerLabelColor,
        fontSize * 0.8,
        allowedCharacters,
        0.52,
      );
    }

    // outer label
    if (
      this.definition.label &&
      state.options &&
      state.options.nodes &&
      state.options.nodes.showLabels &&
      state.scale > 0.75
    ) {
      const lbl = this.definition.label;
      const allowedCharacters =
        scaleCoeficient < 1 ? MAX_OUTER_LABEL_CHARS : MIN_OUTER_LABEL_CHARS; // number of characters
      drawText(ctx, lbl, size, fontColor, fontSize, allowedCharacters, 1.3);
    }

    // image
    if (this.definition.image || this.definition.img) {
      const defImg = this.definition.image || this.definition.img;
      let img = new Image();
      // if the image is not a .svg file and it can be found by id in state.images
      if (images && images && images[defImg] !== undefined) {
        img = images[defImg].element || images[defImg];
        // otherwise we expect the image to be a fully loaded element
      } else if (defImg instanceof HTMLImageElement) {
        img = defImg;
      }
      if (img.src) {
        const imgSize =
          (size / 2) *
          ((images[defImg] && images[defImg].scale) ||
            this.definition.imgScale ||
            1);
        const offsetX = images[defImg].offsetX || 0;
        const offsetY = images[defImg].offsetY || 0;
        ctx.beginPath();

        const imgRatio = (img.height / img.width).toFixed(2); // an attempt to keep the image ratio constant
        ctx.save();
        ctx.translate(-imgSize / 2 + offsetX, (-imgSize * imgRatio) / 1.6 + offsetY);
        ctx.drawImage(img, 0, 0, imgSize, imgSize * imgRatio);
        ctx.restore();
      }
    }
    ctx.restore();  // restore to where we drew the shape

    // cover opacity to simulate transparency
    if (state.options.coverColor && opacity !== 1) {
      ctx.fillStyle = state.options.coverColor;
      ctx.strokeStyle = state.options.coverColor;
      ctx.beginPath();
      if (drawingFunction) {
        drawingFunction(ctx, this.definition, size);
      } else {
        ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI, false);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }
}
