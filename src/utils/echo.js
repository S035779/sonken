/*! echo-js v1.7.3 | (c) 2016 @toddmotto | https://github.com/toddmotto/echo */
let callback = function () {};
let root, offset, poll, delay, useDebounce, unload;

const isHidden = element => {
  return (element.offsetParent === null);
};

const inView = (element, view) => {
  if (isHidden(element)) {
    return false;
  }

  let box = element.getBoundingClientRect();
  return (box.right >= view.l && box.bottom >= view.t && box.left <= view.r && box.top <= view.b);
};

const debounceOrThrottle = () => {
  if(!useDebounce && !!poll) {
    return;
  }
  clearTimeout(poll);
  poll = setTimeout(() => {
    render();
    poll = null;
  }, delay);
};

const init = (element, opts) => {
  root = element || this;
  opts = opts || {};
  let offsetAll = opts.offset || 0;
  let offsetVertical = opts.offsetVertical || offsetAll;
  let offsetHorizontal = opts.offsetHorizontal || offsetAll;
  const optionToInt = (opt, fallback) => {
    return parseInt(opt || fallback, 10);
  };
  offset = {
    t: optionToInt(opts.offsetTop, offsetVertical),
    b: optionToInt(opts.offsetBottom, offsetVertical),
    l: optionToInt(opts.offsetLeft, offsetHorizontal),
    r: optionToInt(opts.offsetRight, offsetHorizontal)
  };
  delay = optionToInt(opts.throttle, 250);
  useDebounce = opts.debounce !== false;
  unload = !!opts.unload;
  callback = opts.callback || callback;
  render();
  if (document.addEventListener) {
    root.addEventListener('scroll', debounceOrThrottle, false);
    root.addEventListener('load', debounceOrThrottle, false);
  } else {
    root.attachEvent('onscroll', debounceOrThrottle);
    root.attachEvent('onload', debounceOrThrottle);
  }
};

const render = context => {
  let nodes = (context || document).querySelectorAll('[data-echo], [data-echo-background]');
  let length = nodes.length;
  let src, elem;
  let view = {
    l: 0 - offset.l,
    t: 0 - offset.t,
    b: (root.innerHeight || document.documentElement.clientHeight) + offset.b,
    r: (root.innerWidth || document.documentElement.clientWidth) + offset.r
  };
  for (let i = 0; i < length; i++) {
    elem = nodes[i];
    if (inView(elem, view)) {

      if (unload) {
        elem.setAttribute('data-echo-placeholder', elem.src);
      }

      if (elem.getAttribute('data-echo-background') !== null) {
        elem.style.backgroundImage = 'url(' + elem.getAttribute('data-echo-background') + ')';
      }
      else if (elem.src !== (src = elem.getAttribute('data-echo'))) {
        elem.src = src;
      }

      if (!unload) {
        elem.removeAttribute('data-echo');
        elem.removeAttribute('data-echo-background');
      }

      callback(elem, 'load');
    }
    else if (unload && !!(src = elem.getAttribute('data-echo-placeholder'))) {

      if (elem.getAttribute('data-echo-background') !== null) {
        elem.style.backgroundImage = 'url(' + src + ')';
      }
      else {
        elem.src = src;
      }

      elem.removeAttribute('data-echo-placeholder');
      callback(elem, 'unload');
    }
  }
  if (!length) {
    detach();
  }
};

const detach = () => {
  if (document.removeEventListener) {
    root.removeEventListener('scroll', debounceOrThrottle);
  } else {
    root.detachEvent('onscroll', debounceOrThrottle);
  }
  clearTimeout(poll);
};

export default { init, render, detach };
