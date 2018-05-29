let ResObserver = null;
if ((typeof ResizeObserver) === "undefined") {
    ResObserver = class ResizeObserver {
        constructor(cb) {
            this.cb = cb;
            this.entries = [];
            window.addEventListener('resize', this.shot(this));
        }
        shot(context) { return () => { context.cb(context.entries); }; }
        observe(entry) { this.entries.push(entry); }
    }
}
else {
    ResObserver = ResizeObserver;
}

export default ResObserver;