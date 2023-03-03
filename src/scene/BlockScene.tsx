import { RefObject } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-orbitcontrols-ts";

export default class BlockScene {
  ref!: HTMLDivElement;
  public mounted: boolean = false;
  public readonly camera!: THREE.Camera;
  public readonly scene!: THREE.Scene;
  public canvas!: HTMLCanvasElement;
  public renderer: THREE.WebGLRenderer;
  public controls!: OrbitControls;
  private SCREEN_WIDTH = window.innerWidth;
  private SCREEN_HEIGHT = window.innerHeight;

  constructor() {
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera = new THREE.PerspectiveCamera(
      40,
      this.SCREEN_WIDTH / this.SCREEN_HEIGHT,
      2,
      6000
    );

    // window.addEventListener("resize", this.resize, false);
  }

  start(ref: HTMLDivElement | undefined) {
    console.log("BlockScene:start");
    this.mounted = true;
    if (ref) this.ref = ref;
    // debugger
    // document.body.appendChild( this.renderer.domElement )
    this.canvas = this.ref.appendChild(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera);
    this.controls.rotateSpeed = 1.0;
    // How far you can orbit vertically, upper and lower limits.
    this.controls.minPolarAngle = 0;
    this.controls.maxPolarAngle = Math.PI;

    // How far you can dolly in and out ( PerspectiveCamera only )
    this.controls.minDistance = 0;
    this.controls.maxDistance = Infinity;
    // this.controls.zoomSpeed = 1.2;
    // this.controls.panSpeed = 0.8;
    // this.controls.keys = { LEFT: "65", RIGHT: "83", UP: " 68", BOTTOM: "" };

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);
    this.camera.position.z = 5;
    this.animate();
  }

  stop() {
    console.log("BlockScene:stop");
    this.ref.removeChild(this.canvas);
    this.mounted = false;
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }
  resize() {
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // this.camera.updateProjectionMatrix();
  }
}
