import { RefObject } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-orbitcontrols-ts";
import * as CANNON from "cannon-es";

export default class BlockScene {
  ref!: HTMLDivElement;
  public mounted: boolean = false;
  public readonly camera!: THREE.PerspectiveCamera;
  public readonly scene!: THREE.Scene;
  public canvas!: HTMLCanvasElement;
  public renderer: THREE.WebGLRenderer;
  public controls!: OrbitControls;
  private SCREEN_WIDTH = window.innerWidth;
  private SCREEN_HEIGHT = window.innerHeight;
  public clock = new THREE.Clock();
  private delta: number = 0;
  private world = new CANNON.World();
  private cannonObjs: any[] =[]
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
    this.camera.position.z = 50;
    this.camera.position.x = 50;

    window.addEventListener("resize", () => this.resize(), false);
  }

lightScene(){
  this.scene.add(new THREE.AxesHelper(5))

const light1 = new THREE.SpotLight()
light1.position.set(2.5, 5, 5)
light1.angle = Math.PI / 4
light1.penumbra = 0.5
light1.castShadow = true
light1.shadow.mapSize.width = 1024
light1.shadow.mapSize.height = 1024
light1.shadow.camera.near = 0.5
light1.shadow.camera.far = 20
this.scene.add(light1)

const light2 = new THREE.SpotLight()
light2.position.set(-2.5, 5, 5)
light2.angle = Math.PI / 4
light2.penumbra = 0.5
light2.castShadow = true
light2.shadow.mapSize.width = 1024
light2.shadow.mapSize.height = 1024
light2.shadow.camera.near = 0.5
light2.shadow.camera.far = 20
this.scene.add(light2)

}

  start(ref: HTMLDivElement | undefined) {
    console.log("BlockScene:start");
    this.mounted = true;
    if (ref) this.ref = ref;
    this.canvas = this.ref.appendChild(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera);
    this.controls.rotateSpeed = 1.0;
    // How far you can orbit vertically, upper and lower limits.
    this.controls.minPolarAngle = 0;
    this.controls.maxPolarAngle = Math.PI;

    // How far you can dolly in and out ( PerspectiveCamera only )
    this.controls.minDistance = 0;
    this.controls.maxDistance = Infinity;
    this.controls.zoomSpeed = 1.2;
    this.controls.keys = { LEFT: 65, RIGHT: 83, UP: 68, BOTTOM: 0 };
    this.controls.autoRotate = true;
    this.controls.enableZoom = true;

    // const geometry = new THREE.BoxGeometry(1, 1, 1);
    // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    // const cube = new THREE.Mesh(geometry, material);
    // this.scene.add(cube);

this.lightScene()
    const normalMaterial = new THREE.MeshNormalMaterial();
    const phongMaterial = new THREE.MeshPhongMaterial();

    this.world = new CANNON.World()
    this.world.gravity.set(0, -9.82, 0);

    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMesh = new THREE.Mesh(cubeGeometry, normalMaterial);
    cubeMesh.position.x = -3;
    cubeMesh.position.y = 5;
    cubeMesh.castShadow = true;
    this.scene.add(cubeMesh);

    const cubeShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
    const cubeBody = new CANNON.Body({ mass: 1 });
    cubeBody.addShape(cubeShape);
    cubeBody.position.x = cubeMesh.position.x;
    cubeBody.position.y = cubeMesh.position.y;
    cubeBody.position.z = cubeMesh.position.z;
    this.world.addBody(cubeBody);

    this.cannonObjs.push( {mesh: cubeMesh, body: cubeBody})

    // world.broadphase = new CANNON.NaiveBroadphase()
    // ;(world.solver as CANNON.GSSolver).iterations = 10
    // world.allowSleep = true
    // plane
    const planeGeometry = new THREE.PlaneGeometry(25, 25)
    const planeMesh = new THREE.Mesh(planeGeometry, phongMaterial)
    planeMesh.position.y = -0.01
    planeMesh.rotateX(-Math.PI / 2)
    planeMesh.receiveShadow = true
    this.scene.add(planeMesh)
    const planeShape = new CANNON.Plane()
    const planeBody = new CANNON.Body({ mass: 0 })
    planeBody.addShape(planeShape)
    planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    this.world.addBody(planeBody)

    this.animate();
  }

  stop() {
    console.log("BlockScene:stop");
    this.ref.removeChild(this.canvas);
    this.mounted = false;
  }

  animate() {
    this.delta = Math.min(this.clock.getDelta(), 0.1);
    this.world.step(this.delta);

    this.cannonObjs.forEach( obj => {
      const {mesh, body} = obj

      mesh.position.set(
        body.position.x,
        body.position.y,
        body.position.z
      )
      mesh.quaternion.set(
        body.quaternion.x,
        body.quaternion.y,
        body.quaternion.z,
        body.quaternion.w
      )
    })
    this.controls.update();
    
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
