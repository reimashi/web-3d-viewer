/**
 * Handle events
 */
class EventHandler {
    /**
     * Create a new event handler
     * @constructor
     * @param {Function} callback - Callback to be called when event occur
     */
    constructor(callback) {
        if (isNaN(EventHandler.idCount)) {
            EventHandler.idCount = 0;
        }

        if (EventHandler._isFunction(callback)) {
            this._cid = EventHandler.idCount++;
            this._callback = callback;
        }
        else {
            throw new Error("The callback provided is not a function");
        }
    }

    /**
     * Get the unique id of the event handler
     * @returns {number} Id of the event handler
     */
    get id() {
        return this._cid;
    }

    /**
     * Call the callback associated
     * @param args
     */
    call(...args) {
        this._callback(...args);
    }

    /**
     * Check if a variable is a function
     * @param obj - Variable to be tested
     * @returns {boolean} - True if is function
     * @private
     */
    static _isFunction(obj) {
        return typeof obj === 'function' || false;
    };
}

/**
 * Event subscriber, to subscribe callbacks to an event
 */
class EventSubscriber {
    constructor(listeners) {
        this.listeners = listeners;
    }

    /**
     * Subscribe a callback to an event
     * @param {String} label - Name of the event
     * @param {Function} callback - Callback to be executed
     * @returns {number} Id of the event handler
     */
    listen(label, callback) {
        this.listeners.has(label) || this.listeners.set(label, []);
        let eventHandler = new EventHandler(callback);
        this.listeners.get(label).push(eventHandler);
        return eventHandler.id;
    }

    /**
     * Remove the subscription to an event
     * @param {number} callbackId - Id of the callback to be unsubscribed
     * @returns {boolean} - True if the callback has been unsubscribed
     */
    remove(callbackId) {
        for (let label of this.listeners.keys()) {
            let labelIterators = this.listeners.get(label);

            for (let liIndex in labelIterators) {
                if (labelIterators[liIndex].id === callbackId) {
                    labelIterators.splice(liIndex, 1);
                    return true;
                }
            }
        }

        return false;
    }
}

/**
 * Event emitter who can be subscribed by callbacks
 */
class EventEmitter {
    constructor() {
        this.listeners = new Map();
        this.evSubscriber = new EventSubscriber(this.listeners);
    }

    /**
     * Get the event subscriber
     * @returns {EventSubscriber}
     */
    get subscriber() { return this.evSubscriber; }

    /**
     * Emit an event
     * @param {String} label - Name of the event
     * @param args - Arguments to be passed to callback
     * @returns {boolean} - True if any callback is called
     */
    emit(label, ...args) {
        let listeners = this.listeners.get(label);

        if (listeners && listeners.length) {
            listeners.forEach((handler) => {
                handler.call(...args);
            });
            return true;
        }

        return false;
    }
}

export default EventEmitter;