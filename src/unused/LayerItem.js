const DEFAULT_STYLE = { fill: '#ffffff', stroke: '#333333', lineWidth: 2, font: '16px lato, Arial' };
/*
Standard decorator class can call state.decoratorFunction to render.  Render will be called on each refresh.
*/
export default class LayerItem {
  constructor(id, definition) {
    this.id = definition.id ? definition.id.toString() : null;
    this.definition = definition;
    this.x = definition.x || 0;
    this.y = definition.y !== undefined ? definition.y : 300;
    this.height = definition.height || definition.size || 300;
    this.width = definition.width || definition.size || 300;

    this.destination = null;
    this.shape = definition.shape || null;
    this.visible = true;
    this.style = null;
  }

  // allows style to be set from parent
  setStyle(style) {
    this.style = style;
  }

  destroy() {
    this.delete = true;
  }

  render(state, context, images, drawingFunction) {
    const d = this.definition;
    this.x = d.x;
    this.y = d.y;
    this.height = d.height || d.size;
    this.width = d.width || d.size;
    if (this.visible) {
      // calculate styles like css 1. this.style, 2. this.definition.style, 3. DEFAULT_STYLE
      const style = { ...DEFAULT_STYLE, ...(this.definition.style || {}), ...(this.style || {}) };

      // draw
      const ctx = context;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.lineWidth = style.lineWidth || DEFAULT_STYLE.lineWidth;
      ctx.fillStyle = style.background || style.fillColor || style.fill || DEFAULT_STYLE.fill;
      ctx.strokeStyle =
        style.border || style.strokeColor || style.stroke || style.line || DEFAULT_STYLE.stroke;
      ctx.beginPath();
      if (drawingFunction) {
        drawingFunction(ctx, this, this.selected, this.state);
      } else {
        ctx.fillRect(0, 0, this.width, this.height);
      }

      if (this.shape !== 'image') {
        // not an image
        ctx.closePath();
        if (style && style.fill !== null) {
          ctx.fill();
        }
        ctx.stroke();
      } else if (this.definition.image) {
        // image support is a little different
        const sc = (this.definition && this.definition.scale) || 1;
        ctx.drawImage(this.definition.image, 0, 0, this.width * sc, this.height * sc);
      }

      ctx.restore();
    }
  }
}
