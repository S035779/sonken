const __assign = (this && this.__assign) || Object.assign || function(t) {
    for (let s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (let p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
const defaults = {
    lines: 12,
    length: 7,
    width: 5,
    radius: 10,
    scale: 1.0,
    corners: 1,
    color: '#000',
    fadeColor: 'transparent',
    opacity: 0.25,
    rotate: 0,
    direction: 1,
    speed: 1,
    trail: 100,
    fps: 20,
    zIndex: 2e9,
    className: 'spinner',
    top: '50%',
    left: '50%',
    shadow: 'none',
    position: 'absolute'
};
const Spinner = /** @class */ (function () {
    function Spinner(opts) {
        if (opts === void 0) { opts = {}; }
        this.opts = __assign({}, defaults, opts);
    }
    /**
     * Adds the spinner to the given target element. If this instance is already
     * spinning, it is automatically removed from its previous target by calling
     * stop() internally.
     */
    Spinner.prototype.spin = function (target) {
        const _this = this;
        this.stop();
        this.el = document.createElement('div');
        this.el.className = this.opts.className;
        this.el.setAttribute('role', 'progressbar');
        css(this.el, {
            position: this.opts.position,
            width: 0,
            zIndex: this.opts.zIndex,
            left: this.opts.left,
            top: this.opts.top,
            transform: "scale(" + this.opts.scale + ")"
        });
        if (target) {
            target.insertBefore(this.el, target.firstChild || null);
        }
        let animator;
        let getNow;
        if (typeof requestAnimationFrame !== 'undefined') {
            animator = requestAnimationFrame;
            getNow = function () { return performance.now(); };
        }
        else {
            // fallback for IE 9
            animator = function (callback) { return setTimeout(callback, 1000 / _this.opts.fps); };
            getNow = function () { return Date.now(); };
        }
        let lastFrameTime;
        let state = 0; // state is rotation percentage (between 0 and 1)
        const animate = function () {
            const time = getNow();
            if (lastFrameTime === undefined) {
                lastFrameTime = time - 1;
            }
            state += getAdvancePercentage(time - lastFrameTime, _this.opts.speed);
            lastFrameTime = time;
            if (state > 1) {
                state -= Math.floor(state);
            }
            if (_this.el.childNodes.length === _this.opts.lines) {
                for (let line = 0; line < _this.opts.lines; line++) {
                    const opacity = getLineOpacity(line, state, _this.opts);
                    _this.el.childNodes[line].childNodes[0].style.opacity = opacity.toString();
                }
            }
            _this.animateId = _this.el ? animator(animate) : undefined;
        };
        drawLines(this.el, this.opts);
        animate();
        return this;
    };
    /**
     * Stops and removes the Spinner.
     * Stopped spinners may be reused by calling spin() again.
     */
    Spinner.prototype.stop = function () {
        if (this.el) {
            if (typeof requestAnimationFrame !== 'undefined') {
                cancelAnimationFrame(this.animateId);
            }
            else {
                clearTimeout(this.animateId);
            }
            if (this.el.parentNode) {
                this.el.parentNode.removeChild(this.el);
            }
            this.el = undefined;
        }
        return this;
    };
    return Spinner;
}());
export { Spinner };
function getAdvancePercentage(msSinceLastFrame, roundsPerSecond) {
    return msSinceLastFrame / 1000 * roundsPerSecond;
}
function getLineOpacity(line, state, opts) {
    const linePercent = (line + 1) / opts.lines;
    let diff = state - (linePercent * opts.direction);
    if (diff < 0 || diff > 1) {
        diff += opts.direction;
    }
    // opacity should start at 1, and approach opacity option as diff reaches trail percentage
    const trailPercent = opts.trail / 100;
    const opacityPercent = 1 - diff / trailPercent;
    if (opacityPercent < 0) {
        return opts.opacity;
    }
    const opacityDiff = 1 - opts.opacity;
    return opacityPercent * opacityDiff + opts.opacity;
}
/**
 * Tries various vendor prefixes and returns the first supported property.
 */
function vendor(el, prop) {
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
/**
 * Sets multiple style properties at once.
 */
function css(el, props) {
    for (let prop in props) {
        el.style[vendor(el, prop) || prop] = props[prop];
    }
    return el;
}
/**
 * Returns the line color from the given string or array.
 */
function getColor(color, idx) {
    return typeof color === 'string' ? color : color[idx % color.length];
}
/**
 * Internal method that draws the individual lines.
 */
function drawLines(el, opts) {
    const borderRadius = (Math.round(opts.corners * opts.width * 500) / 1000) + 'px';
    let shadow = 'none';
    if (opts.shadow === true) {
        shadow = '0 2px 4px #000'; // default shadow
    }
    else if (typeof opts.shadow === 'string') {
        shadow = opts.shadow;
    }
    const shadows = parseBoxShadow(shadow);
    for (let i = 0; i < opts.lines; i++) {
        const degrees = ~~(360 / opts.lines * i + opts.rotate);
        const backgroundLine = css(document.createElement('div'), {
            position: 'absolute',
            top: -opts.width / 2 + "px",
            width: (opts.length + opts.width) + 'px',
            height: opts.width + 'px',
            background: getColor(opts.fadeColor, i),
            borderRadius: borderRadius,
            transformOrigin: 'left',
            transform: "rotate(" + degrees + "deg) translateX(" + opts.radius + "px)"
        });
        const line = css(document.createElement('div'), {
            width: '100%',
            height: '100%',
            background: getColor(opts.color, i),
            borderRadius: borderRadius,
            boxShadow: normalizeShadow(shadows, degrees),
            opacity: opts.opacity
        });
        backgroundLine.appendChild(line);
        el.appendChild(backgroundLine);
    }
}
function parseBoxShadow(boxShadow) {
    const regex = /^\s*([a-zA-Z]+\s+)?(-?\d+(\.\d+)?)([a-zA-Z]*)\s+(-?\d+(\.\d+)?)([a-zA-Z]*)(.*)$/;
    let shadows = [];
    for (let _i = 0, _a = boxShadow.split(','); _i < _a.length; _i++) {
        let shadow = _a[_i];
        const matches = shadow.match(regex);
        if (matches === null) {
            continue; // invalid syntax
        }
        let x = +matches[2];
        let y = +matches[5];
        let xUnits = matches[4];
        let yUnits = matches[7];
        if (x === 0 && !xUnits) {
            xUnits = yUnits;
        }
        if (y === 0 && !yUnits) {
            yUnits = xUnits;
        }
        if (xUnits !== yUnits) {
            continue; // units must match to use as coordinates
        }
        shadows.push({
            prefix: matches[1] || '',
            x: x,
            y: y,
            xUnits: xUnits,
            yUnits: yUnits,
            end: matches[8]
        });
    }
    return shadows;
}
/**
 * Modify box-shadow x/y offsets to counteract rotation
 */
function normalizeShadow(shadows, degrees) {
    let normalized = [];
    for (let _i = 0, shadows_1 = shadows; _i < shadows_1.length; _i++) {
        const shadow = shadows_1[_i];
        const xy = convertOffset(shadow.x, shadow.y, degrees);
        normalized.push(shadow.prefix + xy[0] + shadow.xUnits + ' ' + xy[1] + shadow.yUnits + shadow.end);
    }
    return normalized.join(', ');
}
function convertOffset(x, y, degrees) {
    const radians = degrees * Math.PI / 180;
    const sin = Math.sin(radians);
    const cos = Math.cos(radians);
    return [
        Math.round((x * cos + y * sin) * 1000) / 1000,
        Math.round((-x * sin + y * cos) * 1000) / 1000
    ];
}
