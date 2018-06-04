/**
 * @author Eberhard Graether / http://egraether.com/
 * @author Mark Lundin    / http://mark-lundin.com
 * @author Simone Manini / http://daron1337.github.io
 * @author Luca Antiga    / http://lantiga.github.io
 * @author tokkenno (Port to ES6)
 */

import {
    Vector3, Vector2, Quaternion, EventDispatcher
} from "three";

class TrackballControls extends EventDispatcher {
    /**
     * @constructor
     * @param object
     * @param {Element} domElement
     */
    constructor(object, domElement) {
        super();

        this._STATE = {NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_ZOOM_PAN: 4};

        this.object = object;
        this.domElement = (domElement !== undefined) ? domElement : document;

        // API

        this.enabled = true;

        this.screen = {left: 0, top: 0, width: 0, height: 0};

        this.rotateSpeed = 1.0;
        this.zoomSpeed = 1.2;
        this.panSpeed = 0.3;

        this.noRotate = false;
        this.noZoom = false;
        this.noPan = false;

        this.staticMoving = false;
        this.dynamicDampingFactor = 0.2;

        this.minDistance = 0;
        this.maxDistance = Infinity;

        this.keys = [65 /*A*/, 83 /*S*/, 68 /*D*/];

        // internals

        this.target = new Vector3();

        this._EPS = 0.000001;

        this._lastPosition = new Vector3();

        this._state = this._STATE.NONE;
        this._prevState = this._STATE.NONE;
        this._eye = new Vector3();

        this._movePrev = new Vector2();
        this._moveCurr = new Vector2();

        this._lastAxis = new Vector3();
        this._lastAngle = 0;

        this._zoomStart = new Vector2();
        this._zoomEnd = new Vector2();

        this._touchZoomDistanceStart = 0;
        this._touchZoomDistanceEnd = 0;

        this._panStart = new Vector2();
        this._panEnd = new Vector2();

        // for reset
        this.target0 = this.target.clone();
        this.position0 = this.object.position.clone();
        this.up0 = this.object.up.clone();

        // events
        this._changeEvent = {type: 'change'};
        this._startEvent = {type: 'start'};
        this._endEvent = {type: 'end'};

        // event listeners
        this._contextMenuListener = TrackballControls.contextMenu(this);
        this.domElement.addEventListener('contextmenu', this.contextmenu, false);

        this._mouseDownListener = TrackballControls.mouseDown(this);
        this._mouseUpListener = TrackballControls.mouseUp(this);
        this.domElement.addEventListener('mousedown', this._mouseDownListener, false);
        this._mouseMoveListener = TrackballControls.mouseMove(this);
        this._mouseWheelListener = TrackballControls.mouseWheel(this);
        this.domElement.addEventListener('wheel', this._mouseWheelListener, false);

        this._touchStartListener = TrackballControls.touchStart(this);
        this.domElement.addEventListener('touchstart', this._touchStartListener, false);
        this._touchEndListener = TrackballControls.touchEnd(this);
        this.domElement.addEventListener('touchend', this._touchEndListener, false);
        this._touchMoveListener = TrackballControls.touchMove(this);
        this.domElement.addEventListener('touchmove', this._touchMoveListener, false);

        this._keyDownListener = TrackballControls.keyDown(this);
        window.addEventListener('keydown', this._keyDownListener, false);
        this._keyUpListener = TrackballControls.keyUp(this);
        window.addEventListener('keyup', this._keyUpListener, false);

        this.handleResize();

        // force an update at start
        this.update();
    }

    handleResize() {
        if (this.domElement === document) {
            this.screen.left = 0;
            this.screen.top = 0;
            this.screen.width = window.innerWidth;
            this.screen.height = window.innerHeight;
        } else {
            let box = this.domElement.getBoundingClientRect();
            // adjustments come from similar code in the jquery offset() function
            let d = this.domElement.ownerDocument.documentElement;
            this.screen.left = box.left + window.pageXOffset - d.clientLeft;
            this.screen.top = box.top + window.pageYOffset - d.clientTop;
            this.screen.width = box.width;
            this.screen.height = box.height;
        }
    };

    handleEvent(event) {
        if (typeof this[event.type] === 'function') {
            this[event.type](event);
        }
    };

    /**
     *
     * @param {TrackballControls} context
     * @param {number} pageX
     * @param {number} pageY
     * @returns {Vector2}
     * @private
     */
    static _getMouseOnScreen(context, pageX, pageY) {
        let vector = new Vector2();
        vector.set(
            (pageX - context.screen.left) / context.screen.width,
            (pageY - context.screen.top) / context.screen.height
        );

        return vector;
    }

    /**
     *
     * @param {TrackballControls} context
     * @param {number} pageX
     * @param {number} pageY
     * @returns {Vector2}
     * @private
     */
    static _getMouseOnCircle(context, pageX, pageY) {
        let vector = new Vector2();
        vector.set(
            ((pageX - context.screen.width * 0.5 - context.screen.left) / (context.screen.width * 0.5)),
            ((context.screen.height + 2 * (context.screen.top - pageY)) / context.screen.width) // screen.width intentional
        );

        return vector;
    };

    rotateCamera() {
        let axis = new Vector3(),
            quaternion = new Quaternion(),
            eyeDirection = new Vector3(),
            objectUpDirection = new Vector3(),
            objectSidewaysDirection = new Vector3(),
            moveDirection = new Vector3(),
            angle;

        moveDirection.set(this._moveCurr.x - this._movePrev.x, this._moveCurr.y - this._movePrev.y, 0);
        angle = moveDirection.length();

        if (angle) {

            this._eye.copy(this.object.position).sub(this.target);

            eyeDirection.copy(this._eye).normalize();
            objectUpDirection.copy(this.object.up).normalize();
            objectSidewaysDirection.crossVectors(objectUpDirection, eyeDirection).normalize();

            objectUpDirection.setLength(this._moveCurr.y - this._movePrev.y);
            objectSidewaysDirection.setLength(this._moveCurr.x - this._movePrev.x);

            moveDirection.copy(objectUpDirection.add(objectSidewaysDirection));

            axis.crossVectors(moveDirection, this._eye).normalize();

            angle *= this.rotateSpeed;
            quaternion.setFromAxisAngle(axis, angle);

            this._eye.applyQuaternion(quaternion);
            this.object.up.applyQuaternion(quaternion);

            this._lastAxis.copy(axis);
            this._lastAngle = angle;

        } else if (!this.staticMoving && this._lastAngle) {

            this._lastAngle *= Math.sqrt(1.0 - this.dynamicDampingFactor);
            this._eye.copy(this.object.position).sub(this.target);
            quaternion.setFromAxisAngle(this._lastAxis, this._lastAngle);
            this._eye.applyQuaternion(quaternion);
            this.object.up.applyQuaternion(quaternion);

        }

        this._movePrev.copy(this._moveCurr);

    };

    zoomCamera() {
        let factor;

        if (this._state === this._STATE.TOUCH_ZOOM_PAN) {
            factor = this._touchZoomDistanceStart / this._touchZoomDistanceEnd;
            this._touchZoomDistanceStart = this._touchZoomDistanceEnd;
            this._eye.multiplyScalar(factor);
        } else {
            factor = 1.0 + (this._zoomEnd.y - this._zoomStart.y) * this.zoomSpeed;

            if (factor !== 1.0 && factor > 0.0) {
                this._eye.multiplyScalar(factor);
            }

            if (this.staticMoving) {
                this._zoomStart.copy(this._zoomEnd);
            } else {
                this._zoomStart.y += (this._zoomEnd.y - this._zoomStart.y) * this.dynamicDampingFactor;
            }
        }
    };

    panCamera() {
        let mouseChange = new Vector2(),
            objectUp = new Vector3(),
            pan = new Vector3();

        mouseChange.copy(this._panEnd).sub(this._panStart);

        if (mouseChange.lengthSq()) {
            mouseChange.multiplyScalar(this._eye.length() * this.panSpeed);

            pan.copy(this._eye).cross(this.object.up).setLength(mouseChange.x);
            pan.add(objectUp.copy(this.object.up).setLength(mouseChange.y));

            this.object.position.add(pan);
            this.target.add(pan);

            if (this.staticMoving) {
                this._panStart.copy(this._panEnd);
            } else {
                this._panStart.add(mouseChange.subVectors(this._panEnd, this._panStart).multiplyScalar(this.dynamicDampingFactor));
            }
        }
    };

    checkDistances() {
        if (!this.noZoom || !this.noPan) {
            if (this._eye.lengthSq() > this.maxDistance * this.maxDistance) {
                this.object.position.addVectors(this.target, this._eye.setLength(this.maxDistance));
                this._zoomStart.copy(this._zoomEnd);
            }

            if (this._eye.lengthSq() < this.minDistance * this.minDistance) {
                this.object.position.addVectors(this.target, this._eye.setLength(this.minDistance));
                this._zoomStart.copy(this._zoomEnd);
            }
        }
    };

    update() {
        this._eye.subVectors(this.object.position, this.target);

        if (!this.noRotate) {
            this.rotateCamera();
        }

        if (!this.noZoom) {
            this.zoomCamera();
        }

        if (!this.noPan) {
            this.panCamera();
        }

        this.object.position.addVectors(this.target, this._eye);

        this.checkDistances();

        this.object.lookAt(this.target);

        if (this._lastPosition.distanceToSquared(this.object.position) > this._EPS) {
            this.dispatchEvent(this._changeEvent);
            this._lastPosition.copy(this.object.position);
        }
    };

    reset() {
        this._state = this._STATE.NONE;
        this._prevState = this._STATE.NONE;

        this.target.copy(this.target0);
        this.object.position.copy(this.position0);
        this.object.up.copy(this.up0);

        this._eye.subVectors(this.object.position, this.target);

        this.object.lookAt(this.target);

        this.dispatchEvent(this._changeEvent);

        this._lastPosition.copy(this.object.position);
    };

    // listeners

    /**
     *
     * @param {TrackballControls} context
     * @returns {Function}
     */
    static keyDown(context) {
        return (event) => {
            if (context.enabled === false) return;

            window.removeEventListener('keydown', context._keyDownListener);

            context._prevState = context._state;

            if (context._state === context._STATE.NONE) {
                if (event.keyCode === context.keys[context._STATE.ROTATE] && !context.noRotate) {
                    context._state = context._STATE.ROTATE;
                } else if (event.keyCode === context.keys[context._STATE.ZOOM] && !context.noZoom) {
                    context._state = context._STATE.ZOOM;
                } else if (event.keyCode === context.keys[context._STATE.PAN] && !context.noPan) {
                    context._state = context._STATE.PAN;
                }
            }
        }
    }

    /**
     *
     * @param {TrackballControls} context
     * @returns {Function}
     */
    static keyUp(context) {
        return (event) => {
            if (context.enabled === false) return;

            context._state = context._prevState;
            window.addEventListener('keydown', context._keyDownListener, false);
        }
    }

    /**
     *
     * @param {TrackballControls} context
     * @returns {Function}
     */
    static mouseDown(context) {
        return (event) => {
            if (context.enabled === false) return;

            event.preventDefault();
            event.stopPropagation();

            if (context._state === context._STATE.NONE) {
                context._state = event.button;
            }

            if (context._state === context._STATE.ROTATE && !context.noRotate) {
                context._moveCurr.copy(TrackballControls._getMouseOnCircle(context, event.pageX, event.pageY));
                context._movePrev.copy(context._moveCurr);
            } else if (context._state === context._STATE.ZOOM && !context.noZoom) {
                context._zoomStart.copy(TrackballControls._getMouseOnScreen(context, event.pageX, event.pageY));
                context._zoomEnd.copy(context._zoomStart);
            } else if (context._state === context._STATE.PAN && !context.noPan) {
                context._panStart.copy(TrackballControls._getMouseOnScreen(context, event.pageX, event.pageY));
                context._panEnd.copy(context._panStart);
            }

            document.addEventListener('mousemove', context._mouseMoveListener, false);
            document.addEventListener('mouseup', context._mouseUpListener, false);

            context.dispatchEvent(context._startEvent);
        }
    }

    /**
     *
     * @param {TrackballControls} context
     * @returns {Function}
     */
    static mouseMove(context) {
        return (event) => {
            if (context.enabled === false) return;

            event.preventDefault();
            event.stopPropagation();

            if (context._state === context._STATE.ROTATE && !context.noRotate) {
                context._movePrev.copy(context._moveCurr);
                context._moveCurr.copy(TrackballControls._getMouseOnCircle(context, event.pageX, event.pageY));
            } else if (context._state === context._STATE.ZOOM && !context.noZoom) {
                context._zoomEnd.copy(TrackballControls._getMouseOnScreen(context, event.pageX, event.pageY));
            } else if (context._state === context._STATE.PAN && !context.noPan) {
                context._panEnd.copy(TrackballControls._getMouseOnScreen(context, event.pageX, event.pageY));
            }
        }
    }

    /**
     *
     * @param {TrackballControls} context
     * @returns {Function}
     */
    static mouseUp(context) {
        return (event) => {
            if (context.enabled === false) return;

            event.preventDefault();
            event.stopPropagation();

            context._state = context._STATE.NONE;

            document.removeEventListener('mousemove', context._mouseMoveListener);
            document.removeEventListener('mouseup', context._mouseUpListener);
            context.dispatchEvent(context._endEvent);
        }
    }

    /**
     *
     * @param {TrackballControls} context
     * @returns {Function}
     */
    static mouseWheel(context) {
        return (event) => {
            if (context.enabled === false) return;
            if (context.noZoom === true) return;

            event.preventDefault();
            event.stopPropagation();

            switch (event.deltaMode) {
                case 2:
                    // Zoom in pages
                    context._zoomStart.y -= event.deltaY * 0.025;
                    break;

                case 1:
                    // Zoom in lines
                    context._zoomStart.y -= event.deltaY * 0.01;
                    break;

                default:
                    // undefined, 0, assume pixels
                    context._zoomStart.y -= event.deltaY * 0.00025;
                    break;
            }

            context.dispatchEvent(context._startEvent);
            context.dispatchEvent(context._endEvent);
        }
    }

    /**
     *
     * @param {TrackballControls} context
     * @returns {Function}
     */
    static touchStart(context) {
        return (event) => {
            if (context.enabled === false) return;

            switch (event.touches.length) {
                case 1:
                    context._state = context._STATE.TOUCH_ROTATE;
                    context._moveCurr.copy(TrackballControls._getMouseOnCircle(context, event.touches[0].pageX, event.touches[0].pageY));
                    context._movePrev.copy(context._moveCurr);
                    break;

                default: // 2 or more
                    context._state = context._STATE.TOUCH_ZOOM_PAN;
                    let dx = event.touches[0].pageX - event.touches[1].pageX;
                    let dy = event.touches[0].pageY - event.touches[1].pageY;
                    context._touchZoomDistanceEnd = context._touchZoomDistanceStart = Math.sqrt(dx * dx + dy * dy);

                    let x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
                    let y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
                    context._panStart.copy(TrackballControls._getMouseOnScreen(context, x, y));
                    context._panEnd.copy(context._panStart);
                    break;
            }

            context.dispatchEvent(context._startEvent);
        }
    }

    /**
     *
     * @param {TrackballControls} context
     * @returns {Function}
     */
    static touchMove(context) {
        return (event) => {
            if (context.enabled === false) return;

            event.preventDefault();
            event.stopPropagation();

            switch (event.touches.length) {
                case 1:
                    context._movePrev.copy(context._moveCurr);
                    context._moveCurr.copy(TrackballControls._getMouseOnCircle(context, event.touches[0].pageX, event.touches[0].pageY));
                    break;

                default: // 2 or more
                    let dx = event.touches[0].pageX - event.touches[1].pageX;
                    let dy = event.touches[0].pageY - event.touches[1].pageY;
                    context._touchZoomDistanceEnd = Math.sqrt(dx * dx + dy * dy);

                    let x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
                    let y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
                    context._panEnd.copy(TrackballControls._getMouseOnScreen(context, x, y));
                    break;
            }
        }
    }

    /**
     *
     * @param {TrackballControls} context
     * @returns {Function}
     */
    static touchEnd(context) {
        return (event) => {
            if (context.enabled === false) return;

            switch (event.touches.length) {
                case 0:
                    context._state = context._STATE.NONE;
                    break;

                case 1:
                    context._state = context._STATE.TOUCH_ROTATE;
                    context._moveCurr.copy(TrackballControls._getMouseOnCircle(context, event.touches[0].pageX, event.touches[0].pageY));
                    context._movePrev.copy(context._moveCurr);
                    break;
            }

            context.dispatchEvent(context._endEvent);
        }
    }

    /**
     *
     * @param {TrackballControls} context
     * @returns {Function}
     */
    static contextMenu(context) {
        return (event) => {
            if (context.enabled === false) return;
            event.preventDefault();
        }
    }

    dispose() {
        this.domElement.removeEventListener('contextmenu', this._contextMenuListener, false);
        this.domElement.removeEventListener('mousedown', this._mouseDownListener, false);
        this.domElement.removeEventListener('wheel', this._mouseWheelListener, false);

        this.domElement.removeEventListener('touchstart', this._touchStartListener, false);
        this.domElement.removeEventListener('touchend', this._touchEndListener, false);
        this.domElement.removeEventListener('touchmove', this._touchMoveListener, false);

        document.removeEventListener('mousemove', this._mouseMoveListener, false);
        document.removeEventListener('mouseup', this._mouseUpListener, false);

        window.removeEventListener('keydown', this._keyDownListener, false);
        window.removeEventListener('keyup', this._keyUpListener, false);
    };
}

export default TrackballControls;