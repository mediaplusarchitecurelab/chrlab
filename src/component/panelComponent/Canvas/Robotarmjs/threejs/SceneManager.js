import * as THREE from '../../threejs/src/Three.js';
//import SceneSubject from './SceneSubject';
import GeneralLights from './GeneralLights';
import * as dat from 'dat.gui';
import { OBJLoader } from '../../threejs/examples/jsm/loaders/OBJLoader.js';

import { EffectComposer } from '../../threejs/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../../threejs/examples/jsm/postprocessing/RenderPass.js';
import { FilmPass } from '../../threejs/examples/jsm/postprocessing/FilmPass.js';
import { BloomPass } from '../../threejs/examples/jsm/postprocessing/BloomPass.js';

import { ShaderPass } from '../../threejs/examples/jsm/postprocessing/ShaderPass.js';
import { SobelOperatorShader } from '../../threejs/examples/jsm/shaders/SobelOperatorShader.js';
import { OutlinePass } from '../../threejs/examples/jsm/postprocessing/OutlinePass.js';

import $ from 'jquery';

const OrbitControls = require('three-orbit-controls')(THREE);
const textureLoader = new THREE.TextureLoader();

class RobotComponent{
  constructor(state, scene){
    this.state = state;
    this.scene = scene;
    this.buildComponents();
  }
  buildComponents(){ // including joint and object

    let geo = new THREE.BoxBufferGeometry( this.state.size.x, this.state.size.y, this.state.size.z );
    let mat = new THREE.MeshBasicMaterial( { color: 0xffff00, transparent: true, opacity: 0.6, depthWrite: false} );
    let mesh = new THREE.Mesh( geo, mat );
    let ml=[];
    let ll=[];
    geo.computeBoundingBox ();
    geo.boundingBox.getSize(this.state.size);
    //console.log(this.state.originWorldPoint);
    this.state.originWorldPoint.x-= this.state.size.x*this.state.originScale.x;
    this.state.originWorldPoint.y-=this.state.size.y*this.state.originScale.y;
    this.state.originWorldPoint.z-=this.state.size.z*this.state.originScale.z;
    //console.log(this.state.originWorldPoint);
    mesh.position.add(this.state.originWorldPoint);
    mesh.castShadow = mesh.receiveShadow = true;
    this.scene.add(mesh);
    ml.push(mesh);

    // build joint
    let sm = Math.min(...this.state.size.toArray());
    let jgeo = new THREE.CylinderBufferGeometry( sm*0.5, sm*0.5, sm*0.5, 16 );
    let jmat = new THREE.MeshBasicMaterial( { color: 0x0000ff, depthWrite: false} );
    let jmesh = new THREE.Mesh( jgeo, jmat );
    jmesh.castShadow = jmesh.receiveShadow = true;

    if (this.state.jointVector.equals(new THREE.Vector3(0,0,1))) {jmesh.geometry.rotateX(90 * (Math.PI/180));}
    else if (this.state.jointVector.equals(new THREE.Vector3(0,0,-1))) {jmesh.geometry.rotateX(-90 * (Math.PI/180));}
    else if (this.state.jointVector.equals(new THREE.Vector3(1,0,0))) {jmesh.geometry.rotateZ(90 * (Math.PI/180));}
    else if (this.state.jointVector.equals(new THREE.Vector3(-1,0,0))) {jmesh.geometry.rotateZ(-90 * (Math.PI/180));}

    let jwp = this.state.originWorldPoint.clone().add(this.state.size.clone().multiply(this.state.jointScale));
    jmesh.position.add(jwp);
    this.scene.add(jmesh);
    ml.push(jmesh);
    this.state.meshList=ml;

    this.state.jointWorldPoint = jwp;

    let arrowHelper = new THREE.ArrowHelper( this.state.jointVector, this.state.jointWorldPoint, 250, 0xff0000);   
    this.scene.add(arrowHelper);

    ll.push(arrowHelper);
    this.state.lineList=ll;

    arrowHelper.userData= {Component: this};
  }
  rotate(a){
    //console.log(a);
    let q = new THREE.Quaternion();
    q.setFromAxisAngle(this.state.jointVector.normalize(), a-(this.state.angle* Math.PI /180.0));
    //let tempGroup = new THREE.Group();
    this.state.meshList.forEach((v)=>{
        //tempGroup.add(v);
        v.applyQuaternion( q );
        v.position.sub( this.state.jointWorldPoint );
        v.position.applyQuaternion( q );
        v.position.add( this.state.jointWorldPoint );
    });
    //console.log(this.state.jointVector);
    this.state.lineList.forEach((v,i)=>{
        //tempGroup.add(v);
        v.applyQuaternion( q );
        v.position.sub( this.state.jointWorldPoint );
        v.position.applyQuaternion( q );
        v.position.add( this.state.jointWorldPoint );

        if (v.userData.Component.state.aid > this.state.aid){
            v.userData.Component.state.jointWorldPoint = v.position.clone();
            v.userData.Component.state.jointVector.applyQuaternion(q).clone();
        }
    });

    this.state.lineList.forEach((v)=>{
    });

    this.state.angle=a*180.0/Math.PI;
  }
}
const arrows = {};
function addArrow(name, from, to, color = 0xffff00, length = 10) {
    if (arrows.hasOwnProperty(name)) {
      //window.debug.scene.remove(arrows[name]);
    }
    //if (!window.debug.show) return
    const toPoint = new THREE.Vector3(to[0], to[1], to[2]);
    const origin = new THREE.Vector3(from[0], from[1], from[2]);
    // length = length || toPoint.sub(origin).length()
    // toPoint.normalize()
    arrows[name] = new THREE.ArrowHelper(toPoint.sub(origin).normalize(), origin, length, color, 2, 1);
    //window.debug.scene.add(arrows[name]);
  }

  function addVectorArrow(name, from, vector, color, length) {
    addArrow(name, from, [from[0] + vector[0], from[1] + vector[1], from[2] + vector[2]], color, length);
  }
  const spheres = {};

  function addSphere(name, position, color = 0xffff00, diameter = 30) {
    if (spheres.hasOwnProperty(name)) {
      //window.debug.scene.remove(spheres[name]);
    }
    //if (!window.debug.show) return;

    const geometry = new THREE.SphereGeometry(diameter, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color,
    });

    spheres[name] = new THREE.Mesh(geometry, material);
    spheres[name].position.set(position[0], position[1], position[2]);
    //window.debug.scene.add(spheres[name]);
  }

// initiate
export default canvas => {
    // objects
    var robotmap, target, ikTask;
    var stepValue = 0;
    var tempstartTarget;
    const UPPERSTEP = 200;
    var request;
    var loader;
    var parmfont;
    const ssnodeurl = 'https://spreadsheets.google.com/feeds/list/1l3DvxzJxmCPyk3TruBMCC_YXWEvRJXnkwaKcx41IoKA/1/public/values?alt=json';
    const sscrvurl = 'https://spreadsheets.google.com/feeds/list/1l3DvxzJxmCPyk3TruBMCC_YXWEvRJXnkwaKcx41IoKA/2/public/values?alt=json';
    const exeurl = 'https://script.google.com/macros/s/AKfycbyYhxPfFDvS1nPTuDg9n5SZLYwbzaD6zqVbBkVJzzEWDoWjW6B8/exec';
    const ssnodeurledit = 'https://docs.google.com/spreadsheets/d/1l3DvxzJxmCPyk3TruBMCC_YXWEvRJXnkwaKcx41IoKA/edit?usp=sharing';

    // abb irb2600 setting
    const abbirb2600Config = {
            jointLimit:
            {'a0':[-180.0,180.0],
             'a1':[-95.0-90,155.0-90],
             'a2':[-180.0+90,75.0+90],
             'a3':[-175.0,175.0],
             'a4':[-120.0,120.0],
             'a5':[-191.0,191.0]
            },
            r0: 445, 
            r1: 700,
            r2: 0,
            r3: 786,
            r4: 0,
            r5: 0,
            p0:new THREE.Vector3(0,0,0),
            p1:new THREE.Vector3(0,445,-150)
        }
    //var geos = new THREE.Group();
    //var geoVmap, geoCrvmap;

    var geoVmap =[];
    var geoCmap=[];  
    var geo, geoPts, geoLines;
    var backgroundcube, text;
    // as Three.Group = children[0] = frontface / children[1] = backface
    var geoSelected;
    var geoAll =[];
    var geoFinished =[];
    var geoPossible =[];
    var geoLocked =[];
    var cLocked =[];
    // material
    var t1, t2, uniforms;
    var matColor, matFinColor, matPosColor, matShader, matWireframe, matGradient, matShaderSub, matHidden, matLine;
    var matFinished, matFinishedBack, matPossible, matLocked, matPossibleBack, matFade, matFadeBack;
    var matFinishedArray, matPossibleArray, matFadeArray;
    var textloader = new THREE.FontLoader();
    // renderer
    var composer, outlinePass;
    // control
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    var screen = new THREE.Vector2();
    var pieceSelected = false;
    var textFinished ='';
    var texetAll='';

    var nodeSize = 0.6;

    var pipeDegree = 20; // default as 64
    var pipeSize = 0.3;
    var pipeRacial = 4;
    var pipeClose = false;

    // GUI
    var gui, guiData, shading;
    var tagratio=2.0;
    var tagdist=1.0;
    const clock = new THREE.Clock();
    const screenDimensions = {
        width: canvas.width,
        height: canvas.height,
        halfwidth: canvas.width*0.5,
        halfheight: canvas.height*0.5
    }
    const pannelSize = {
        width: canvas.width,
        height: canvas.height,
        halfwidth: canvas.width*0.5,
        halfheight: canvas.height*0.5
    }
    var displayFolder, teamCallbackFolder, jointFolder, targetFolder, stepFolder;
    var targetParams;
    // ==== ROBOT ====
    
    const defaultstate={
        aid:0,
        originWorldPoint: new THREE.Vector3(0,0,0),
        originScale: new THREE.Vector3(0,-0.5,0), // multiples with size, center as zero
        size: new THREE.Vector3(),
        jointWorldPoint: new THREE.Vector3(0,0,0),
        jointsize: new THREE.Vector3(),
        jointScale: new THREE.Vector3(0,-0.5,0), // multiples with size, center as zero
        jointVector: new THREE.Vector3(0,1,0),
        subjointScale: new THREE.Vector3(0,0.5,1), // multiples with size, center as zero
        subjointVector: new THREE.Vector3(-1,0,0),    
        meshList: [],
        lineList: [],
        //submeshGroup: new THREE.Group(),
        angle:0
    };
    
    var robotstate;
    var geo;
    // build
    const scene = buildScene();
    const camera = buildCamera(screenDimensions);
    const renderer = buildRender(screenDimensions);
    
    const controls = new OrbitControls( camera, renderer.domElement );
    controls.target.set( 0, 1, 0 );
    controls.update();

    const customContainer = document.getElementById('canvas-gui-container');
    const lights = GeneralLights(scene);
    createSceneSubjects(scene, uniforms);

    // textture
    textureLoader.setPath( './assets/textures/sprites/' ).load( 'spark1.png', (tex1)=>{

        t1 = tex1;
        uniforms ={pointTexture: { value: t1 }};

    },( xhr1 ) =>{
        console.log( (xhr1.loaded / xhr1.total * 100) + '% loaded' );
    },( xhr1 ) =>{
        console.log( 'An error happened' );
    });

    function buildScene() {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#a0a0a0');
        scene.fog = new THREE.Fog( 0xa0a0a0, 10, 9000 );
        return scene;
    }

    function buildRender({ width, height }) {
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
        const DPR = window.devicePixelRatio ? window.devicePixelRatio : 1;
        renderer.shadowMap.enabled = true;
        renderer.localClippingEnabled = false;
        renderer.setPixelRatio(DPR);
        renderer.setSize(width, height);
        renderer.autoClear = false;
        renderer.toneMapping = THREE.ReinhardToneMapping;

        // post
        
        composer = new EffectComposer( renderer );

        var renderPass = new RenderPass( scene, camera );
        composer.addPass( renderPass );
        
        outlinePass = new OutlinePass( new THREE.Vector2( width, height ), scene, camera );

        outlinePass.edgeStrength = 2.0
        outlinePass.edgeGlow = 0.0;
        outlinePass.edgeThickness = 0.7;
        outlinePass.pulsePeriod = 0;
        outlinePass.visibleEdgeColor.set( '#ff0000' );
        outlinePass.hiddenEdgeColor.set( '#190a05' );

        composer.addPass( outlinePass );
      
        return renderer;
    }

    // input function    

    function buildCamera({ width, height }) {
        const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 100, 5000 );
        camera.position.set( 1800, 2400, 1800 );       
        return camera;
    }

    function createSceneSubjects(scene , uniforms) {
        // material 1

        backgroundcube = new THREE.CubeTextureLoader()
                    .setPath( './assets/textures/cube/pisa/' )
                    .load( [ 'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png' ] );
        matLine = new THREE.LineBasicMaterial( { color : 0xff00ff } );
        matFade = new THREE.MeshPhongMaterial( { 
            color: 0xeeeeee, 
            transparent: true,
            opacity: 0.7,
            roughness: 0.9,
            depthTest: true,
            depthWrite: true,
            flatShading:true,
            side: THREE.FrontSide
        } );

        matFinished = new THREE.MeshPhongMaterial( { 
            color: 0x21ce94,
            emssive: 0x0,
            specular:0x111111,
            shininess: 30,
            roughness: 0.9,
            depthTest:true,
            depthWrite:true,
            //envMap: backgroundcube,
            flatShading:true,
            side: THREE.FrontSide
        });
   

        // background     
        var ground = new THREE.Mesh(
            new THREE.PlaneBufferGeometry( 12000, 12000, 1, 1 ),
            new THREE.MeshPhongMaterial( { color: 0x999999, shininess: 150, depthWrite: false } )
        );        

        ground.rotation.x = - Math.PI / 2; // rotates X/Y to X/Z
        ground.receiveShadow = true;
        //ground.name='ground';          
        scene.add( ground );

        //scene.add(THREESimulationRobot);

        window.addEventListener( 'mousemove', onMove );
        window.addEventListener( 'mousedown', onDown, false );

        // subject
        initModel(scene);
        // create GUI
        createGUI();  
                
    }
    
    function createGUI(){
        //GUI
        //if ( gui ) gui.destroy();

        gui = new dat.GUI({ autoPlace: false });


        // display floder
        jointFolder = gui.addFolder( 'Rotate' );
        var jointParams = {
            // tagdist
            
                get 'a0'() {
                    return robotmap.rc0.state.angle;
                },
                set 'a0'( v ) {
                    robotmap.rc0.rotate(v*Math.PI/180);
                },
                get 'a1'() {
                    return robotmap.rc1.state.angle;
                },
                set 'a1'( v ) {
                    robotmap.rc1.rotate(v*Math.PI/180);
                },
                get 'a2'() {
                    return robotmap.rc2.state.angle;
                },
                set 'a2'( v ) {
                    robotmap.rc2.rotate(v*Math.PI/180);
                },
                get 'a3'() {
                    return robotmap.rc3.state.angle;
                },
                set 'a3'( v ) {
                    robotmap.rc3.rotate(v*Math.PI/180);
                },
                get 'a4'() {
                    return robotmap.rc4.state.angle;
                },
                set 'a4'( v ) {
                    robotmap.rc4.rotate(v*Math.PI/180);
                },
                get 'a5'() {
                    return robotmap.rc5.state.angle;
                },
                set 'a5'( v ) {
                    robotmap.rc5.rotate(v*Math.PI/180);
                }

        };
        // abb irb 2600 limitation
        jointFolder.add(jointParams, 'a0', abbirb2600Config.jointLimit.a0[0],abbirb2600Config.jointLimit.a0[1]).listen();
        jointFolder.add(jointParams, 'a1', abbirb2600Config.jointLimit.a1[0],abbirb2600Config.jointLimit.a1[1]).listen();
        jointFolder.add(jointParams, 'a2', abbirb2600Config.jointLimit.a2[0],abbirb2600Config.jointLimit.a2[1]).listen();
        jointFolder.add(jointParams, 'a3', abbirb2600Config.jointLimit.a3[0],abbirb2600Config.jointLimit.a3[1]).listen();
        jointFolder.add(jointParams, 'a4', abbirb2600Config.jointLimit.a4[0],abbirb2600Config.jointLimit.a4[1]).listen();
        jointFolder.add(jointParams, 'a5', abbirb2600Config.jointLimit.a5[0],abbirb2600Config.jointLimit.a5[1]).listen();
        //jointFolder.add(jointParams, 'a1', 0,360);
        jointFolder.open();

        // target floder
        targetFolder = gui.addFolder( 'Target' );
        targetParams = {
            // tagdist
            
                get 'x'() {
                    return target.position.x;
                },
                set 'x'( v ) {
                    target.position.x=v;
                    if (targetParams.asTCP) updateTarget(target.position);
                },
                get 'y'() {
                    return target.position.y;
                },
                set 'y'( v ) {
                    target.position.y=v;
                    if (targetParams.asTCP) updateTarget(target.position);
                },
                get 'z'() {
                    return target.position.z;
                },
                set 'z'( v ) {
                    target.position.z=v;
                    if (targetParams.asTCP) updateTarget(target.position);
                },
                asTCP: true
        };
        targetFolder.add(targetParams, 'x', -200,600).listen();
        targetFolder.add(targetParams, 'y', 1000,1500).listen();
        targetFolder.add(targetParams, 'z', 600,1000).listen();
        targetFolder.add(targetParams, 'asTCP').listen().onChange(()=>{
          if (targetParams.asTCP){
            stepFolder.close();
            updateTarget(target.position);
          }else{
            stepFolder.open();
            
            const getRandom = (min, max)=>{
              return Math.floor(Math.random()*(max-min+1))+min
            }
            // make sure target and destination are different
            target.position.x += getRandom(-200,200);
            target.position.y += getRandom(-200,200);
            target.position.z += getRandom(-200,200);

            tempstartTarget = robotmap.rc5.state.jointWorldPoint.clone();
          }
        });
        targetFolder.open();

        

        stepFolder = gui.addFolder( 'Step' );
        var stepParams = {
                get 'animate'() {
                    return stepValue;
                },
                set 'animate'( v ) {
                    stepValue = v;
                    let nt = tempstartTarget.clone().add(target.position.clone().sub(tempstartTarget).multiplyScalar(1.0*stepValue/UPPERSTEP));
                    updateTarget(nt);
                    //console.log(nt);
                    //;
                },
                apply: ()=>{
                    
                }
        };
        stepFolder.add(stepParams, 'animate', 0, UPPERSTEP).listen();
        stepFolder.add(stepParams,'apply');
        //stepFolder.open();

        updateTarget(target.position);
        customContainer.appendChild(gui.domElement);
    }
    // only upgrade when asTCP === true
    function updateTarget(tp){
        
        // 幾何求解
        // 假設目前無末端執行器
        // a5 position > 只與 q0 q1 q2 有關 > 先取得R30 >
        // R = R30*R63 > 可取得 q3 q4 q5

        // 手臂投影至 Xi-1/Zi-1 平面 求得 qi
        // O為target(ox,oy,oz) 減去 a0 position 之向量
        // q0 = Atan(ox,oz) 取 水平 部分 (javascript y 為垂直)
        let oca0 = tp.clone().sub(abbirb2600Config.p0);
        //
        // let q0 = Math.atan(oca0.x,oca0.z); 若無左右臂狀態
        // 但 abbirb 2600 為 左臂結構 還需減去一臂長偏差向量 q0 = fi -apha
        let fi = Math.atan2(oca0.x,oca0.z);
        // apha = atan(sqrt(ox*ox+oz*oz-d*d), d) > 其中 d 為 a0 a1 的水平投影距離 > dv 的 x z 畢氏定理 可得
        let a1a0 = abbirb2600Config.p1.clone().sub(abbirb2600Config.p0);
        let d = a1a0.z;
        
        let apha = Math.atan2(Math.sqrt(oca0.x*oca0.x + oca0.z*oca0.z - d*d),d);

        let q0 = fi - apha + Math.PI/2;
        

        // 連稈 r0 abbirb2600Config.r0 基座
        // 連稈 r1 abbirb2600Config.r1 
        // 連稈 r3 abbirb2600Config.r3 
        // 先求q3 > -cos(q3)
        //let oca1 = target.position.clone().sub(robotmap.rc1.state.jointWorldPoint); // a1點 與 target z 深度  
        // r*r = oca1.z*oca1.z+oca1.y*oca1.y -d*d
        // D = (r*r + s*s -r1*r1 - r3*r3) / 2*r1*r3
        robotmap['rc'+0].rotate(q0);
        //let r = target.position.clone().sub(robotmap.rc1.state.jointWorldPoint);
        let r = Math.sqrt(oca0.x*oca0.x+oca0.z*oca0.z-d*d);
        //console.log(r.x);
        
        let s = tp.y-abbirb2600Config.r0;

        let D = ((r*r+s*s) - (abbirb2600Config.r1*abbirb2600Config.r1) -(abbirb2600Config.r3*abbirb2600Config.r3)) / (2*abbirb2600Config.r1*abbirb2600Config.r3);
        let q2 = [Math.atan2(D, Math.sqrt(1-D*D)), Math.atan2(D, -Math.sqrt(1-D*D))];

        let q1 = [
          Math.atan2(r, s) - Math.atan2(abbirb2600Config.r1+abbirb2600Config.r3*Math.cos(q2[0]), abbirb2600Config.r3*Math.sin(q2[0]))+Math.atan2(r,s),
          Math.atan2(r, s) - Math.atan2(abbirb2600Config.r1+abbirb2600Config.r3*Math.cos(q2[1]), abbirb2600Config.r3*Math.sin(q2[1]))
            ];
        console.log(q1[0]*180/Math.PI);
        robotmap['rc'+1].rotate(q1[0]);
        robotmap['rc'+2].rotate(q2[0]);
        /*
        if ( q1[0] > abbirb2600Config.jointLimit.a1[0] || q1[0] < abbirb2600Config.jointLimit.a1[1]){
          robotmap['rc'+1].rotate(q1[0]);
          robotmap['rc'+2].rotate(q2[0]);
        }else{
          robotmap['rc'+1].rotate(q1[1]);
          robotmap['rc'+2].rotate(q2[1]);
        }
        */
        //robotmap['rc'+2].rotate(q2[0]);
        
        /*
        // q0,q1,q2 > R30 > 由 R30 求 R63
        // 球型手腕 > R63 = Rz*q3*Ry*q4*Rz*q5 > 轉制矩陣 > 尤拉角公式算 q3, q4, q5 > 
        // 需要 目標點 t 所在 R 尤拉變化矩陣 t.normalMatrix
        // | r11  r12  r13 |   | t對坐標軸X的X分量matrix.elements[0] t對坐標軸Y的X分量matrix.elements[3] t對坐標軸Y的X分量matrix.elements[6] |                          
        // | r21  r22  r23 | = | t對坐標軸Y的Y分量matrix.elements[1] t對坐標軸Y的Y分量matrix.elements[4] t對坐標軸Y的Y分量matrix.elements[7] | > javascript Y > Z 交換 
        // | r31  r32  r33 |   | t對坐標軸Z的Z分量matrix.elements[2] t對坐標軸Y的Z分量matrix.elements[5] t對坐標軸Y的Z分量matrix.elements[8] |
        // q5 = atan2 (sin(q1)*r13) 
        let R = {
            r11:target.normalMatrix.elements[0],r12:target.normalMatrix.elements[3],r13:target.normalMatrix.elements[6],
            r21:target.normalMatrix.elements[1],r22:target.normalMatrix.elements[4],r23:target.normalMatrix.elements[7],
            r31:target.normalMatrix.elements[2],r32:target.normalMatrix.elements[5],r33:target.normalMatrix.elements[8],
        }
        // q5 = atan2(sin(q0)*r13 -cos(q0)*r23, +-sqrt(1-pow(sin(q0)*r13-cos(q0)*r23, 2)))
        //
        let q4 = [Math.atan2(Math.sin(q0)*R.r13 -Math.cos(q0)*R.r23, Math.sqrt(1-Math.pow(Math.sin(q0)*R.r13-Math.cos(q0)*R.r23, 2))),
                Math.atan2(Math.sin(q0)*R.r13 -Math.cos(q0)*R.r23, -Math.sqrt(1-Math.pow(Math.sin(q0)*R.r13-Math.cos(q0)*R.r23, 2)))];
        //console.log(R.r11);
        let q3,q5;
        // q3 = atan2 ( cos(q0)*cos(q1+q2)*r13 + sin(q0)*cos(q1+q2)*r23 + sin(q1+q2)*r33 , -cos(q0)*sin(q1+q2)*r13 + sin(q0)*sin(q1+q2)*r23 + cos(q1+q2)*r33);
        
        if (q4[0]!=q4[1]){
            if (Math.sin(q4[0])>0){
                // q3
                q3 = Math.atan2 ( Math.cos(q0)*Math.cos(q1+q2)*R.r13 + Math.sin(q0)*Math.cos(q1+q2)*R.r23 + Math.sin(q1+q2)*R.r33 , 
                            -Math.cos(q0)*Math.sin(q1+q2)*R.r13 + Math.sin(q0)*Math.sin(q1+q2)*R.r23 + Math.cos(q1+q2)*R.r33);
                // q5 = atan2(-sin(q0)*r11+cos(q0)*r21, sin(q0)*r12-ccos(q0)*r22)
                q5 = Math.atan2(-Math.sin(q0)*R.r11+Math.cos(q0)*R.r21, Math.sin(q0)*R.r12-Math.cos(q0)*R.r22);
            }else if  (Math.sin(q4[0])<0){
                // q3
                q3 = Math.atan2 ( -Math.cos(q0)*Math.cos(q1+q2)*R.r13 - Math.sin(q0)*Math.cos(q1+q2)*R.r23 - Math.sin(q1+q2)*R.r33 , 
                            Math.cos(q0)*Math.sin(q1+q2)*R.r13 + Math.sin(q0)*Math.sin(q1+q2)*R.r23 - Math.cos(q1+q2)*R.r33);
                // q5 = atan2(sin(q0)*r11-cos(q0)*r21, -sin(q0)*r12+ccos(q0)*r22)
                q5 = Math.atan2(Math.sin(q0)*R.r11-Math.cos(q0)*R.r21, -Math.sin(q0)*R.r12+Math.cos(q0)*R.r22);
            }
        }
        */
    }

    function robotstateGen(v,scene){
        let rs={};
        let suborigin = new THREE.Vector3(0,0,0);
        if (v>0){
            for (let i=0;i<v;i+=1){
                let ss = Object.assign({}, defaultstate); // 深copy
                ss.aid=i;
                if (i==0){
                    ss.size=new THREE.Vector3( 275*2,445.0,255.7*2);
                    ss.jointVector=new THREE.Vector3(0,1,0);
                    ss.subjointScale = new THREE.Vector3(0,0.5, -150.0/275/2);
                }else if(i==1){
                    ss.size=new THREE.Vector3( 150,700,255.7);
                    ss.originWorldPoint=suborigin;
                    ss.jointVector=new THREE.Vector3(1,0,0);
                    ss.subjointScale=new THREE.Vector3(0 ,0.5,0);                    
                }else if(i==2){
                    ss.size=new THREE.Vector3(275,115.0*2, 238.4+190.6);
                    ss.originWorldPoint=suborigin;
                    ss.originScale=new THREE.Vector3(-0.5,0, 0);
                    ss.jointScale=new THREE.Vector3(-0.5,0,0);
                    ss.jointVector=new THREE.Vector3(-1,0,0);
                    ss.subjointScale=new THREE.Vector3(0 ,0,0);
                }else if(i==3){
                    ss.size=new THREE.Vector3(187.0,135.0, 786.0);
                    ss.originWorldPoint=suborigin;
                    ss.originScale=new THREE.Vector3(0,0, -0.5);
                    ss.jointScale=new THREE.Vector3(0,0,-0.5);
                    ss.jointVector=new THREE.Vector3(0,0,1);
                    ss.subjointScale=new THREE.Vector3(0 ,0,0.5);
                }else if(i==4){
                    ss.size=new THREE.Vector3(85.0*2,85.0*2, 85.0*2);
                    ss.originWorldPoint=suborigin;
                    ss.originScale=new THREE.Vector3(0,0, 0);
                    ss.jointScale=new THREE.Vector3(0,0,0);
                    ss.jointVector=new THREE.Vector3(-1,0,0);
                    ss.subjointScale=new THREE.Vector3(0 ,0,0.5);
                }else if(i==5){
                    ss.size=new THREE.Vector3(98.0,98.0, 98.0);
                    ss.originWorldPoint=suborigin;
                    ss.originScale=new THREE.Vector3(0,0, -0.5);
                    ss.jointScale=new THREE.Vector3(0,0,-0.5);
                    ss.jointVector=new THREE.Vector3(0,0,1);
                }
                // out screen as +x
                // right as +z
                // up as +y 
                var rc = new RobotComponent(ss, scene);

                suborigin = rc.state.originWorldPoint.clone().add(rc.state.subjointScale.clone().multiply(rc.state.size));
                
                for(let j=i-1; j>=0; j-=1){

                    rc.state.meshList.forEach((v)=>{
                        rs['rc'+String(j)].state.meshList.push(v);
                    });
                    rc.state.lineList.forEach((v)=>{
                        rs['rc'+String(j)].state.lineList.push(v);
                    });
                } 
                
                rs['rc'+String(i)] = rc;

            }
        }
        return rs;
    }


    function initModel(scene){

        // build robot system
        robotmap = robotstateGen(6,scene);

        // target
        target = new THREE.Mesh(new THREE.BoxBufferGeometry(20,20,20),new THREE.MeshBasicMaterial( { color: 0x0000ff, depthWrite: false} ));
        //target.rotateX(60*Math.PI/180.0);
        target.position.add(new THREE.Vector3(-100,1200,800));
        //console.log(target.position);
        scene.add(target);

    }
    function onMove(event){
        //event.preventDefault();
        var x, y;
        if ( event.changedTouches ) {
            x = event.changedTouches[ 0 ].pageX;
            y = event.changedTouches[ 0 ].pageY;
        } else {
            x = event.clientX;
            y = event.clientY;

            screen.x = event.pageX;
            screen.y = event.pageY;
        }
        
        mouse.x = ( x / window.innerWidth) * 2 - 1;
        mouse.y = - ( y / window.innerHeight) * 2 + 1;
        
    }

    function onDown(event){

    }
function Textinfo(){
    //$(document).ready(()=>{

      let textFinished = 'ABB irb2600 Configures'+'<br><br>'+
      'jointR0: '+ abbirb2600Config.r0+'<br>'+
      'jointR1: '+ abbirb2600Config.r1+'<br>'+
      'jointR2: '+ abbirb2600Config.r2+'<br>'+
      'jointR3: '+ abbirb2600Config.r3+'<br>'+
      'jointR4: '+ abbirb2600Config.r4+'<br>'+
      'jointR5: '+ abbirb2600Config.r5+'<br><br>'+
      'jointP0: '+ robotmap.rc0.state.jointWorldPoint.x.toFixed(2)+', '+
                   robotmap.rc0.state.jointWorldPoint.y.toFixed(2)+', '+
                   robotmap.rc0.state.jointWorldPoint.z.toFixed(2)+'<br>'+
      'jointR1: '+ robotmap.rc1.state.jointWorldPoint.x.toFixed(2)+', '+
                   robotmap.rc1.state.jointWorldPoint.y.toFixed(2)+', '+
                   robotmap.rc1.state.jointWorldPoint.z.toFixed(2)+'<br>'+
      'jointR2: '+ robotmap.rc2.state.jointWorldPoint.x.toFixed(2)+', '+
                   robotmap.rc2.state.jointWorldPoint.y.toFixed(2)+', '+
                   robotmap.rc2.state.jointWorldPoint.z.toFixed(2)+'<br>'+
      'jointR3: '+ robotmap.rc3.state.jointWorldPoint.x.toFixed(2)+', '+
                   robotmap.rc3.state.jointWorldPoint.y.toFixed(2)+', '+
                   robotmap.rc3.state.jointWorldPoint.z.toFixed(2)+'<br>'+
      'jointR4: '+ robotmap.rc4.state.jointWorldPoint.x.toFixed(2)+', '+
                   robotmap.rc4.state.jointWorldPoint.y.toFixed(2)+', '+
                   robotmap.rc4.state.jointWorldPoint.z.toFixed(2)+'<br>'+
      'jointR5: '+ robotmap.rc5.state.jointWorldPoint.x.toFixed(2)+', '+
                   robotmap.rc5.state.jointWorldPoint.y.toFixed(2)+', '+
                   robotmap.rc5.state.jointWorldPoint.z.toFixed(2);

      $('#infoProgress').html(()=>{
                return textFinished;
            });

            
/*
            if (geoSelected.length>0){
                if (geoSelected[0].name){
                    textFinished += geoSelected[0].name+'<br>';

                    let dstr='';
                    let dtol=0.0;
                    let nsv = new THREE.Vector3();
                    geoSelected[0].userData.nodes.forEach((val,i)=>{
                    if (i%4==0){ textFinished += '<br>'; }
                    textFinished += '<button id="node_'+val+'" class="ui mini posstive button">n'+val+'</button>';
                    //record for dist
                    if (i>0){
                        let v = parseFloat(geoSelected[0].userData.disteach[i-1]);
                        dstr += 'n'+geoSelected[0].userData.nodes[i-1] + ' to n' + 
                                    val + ' = ' + v+' mm | '+(dtol+=v).toFixed(3)+' mm<br>';
                            
                    }
                    geoVmap[val].userData.tag.visible=true;
                    });
                    textFinished += '<br><br><div style="color:red">' + dstr+'</div>';
                }else{
                    textFinished += 'Nothing selected...';
                }
            }else{
                textFinished += 'Nothing selected...';
            }

            $('#infoProgress').html(()=>{
                return textFinished;
            });
            $('#infoCanvas').html(()=>{
                return nodeText;
            });
        });
    }
  */
  //});
}
    function update() {
        lights.update();

        var delta = Date.now()*0.0015;
        // postrender
        composer.render();
        Textinfo();
    }

    function onWindowResize() {
        const { width, height } = canvas;
        
        screenDimensions.width = width;
        screenDimensions.height = height;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        renderer.setSize(width, height);
        composer.setSize(width,  height);

        pannelSize.width = renderer.context.canvas.width;
        pannelSize.height = renderer.context.canvas.height;
        pannelSize.halfwidth = renderer.context.canvas.width*0.5;
        pannelSize.halfwidth = renderer.context.canvas.height*0.5;

    }

    return {
        update,
        onWindowResize
    }
}