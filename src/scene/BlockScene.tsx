import { RefObject } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-orbitcontrols-ts";
import * as CANNON from "cannon-es";
import { textChangeRangeIsUnchanged } from "typescript";
import ethImage from "../assets/ethereum_black_logo_sticker.jpg";

type Block = {
  transactions: any[];
};

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
  private cannonObjs: any[] = [];

  constructor() {
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearAlpha(0);
    this.camera = new THREE.PerspectiveCamera(
      30,
      this.SCREEN_WIDTH / this.SCREEN_HEIGHT,
      2,
      6000
    );
    this.camera.position.x = 100;
    this.camera.position.y = 20;
    // this.camera.position.z = 50;

    this.world = new CANNON.World();
    this.world.gravity.set(0, -60, 0);
    this.world.defaultContactMaterial.restitution = 0.4;

    // set up orbit
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

    this.lightScene();
    this.createFloor();

    window.addEventListener("resize", () => this.resize(), false);
  }

  lightScene() {
    // this.scene.add(new THREE.AxesHelper(5));
    
    const ambientLight = new THREE.AmbientLight("white", 0.3);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight("white", 1);
    mainLight.position.set(10, 10, 10);
    this.scene.add(mainLight);

    const light1 = new THREE.SpotLight();
    light1.position.set(20, 20, 20);
    light1.angle = Math.PI / 4;
    light1.penumbra = 0.5;
    light1.castShadow = true;
    light1.shadow.mapSize.width = 1024;
    light1.shadow.mapSize.height = 1024;
    light1.shadow.camera.near = 0.5;
    light1.shadow.camera.far = 20;
    // this.scene.add(light1);

    const light2 = new THREE.SpotLight();
    light2.position.set(-10, -10, 20);
    light2.angle = Math.PI / 4;
    light2.penumbra = 0.5;
    light2.castShadow = true;
    light2.shadow.mapSize.width = 1024;
    light2.shadow.mapSize.height = 1024;
    light2.shadow.camera.near = 0.5;
    light2.shadow.camera.far = 20;
    // this.scene.add(light2);
  }

  start(ref: HTMLDivElement | undefined) {
    console.log("BlockScene:start");
    this.mounted = true;
    if (ref) this.ref = ref;
    this.canvas = this.ref.appendChild(this.renderer.domElement);
    this.animate();
  }

  createFloor() {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(1000, 1000),
      new THREE.ShadowMaterial({
        opacity: 0.8,
      })
    );
    floor.receiveShadow = true;
    floor.position.y = -15;
    floor.quaternion.setFromAxisAngle(
      new THREE.Vector3(-1, 0, 0),
      Math.PI * 0.5
    );
    this.scene.add(floor);

    const floorBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Plane(),
    });
    floorBody.position.copy(
      new CANNON.Vec3(floor.position.x, floor.position.y, floor.position.z)
    );
    floorBody.quaternion.copy(
      new CANNON.Quaternion(
        floor.quaternion.x,
        floor.quaternion.y,
        floor.quaternion.z,
        floor.quaternion.w
      )
    );
    this.world.addBody(floorBody);
  }
  stop() {
    console.log("BlockScene:stop");
    this.ref.removeChild(this.canvas);
    this.mounted = false;
  }

  newBlock(block: Block, blockNumber: number) {
    if (!block) return;
    const dimentionLength = Math.floor(Math.cbrt(block.transactions.length));
    for (let i: any = 0; i < block.transactions.length; i++) {
      let x, y, z, mass;
      z = Math.floor(i / Math.pow(dimentionLength, 2));
      y =
        (Math.floor(i / dimentionLength) % dimentionLength) -
        dimentionLength / 2;
      x = (i % dimentionLength) - dimentionLength / 2;
      mass = Math.log(Number(block.transactions[i].value)) + 0.1;
      const newCube = this.makeCube(x, y, z, mass);

      // generate material based on transaction data
      // const material = this.getTokenMaterial(block.transactions[i]);
      // newCube.mesh.material = material;
      this.scene.add(newCube.mesh);
      this.world.addBody(newCube.body);
      this.cannonObjs.push({
        mesh: newCube.mesh,
        body: newCube.body,
        createdAt: Date.now(),
        removeAt: Date.now() + (0.5 + mass) * 1000,
      });
    }
  }

  getTokenMaterial(transaction: any): THREE.MeshBasicMaterial {
    let tokenImage = ethImage;
    let key = `material-${transaction.hash}`;
    if (transaction.from) tokenImage = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${transaction.from}/logo.png`
    // if (transaction.to)
    //   tokenImage = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${transaction.to}/logo.png`;
    const texture = new THREE.TextureLoader().load(tokenImage);
    let myMaterial = new THREE.MeshBasicMaterial();
    myMaterial.map = texture;
    myMaterial.color = new THREE.Color("#518ded");
    if (!transaction.fromToken && !transaction.toToken) myMaterial.wireframe = true
    return myMaterial;
  }

  makeCube(
    x: number,
    y: number,
    z: number,
    mass: number
  ): { mesh: THREE.Mesh; body: CANNON.Body } {
    // const normalMaterial = new THREE.MeshNormalMaterial();
    const phongMaterial = new THREE.MeshPhongMaterial();
    phongMaterial.color = new THREE.Color("#518ded");

    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMesh = new THREE.Mesh(cubeGeometry, phongMaterial);
    cubeMesh.position.x = x;
    cubeMesh.position.y = y + 40;
    cubeMesh.position.z = z;
    cubeMesh.castShadow = true;
    cubeMesh.receiveShadow = true;

    const cubeShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
    const cubeBody = new CANNON.Body({ mass: mass });
    cubeBody.addShape(cubeShape);
    cubeBody.position.x = cubeMesh.position.x;
    cubeBody.position.y = cubeMesh.position.y;
    cubeBody.position.z = cubeMesh.position.z;

    return { mesh: cubeMesh, body: cubeBody };
  }
  animate() {
    // this.delta = Math.min(this.clock.getDelta(), 0.1);
    // this.world.step(this.delta);
    this.world.fixedStep();
    const theMillis = Date.now();

    // remove if expired
    const expiredObjs = this.cannonObjs.filter((el) => el.removeAt < theMillis);
    expiredObjs.forEach((el) => {
      const { mesh, body } = el;
      this.scene.remove(mesh);
      this.world.removeBody(body);
    });

    this.cannonObjs.forEach((obj) => {
      const { mesh, body, removeAt } = obj;
      mesh.position.copy(body.position);
      mesh.quaternion.copy(body.quaternion);
    });
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
