/**
 * @constructor ItemPoint
 * @extends Item
 * @param {Object} data             Object containing parameters start
 *                                  content, className.
 * @param {Object} [options]        Options to set initial property values
 * @param {Object} [defaultOptions] default options
 *                                  // TODO: describe available options
 */
function ItemPoint (data, options, defaultOptions) {
  this.props = {
    dot: {
      top: 0,
      width: 0,
      height: 0
    },
    content: {
      height: 0,
      marginLeft: 0
    }
  };

  // validate data
  if (data) {
    if (data.start == undefined) {
      throw new Error('Property "start" missing in item ' + data);
    }
  }

  Item.call(this, data, options, defaultOptions);
}

ItemPoint.prototype = new Item (null);

/**
 * Check whether this item is visible inside given range
 * @returns {{start: Number, end: Number}} range with a timestamp for start and end
 * @returns {boolean} True if visible
 */
ItemPoint.prototype.isVisible = function isVisible (range) {
  // determine visibility
  // TODO: account for the real width of the item. Right now we just add 1/4 to the window
  var interval = (range.end - range.start) / 4;
  return (this.data.start > range.start - interval) && (this.data.start < range.end + interval);
};

/**
 * Repaint the item
 */
ItemPoint.prototype.repaint = function repaint() {
  var dom = this.dom;
  if (!dom) {
    // create DOM
    this.dom = {};
    dom = this.dom;

    // background box
    dom.point = document.createElement('div');
    // className is updated in repaint()

    // contents box, right from the dot
    dom.content = document.createElement('div');
    dom.content.className = 'content';
    dom.point.appendChild(dom.content);

    // dot at start
    dom.dot = document.createElement('div');
    dom.point.appendChild(dom.dot);

    // attach this item as attribute
    dom.point['timeline-item'] = this;
  }

  // append DOM to parent DOM
  if (!this.parent) {
    throw new Error('Cannot repaint item: no parent attached');
  }
  if (!dom.point.parentNode) {
    var foreground = this.parent.getForeground();
    if (!foreground) {
      throw new Error('Cannot repaint time axis: parent has no foreground container element');
    }
    foreground.appendChild(dom.point);
  }
  this.displayed = true;

  // update contents
  if (this.data.content != this.content) {
    this.content = this.data.content;
    if (this.content instanceof Element) {
      dom.content.innerHTML = '';
      dom.content.appendChild(this.content);
    }
    else if (this.data.content != undefined) {
      dom.content.innerHTML = this.content;
    }
    else {
      throw new Error('Property "content" missing in item ' + this.data.id);
    }

    this.dirty = true;
  }

  // update class
  var className = (this.data.className? ' ' + this.data.className : '') +
      (this.selected ? ' selected' : '');
  if (this.className != className) {
    this.className = className;
    dom.point.className  = 'item point' + className;
    dom.dot.className  = 'item dot' + className;

    this.dirty = true;
  }

  // recalculate size
  if (this.dirty) {
    this.width = dom.point.offsetWidth;
    this.height = dom.point.offsetHeight;
    this.props.dot.width = dom.dot.offsetWidth;
    this.props.dot.height = dom.dot.offsetHeight;
    this.props.content.height = dom.content.offsetHeight;

    // resize contents
    dom.content.style.marginLeft = 2 * this.props.dot.width + 'px';
    //dom.content.style.marginRight = ... + 'px'; // TODO: margin right

    dom.dot.style.top = ((this.height - this.props.dot.height) / 2) + 'px';
    dom.dot.style.left = (this.props.dot.width / 2) + 'px';

    this.dirty = false;
  }

  this._repaintDeleteButton(dom.point);
};

/**
 * Show the item in the DOM (when not already visible). The items DOM will
 * be created when needed.
 */
ItemPoint.prototype.show = function show() {
  if (!this.displayed) {
    this.repaint();
  }
};

/**
 * Hide the item from the DOM (when visible)
 */
ItemPoint.prototype.hide = function hide() {
  if (this.displayed) {
    if (this.dom.point.parentNode) {
      this.dom.point.parentNode.removeChild(this.dom.point);
    }

    this.top = null;
    this.left = null;

    this.displayed = false;
  }
};

/**
 * Reposition the item horizontally
 * @Override
 */
ItemPoint.prototype.repositionX = function repositionX() {
  var start = this.defaultOptions.toScreen(this.data.start);

  this.left = start - this.props.dot.width;

  // reposition point
  this.dom.point.style.left = this.left + 'px';
};

/**
 * Reposition the item vertically
 * @Override
 */
ItemPoint.prototype.repositionY = function repositionY () {
  var orientation = this.options.orientation || this.defaultOptions.orientation,
      point = this.dom.point;

  if (orientation == 'top') {
    point.style.top = this.top + 'px';
    point.style.bottom = '';
  }
  else {
    point.style.top = '';
    point.style.bottom = this.top + 'px';
  }
};
