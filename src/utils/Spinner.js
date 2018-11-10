import {Spinner as Spin} from 'Utilities/spin';

export default class Spinner {
  constructor(target) {
    this.target = document.getElementById(target);
    this.Spinner = new Spin(opts);
  }

  static of(target) {
    return new Spinner(target);
  }

  start() {
    this.Spinner.spin(this.target);
    this.el = document.createElement('div');
    this.css(this.el, {
      display: 'block' /* Hidden by default */
    , position: 'fixed' /* Stay in place */
    , zIndex: 2000 /* Sit on top */
    , left: 0
    , top: 0
    , width: '100%' /* Full width */
    , height: '100%' /* Full height */
    , backgroundColor: 'rgba(0,0,0,0.2)' /* Black w/ opacity */
    });
    if(this.target) {
      this.target.insertBefore(this.el, this.target.firstChild || null);
    }
  }

  stop() {
    this.Spinner.stop();
    if(this.el) {
      if(this.el.parentNode) {
        this.el.parentNode.removeChild(this.el);
      }
      this.el = undefined;
    }
  }

  css(el, props) {
    for (let prop in props) {
      el.style[this.vendor(el, prop) || prop] = props[prop];
    }
    return el;
  }

  vendor(el, prop) {
    if (el.style[prop] !== undefined) {
      return prop;
    }
    // needed for transform properties in IE 9
    const prefixed = 'ms' + prop.charAt(0).toUpperCase() + prop.slice(1);
    if (el.style[prefixed] !== undefined) {
      return prefixed;
    }
    return '';
  }
}

const opts = {
  lines:        13          // The number of lines to draw
  , length:     28          // The length of each line
  , width:      14          // The line thickness
  , radius:     42          // The radius of the inner circle
  , scale:      1           // Scales overall size of the spinner
  , corners:    1           // Corner roundness (0..1)
  , color:      '#000'      // #rgb or #rrggbb or array of colors
  , opacity:    0.25        // Opacity of the lines
  , rotate:     0           // The rotation offset
  , direction:  1           // 1: clockwise, -1: counterclockwise
  , speed:      1           // Rounds per second
  , trail:      60          // Afterglow percentage
  , fps:        20          // Frames per second when using
                            // setTimeout() as
                            // a fallback for CSS
  , zIndex:     2e9         // The z-index (defaults to 2000000000)
  , className:  'spinner'   // The CSS class to assign to the
                            //  spinner
  , top:        '49%'       // Top position relative to parent
  , left:       '49%'       // Left position relative to parent
  , shadow:     false       // Whether to render a shadow
  , hwaccel:    false       // Whether to use hardware acceleration
  , position:   'absolute'  // Element positioning
};
