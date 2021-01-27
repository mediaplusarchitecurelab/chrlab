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

//const glsl = require('glslify');
const OrbitControls = require('three-orbit-controls')(THREE);
const textureLoader = new THREE.TextureLoader();

export default canvas => {
    // objects
    var geo, geoPts, geoLines, geoSelceted, backgroundcube;
    // material
    var t1, t2, uniforms;
    var matColor, matReflective, matShader, matWireframe, matGradient, matShaderSub, matHidden;
    // renderer
    var composer, outlinePass;
    // GUI
    var shading;
    const clock = new THREE.Clock();
    const screenDimensions = {
        width: canvas.width,
        height: canvas.height
    }

    // build
    const scene = buildScene();
    const camera = buildCamera(screenDimensions);
    const renderer = buildRender(screenDimensions);
    
    const controls = new OrbitControls( camera, renderer.domElement );
    controls.target.set( 0, 1, 0 );
    controls.update();

    const lights = GeneralLights(scene);


    // textture
    textureLoader.setPath( './assets/textures/sprites/' ).load( 'spark1.png', (tex1)=>{
        //t1 = tex1;        
        //textureLoader.setPath( './assets/textures/lava/' ).load( 'lavatile.jpg', (tex2)=>{
            t1 = tex1;
            
            uniforms ={pointTexture: { value: t1 }};

            createSceneSubjects(scene, uniforms);

        //},( xhr2 ) =>{
        //    console.log( (xhr2.loaded / xhr2.total * 100) + '% loaded' );
        //},( xhr2 ) =>{
        //    console.log( 'An error happened' );
        //});
    //
    },( xhr1 ) =>{
        console.log( (xhr1.loaded / xhr1.total * 100) + '% loaded' );
    },( xhr1 ) =>{
        console.log( 'An error happened' );
    });

    

    function buildScene() {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#000');
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
        
        //var renderModel = new RenderPass( scene, camera );
        //composer.addPass( renderModel );
        

        //var effectFilm = new FilmPass( 0.35, 0.95, 2048, false );
        //composer.addPass( effectFilm );   

        //var effectBloom = new BloomPass();
        //effectBloom.threshold = 1.5;
        //effectBloom.strength = 1;
        //effectBloom.radius = 1;
        //composer.addPass( effectBloom );
        
        //renderer.toneMappingExposure = Math.pow( 1.2, 4.0 );
        var renderPass = new RenderPass( scene, camera );
        composer.addPass( renderPass );

        outlinePass = new OutlinePass( new THREE.Vector2( width, height ), scene, camera );
        /*
        textureLoader.load( './assets/textures/tri_pattern.jpg', ( texture )=> {
                outlinePass.patternTexture = texture;
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
            },( xhr1 ) =>{
                console.log( (xhr1.loaded / xhr1.total * 100) + '% loaded' );
            },( xhr1 ) =>{
                console.log( 'An error happened' );
            });
        */
        outlinePass.edgeStrength = 3.0
        outlinePass.edgeGlow = 0.0;
        outlinePass.edgeThickness = 1.0;
        outlinePass.pulsePeriod = 0;
        outlinePass.visibleEdgeColor.set( '#ff0000' );
        outlinePass.hiddenEdgeColor.set( '#190a05' );

        //outlinePass.selectedObjects=geo;

        composer.addPass( outlinePass );
        
        //var effectSobel = new ShaderPass( SobelOperatorShader );
        //composer.addPass( effectSobel);

        return renderer;
    }

    // input function
    
    function loadModel() { }
    
    function onProgress( xhr ) {
            if ( xhr.lengthComputable ) {
                var percentComplete = xhr.loaded / xhr.total * 100;
                console.log( 'model ' + Math.round( percentComplete, 2 ) + '% downloaded' );
                }
    }

    function onError() {
            console.log( 'error!!' );
    }

    function buildCamera({ width, height }) {
        /*
        const fieldOfView = 36;
        const aspectRatio = window.innerWidth / window.innerHeight;
        const nearPlane = 0.25;
        const farPlane = 10000; 
        const camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);

        camera.position.set( 3, 1.3, 3 );
        */

        const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
        camera.position.set( 6, 6, 0 );
        
        return camera;
    }

    function createSceneSubjects(scene , uniforms) {

        // subject
        const customContainer = document.getElementById('canvas-gui-container');
        var gui = new dat.GUI({ autoPlace: false }); 
        //var localPlane = new THREE.Plane( new THREE.Vector3( 0, - 1, 0 ), 0.8 );
        //var globalPlane = new THREE.Plane( new THREE.Vector3( - 1, -2, 0 ), 0.1 );

        // material 1
        matColor = new THREE.Color();
        matColor.setRGB( 0.9, 0.95, 1.0 );
        
        backgroundcube = new THREE.CubeTextureLoader()
                    .setPath( './assets/textures/cube/pisa/' )
                    .load( [ 'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png' ] );
        matReflective = new THREE.MeshStandardMaterial( { color: matColor, metalness: 0.1, roughness:0.1, envMap: backgroundcube} );

        
        // shader
const vtext =[
            'attribute float size;',

            'varying vec3 vNormal;',
            'varying vec3 vWorldPosition;',

            'varying vec3 vColor;',
            'void main() {',
                'vColor = color;',
                'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
                'gl_PointSize = size * ( 300.0 / -mvPosition.z );',
                'gl_Position = projectionMatrix * mvPosition;',
            '}'].join('\n');

const ftext =[
            'uniform sampler2D pointTexture;',

            'varying vec3 vNormal;',
            'varying vec3 vWorldPosition;',

            'uniform vec3 lightPosition;',
            'varying vec3 vColor;',
            //'varying vec3 vOpacity;',
            'void main() {',

                'vec3 lightDirection = normalize(lightPosition - vWorldPosition);', // light
                'vec3 outgoingLight = vec3(1.0);',
                //'float c = 0.35 + max(0.0, dot(vNormal, lightDirection)) * 0.4 * shadowMask.x;', // shadow

                

                'gl_FragColor = vec4( vColor, 1.0 );',  // object
                'gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );', // object text
                //'gl_FragColor = gl_FragColor * vec4(vColor, 1.0);',
                //'if (vColor.a < 0.5) discard;',
                //'gl_FragColor = vec4(c, c, c, 1.0);',   //shadow
            '}'].join('\n');
        /*
const vtext= [
            'uniform vec2 uvScale;',
            'varying vec2 vUv;',
                'void main() {',
                    'vUv = uvScale * uv;',
                    'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
                    'gl_Position = projectionMatrix * mvPosition;',
                '}'].join('\n');
const ftext=[
            'uniform float time;',
            'uniform float fogDensity;',
            'uniform vec3 fogColor;',
            'uniform sampler2D texture1;',
            'uniform sampler2D texture2;',
            'varying vec2 vUv;',
            'void main( void ) {',
                'vec2 position = - 1.0 + 2.0 * vUv;',
                'vec4 noise = texture2D( texture1, vUv );',
                'vec2 T1 = vUv + vec2( 1.5, - 1.5 ) * time * 0.02;',
                'vec2 T2 = vUv + vec2( - 0.5, 2.0 ) * time * 0.01;',
                'T1.x += noise.x * 2.0;',
                'T1.y += noise.y * 2.0;',
                'T2.x -= noise.y * 0.2;',
                'T2.y += noise.z * 0.2;',
                'float p = texture2D( texture1, T1 * 2.0 ).a;',
                'vec4 color = texture2D( texture2, T2 * 2.0 );',
                'vec4 temp = color * ( vec4( p, p, p, p ) * 2.0 ) + ( color * color - 0.1 );',
                'if( temp.r > 1.0 ) { temp.bg += clamp( temp.r - 2.0, 0.0, 100.0 ); }',
                'if( temp.g > 1.0 ) { temp.rb += temp.g - 1.0; }',
                'if( temp.b > 1.0 ) { temp.rg += temp.b - 1.0; }',
                'gl_FragColor = temp;',
                'float depth = gl_FragCoord.z / gl_FragCoord.w;',
                'const float LOG2 = 1.442695;',
                'float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );',
                'fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );',
                'gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );',
            '}'
            ].join('\n');
*/
        // material 2    
        matShader = new THREE.ShaderMaterial( {
                    uniforms: uniforms,
                    fragmentShader: ftext,
                    vertexShader: vtext,

                    blending: THREE.AdditiveBlending,
                    depthTest: false,
                    transparent: false,
                    vertexColors: true
                });

        matShaderSub = new THREE.LineBasicMaterial( {
                    vertexColors: THREE.VertexColors,
                    blending: THREE.AdditiveBlending,
                    transparent: true
                } );
        matHidden = new THREE.MeshBasicMaterial( { 
            color: matColor, 
            transparent: true, 
            blending: THREE.AdditiveBlending,
            opacity : 0.1
        } );
        //matShader.lights = true;
        /*
        //var texdifCarbon = new THREE.TextureLoader().setPath( './assets/textures/carbon/' ).load( 'Carbon.png');
        texdifCarbon.encoding = THREE.sRGBEncoding;
        texdifCarbon.wrapS = THREE.RepeatWrapping;
        texdifCarbon.wrapT = THREE.RepeatWrapping;
        texdifCarbon.repeat.x = 2;
        texdifCarbon.repeat.y = 2;

        //var texnorCarbon = new THREE.TextureLoader().setPath( './assets/textures/carbon/' ).load( 'Carbon_Normal.png' );
        texnorCarbon.wrapS = THREE.RepeatWrapping;
        texnorCarbon.wrapT = THREE.RepeatWrapping;
        texnorCarbon.repeat.x = 2;
        texnorCarbon.repeat.y = 2;
        matShader = new THREE.MeshPhysicalMaterial( {

            metalness: 0.0,
            roughness: 0.1, 
            clearcoat: 0.1,
            clearcoatNormalMap: texnorCarbon,
            clearcoatRoughness: 0.1,
            //envMap: backgroundcube,
            map: texdifCarbon,
            //normalMap: texnorCarbon
        } );
        //matShader.envMap.mapping = THREE.CubeRefractionMapping;
        */

        // material 3
        matWireframe = new THREE.MeshBasicMaterial( { color: matColor, wireframe: true } );
        
        // material 4
        matGradient = new THREE.MeshLambertMaterial( {
                    vertexColors: THREE.VertexColors
                });
        // manager        
        const manager = new THREE.LoadingManager(loadModel);        
        manager.onProgress = function ( item, loaded, total ) {
            //console.log( item, loaded, total );
        };


        // execute input
        var loader = new OBJLoader(manager);
        // =================object will install into ./public not in ./src===================
        loader.load( './assets/rhinojs/model.obj', function ( obj ) {
            // Object
            obj.traverse( function ( child ) {
                if ( child.isMesh ) {
                    geo = child;
                    geo.material = matReflective;
                    
                    geo.castShadow = true;
                    scene.add(geo);

                    // geoParticles insides
                    var geoPtsys = geo.geometry.clone();
                    var colors = [];
                    var sizes = [];
                    
                    var color = new THREE.Color();

                    for ( var i = 0, n = geoPtsys.attributes.position.count; i < n; i ++ ) {
                        //color.setHSL( i / pnum, 1.0, 0.5 );
                        //colors.push( color.r, color.g, color.b );
                        colors.push( i / n, 0.2, 0.1 );
                        sizes.push( 0.3 );
                    }
                    geoPtsys.attributes.color = new THREE.BufferAttribute( new Float32Array(colors), 3 );
                    geoPtsys.attributes.size = new THREE.BufferAttribute( new Float32Array(sizes), 1 );
                    //geoPtsys.setDrawRange( 0, 1000 );

                    geoPts = new THREE.Points( geoPtsys, matShader );
                    geoLines = new THREE.LineSegments( geoPtsys, matShaderSub );

                    geoPts.castShadow = true;
                    geoPts.visible = false;
                    geoLines.castShadow = true;
                    geoLines.visible = false;
                    
                    scene.add(geoPts);
                    scene.add(geoLines);                    
                }               
            });

            // background     
            var ground = new THREE.Mesh(
                        new THREE.PlaneBufferGeometry( 40, 40, 1, 1 ),
                        new THREE.MeshPhongMaterial( { color: 0xa0adaf, shininess: 150 } )
            );

            ground.rotation.x = - Math.PI / 2; // rotates X/Y to X/Z
            ground.receiveShadow = true;            
            scene.add( ground );

        }, onProgress, onError );

        //GUI
        var effectController = {
            newShading: "Reflective"
        }
        gui.add( effectController, 'newShading', [ "Wireframe", "Shader", "Reflective", "Gradient" ]).name('Shading').onChange( matEx );

         function matEx(){
            if (geo!==undefined){
                if (geo.isMesh){
                    if(effectController.newShading !== shading)
                    {
                        shading = effectController.newShading;
                        geoSelceted = [];

                        if (shading === 'Wireframe'){
                            geoPts.visible = false; geoLines.visible = false; 
                            geo.material=matWireframe;
                            
                            geoSelceted.push( geo);
                        }else if (shading === 'Shader'){
                            geoPts.visible = true; geoLines.visible = true; 
                            
                            geo.material=matHidden;
                            geoPts.material=matShader;
                            geoLines.material=matShaderSub; 

                            geoLines.geometry.setDrawRange( 0, 500 );

                            geoPts.material.needsUpdate = true;
                            geoLines.material.needsUpdate = true;

                            geoSelceted.push( geo);

                            } // 點狀
                        else if (shading === 'Reflective'){
                            geoPts.visible = false; geoLines.visible = false; 
                            geo.material=matReflective;
                        }else if (shading ==='Gradient'){
                            geoPts.visible = false; geoLines.visible = false; 
                            // translate geo to buffer geo
                            var newgeo=geo.geometry;
                            //newgeo.computeVertexNormals(); // 菱角化
                            geo.geometry.computeBoundingBox ();

                            var boundMinY = newgeo.boundingBox.min.y;
                            var boundMaxY = newgeo.boundingBox.max.y;
                            var boundH = boundMaxY - boundMinY;

                            var colors = [];
                            for ( var i = 0, n = newgeo.attributes.position.count; i < n; ++ i ) {
                                let valy = newgeo.attributes.position.getY(i);
                                colors.push( (valy-boundMinY)/boundH, 0.5, 0.5 );
                            }
                            newgeo.attributes.color = new THREE.BufferAttribute( new Float32Array(colors), 3 );

                            geo.geometry = newgeo;
                            //updateMaterial(geo);

                            geo.material = matGradient;
                        }

                        if (outlinePass !==undefined) {
                            outlinePass.selectedObjects = geoSelceted;
                        }
                        geo.material.needsUpdate = true;

                    }
                }
            }
        }
        customContainer.appendChild(gui.domElement);
    }
/*
    function updateMaterial(mesh) {  
        if (shading ==='Gradient'){
            
            lut.setColorMap( 'rainbow' );
            lut.setMax( 2000 );
            lut.setMin( 0 );
            var geometry = mesh.geometry;
            var pressures = geometry.attributes.pressure;
            var colors = geometry.attributes.color;
            for ( var i = 0; i < pressures.array.length; i ++ ) {
                var colorValue = pressures.array[ i ];
                var color = lut.getColor( colorValue );
                if ( color === undefined ) {
                    console.log( 'Unable to determine color for value:', colorValue );
                    } else {
                    colors.setXYZ( i, color.r, color.g, color.b );
                    }
            }

            colors.needsUpdate = true;
                    var map = sprite.material.map;
                    lut.updateCanvas( map.image );
                    map.needsUpdate = true;
                    
        }
    }
*/
    function update() {
        lights.update();
        var delta = Date.now()*0.0015;

        if (shading ==='Shader'){
            let colors= [];
            let sizes = [];
            for ( var i = 0, n = geoPts.geometry.attributes.position.count; i < n; i ++ ) {
                    colors.push( i / n, 0.5+Math.sin( i + delta*1.03 )*0.3, 1-(i / n));
                    sizes.push( 0.3 + 0.30*Math.sin( i + delta) );
            }
            geoPts.geometry.attributes.color = new THREE.BufferAttribute( new Float32Array(colors), 3 );
            geoPts.geometry.attributes.size = new THREE.BufferAttribute( new Float32Array(sizes), 1 );
        }
        //uniforms[ 'time' ].value += 0.2 * delta;
/*
        
        
        for ( var i = 0; i < scene.children.length; i ++ ) {
            var object = scene.children[ i ];
                object.rotation.y += delta * 0.5 * ( i % 2 ? 1 : - 1 );
                object.rotation.x += delta * 0.5 * ( i % 2 ? - 1 : 1 );
        }
*/
        // postrender
        //renderer.clear();
        composer.render();

        //renderer.render(scene, camera);
        
    }

    function onWindowResize() {
        const { width, height } = canvas;
        
        screenDimensions.width = width;
        screenDimensions.height = height;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        renderer.setSize(width, height);
        composer.setSize( width,  height);

        
    }

    return {
        update,
        onWindowResize
    }
}