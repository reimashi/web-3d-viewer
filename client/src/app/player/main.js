import ResObserver from 'resize-observer';
import {
    AmbientLight,
    Loader,
    LoadingManager,
    Mesh,
    PerspectiveCamera,
    PointLight,
    Scene,
    WebGLRenderer,
} from 'three';

/**
 * 3D Model player over threejs and webGl
 */
class Player3D {
    /**
     * Create a 3D Model Player inside a DOM object
     * @constructor
     * @param {Element} domElement - Element within which the player will be created
     */
    constructor(domElement) {
        this.container = document.createElement('div');
        domElement.appendChild(this.container);

        this.fps = 25;

        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;

        this.center = {
            x: this.width / 2,
            y: this.height / 2
        };
        this.mouse = { x: this.center.x, y: this.center.y };

        this.camera = new PerspectiveCamera(45, this.width / this.height, 1, 2000);
        this.camera.position.z = 250;

        this.scene = new Scene();

        let ambientLight = new AmbientLight(0xcccccc, 0.4);
        let pointLight = new PointLight(0xffffff, 0.8);
        this.scene.add(ambientLight);
        this.camera.add(pointLight);

        this.scene.add(this.camera);

        this.renderer = new WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);

        this.container.appendChild(this.renderer.domElement);

        document.addEventListener('mousemove', Player3D.onDocumentMouseMove(this), false);
        this.resizeObserver = new ResObserver(Player3D.onElementResize(this));
        this.resizeObserver.observe(this.container);
    }

    /**
     * Load a OBJ model inside player
     * @param {String} url - Server url from which load OBJ model
     */
    loadObj(url) {
        let context = this;

        let manager = new LoadingManager();
        manager.onProgress = console.log;

        let loader = new Loader.OBJLoader(manager);
        loader.load(url, function (object) {
            object.traverse( function (child) {
                if (child instanceof Mesh) {
                    child.material.map = texture;
                }
            } );
            object.position.y = - 95;
            context.scene.add(object);
        }, onProgress, onError );
    }

    /**
     * Load a OBJ model inside player and applies MTL materials
     * @param {String} objUrl - Server url from which load OBJ model
     * @param {String} mtlUrl - Server url from which load MTL materials
     */
    loadMTL(objUrl, mtlUrl) {
        let context = this;

        let manager = new LoadingManager();
        manager.onProgress = console.log;

        let loader = new Loader.MTLLoader();
        loader.load(mtlUrl, function (materials) {
            materials.preload();
            new Loader.OBJLoader()
                .setMaterials(materials)
                .load(objUrl, function (object) {
                    object.position.y = - 95;
                    context.scene.add(object);
                }, onProgress, onError);
        } );
    }

    /**
     * Event fired when DOM element is resized
     * @param {Player3D} context - Instance of the player
     * @returns {Function}
     */
    static onElementResize(context) { return () => {
        context.width = context.container.offsetWidth;
        context.height = context.container.offsetHeight;

        context.center = {
            x: context.width / 2,
            y: context.height / 2
        };

        context.camera.aspect = context.width / context.height;
        context.camera.updateProjectionMatrix();

        context.renderer.setSize(context.width, context.height);
    }}

    /**
     * Event fired when mouse is moved
     * @param {Player3D} context - Instance of the player
     * @returns {Function}
     */
    static onDocumentMouseMove(context) { return (event) => {
        context.mouse = {
            x: (event.clientX - context.center.x) / 2,
            y: (event.clientY - context.center.y) / 2,
        };
    }}

    /**
     * Start the player
     */
    start() { Player3D._runContext(this)(); }

    /**
     * Internal render logic
     * @param {Player3D} context - Instance of the player
     * @returns {Function}
     * @private
     */
    static _runContext(context) { return () => {
        // Set next frame execution
        requestAnimationFrame(() => { setTimeout(Player3D._runContext(context), 1000 / context.fps); });

        // Render logic
        context.camera.position.x += (context.mouse.x - context.camera.position.x) * .05;
        context.camera.position.y += (-context.mouse.y - context.camera.position.y) * .05;
        context.camera.lookAt(context.scene.position);
        context.renderer.render(context.scene, context.camera);
    };}
}

export default Player3D;