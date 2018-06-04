if ((typeof ResizeObserver) === "undefined") {
    /**
     * "Emulate" the ResizeObserver API, that emit a event when a DOM Element is resized.
     * (Only the last versions of Google Chrome has a native implementation)
     */
    class ResizeObserver {
        constructor(cb) {
            this.cb = cb;
            this.entries = [];
            window.addEventListener('resize', this.shot(this));
        }
        shot(context) { return () => { context.cb(context.entries); }; }
        observe(entry) { this.entries.push(entry); }
    }
}

export default ResizeObserver;