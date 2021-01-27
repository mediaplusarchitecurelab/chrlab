import * as THREE from 'three';
//import SceneSubject from './SceneSubject';
//import GeneralLights from './GeneralLights';
import * as dat from 'dat.gui';
import { OBJLoader } from '../../threejs/examples/jsm/loaders/OBJLoader.js';

import { EffectComposer } from '../../threejs/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../../threejs/examples/jsm/postprocessing/RenderPass.js';
import { FilmPass } from '../../threejs/examples/jsm/postprocessing/FilmPass.js';
import { BloomPass } from '../../threejs/examples/jsm/postprocessing/BloomPass.js';

import { ShaderPass } from '../../threejs/examples/jsm/postprocessing/ShaderPass.js';
import { SobelOperatorShader } from '../../threejs/examples/jsm/shaders/SobelOperatorShader.js';
import { OutlinePass } from '../../threejs/examples/jsm/postprocessing/OutlinePass.js';

import { RectAreaLightUniformsLib } from '../../threejs/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { RectAreaLightHelper } from '../../threejs/examples/jsm/helpers/RectAreaLightHelper.js';

//import { RectAreaLightHelper } from '../../threejs/examples/jsm/helpers/RectAreaLightHelper.js';

//const glsl = require('glslify');
const OrbitControls = require('three-orbit-controls')(THREE);
const textureLoader = new THREE.TextureLoader();

const worldposReplace = `
            #define BOX_PROJECTED_ENV_MAP
            #if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP )
                vec4 worldPosition = modelMatrix * vec4( transformed, 1.0 );
                #ifdef BOX_PROJECTED_ENV_MAP
                    vWorldPosition = worldPosition.xyz;
                #endif
            #endif
            `;

const envmapPhysicalParsReplace = `
            #if defined( USE_ENVMAP )
                #define BOX_PROJECTED_ENV_MAP
                #ifdef BOX_PROJECTED_ENV_MAP
                    uniform vec3 cubeMapSize;
                    uniform vec3 cubeMapPos;
                    varying vec3 vWorldPosition;
                    vec3 parallaxCorrectNormal( vec3 v, vec3 cubeSize, vec3 cubePos ) {
                        vec3 nDir = normalize( v );
                        vec3 rbmax = ( .5 * cubeSize + cubePos - vWorldPosition ) / nDir;
                        vec3 rbmin = ( -.5 * cubeSize + cubePos - vWorldPosition ) / nDir;
                        vec3 rbminmax;
                        rbminmax.x = ( nDir.x > 0. ) ? rbmax.x : rbmin.x;
                        rbminmax.y = ( nDir.y > 0. ) ? rbmax.y : rbmin.y;
                        rbminmax.z = ( nDir.z > 0. ) ? rbmax.z : rbmin.z;
                        float correction = min( min( rbminmax.x, rbminmax.y ), rbminmax.z );
                        vec3 boxIntersection = vWorldPosition + nDir * correction;
                        return boxIntersection - cubePos;
                    }
                #endif
                #ifdef ENVMAP_MODE_REFRACTION
                    uniform float refractionRatio;
                #endif
                vec3 getLightProbeIndirectIrradiance( /*const in SpecularLightProbe specularLightProbe,*/ const in GeometricContext geometry, const in int maxMIPLevel ) {
                    vec3 worldNormal = inverseTransformDirection( geometry.normal, viewMatrix );
                    #ifdef ENVMAP_TYPE_CUBE
                        #ifdef BOX_PROJECTED_ENV_MAP
                            worldNormal = parallaxCorrectNormal( worldNormal, cubeMapSize, cubeMapPos );
                        #endif
                        vec3 queryVec = vec3( flipEnvMap * worldNormal.x, worldNormal.yz );
                        // TODO: replace with properly filtered cubemaps and access the irradiance LOD level, be it the last LOD level
                        // of a specular cubemap, or just the default level of a specially created irradiance cubemap.
                        #ifdef TEXTURE_LOD_EXT
                            vec4 envMapColor = textureCubeLodEXT( envMap, queryVec, float( maxMIPLevel ) );
                        #else
                            // force the bias high to get the last LOD level as it is the most blurred.
                            vec4 envMapColor = textureCube( envMap, queryVec, float( maxMIPLevel ) );
                        #endif
                        envMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;
                    #elif defined( ENVMAP_TYPE_CUBE_UV )
                        vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );
                    #else
                        vec4 envMapColor = vec4( 0.0 );
                    #endif
                    return PI * envMapColor.rgb * envMapIntensity;
                }
                // Trowbridge-Reitz distribution to Mip level, following the logic of http://casual-effects.blogspot.ca/2011/08/plausible-environment-lighting-in-two.html
                float getSpecularMIPLevel( const in float roughness, const in int maxMIPLevel ) {
                    float maxMIPLevelScalar = float( maxMIPLevel );
                    float sigma = PI * roughness * roughness / ( 1.0 + roughness );
                    float desiredMIPLevel = maxMIPLevelScalar + log2( sigma );
                    // clamp to allowable LOD ranges.
                    return clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );
                }
                vec3 getLightProbeIndirectRadiance( /*const in SpecularLightProbe specularLightProbe,*/ const in vec3 viewDir, const in vec3 normal, const in float roughness, const in int maxMIPLevel ) {
                    #ifdef ENVMAP_MODE_REFLECTION
                        vec3 reflectVec = reflect( -viewDir, normal );
                        // Mixing the reflection with the normal is more accurate and keeps rough objects from gathering light from behind their tangent plane.
                        reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
                    #else
                        vec3 reflectVec = refract( -viewDir, normal, refractionRatio );
                    #endif
                    reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
                    float specularMIPLevel = getSpecularMIPLevel( roughness, maxMIPLevel );
                    #ifdef ENVMAP_TYPE_CUBE
                        #ifdef BOX_PROJECTED_ENV_MAP
                            reflectVec = parallaxCorrectNormal( reflectVec, cubeMapSize, cubeMapPos );
                        #endif
                        vec3 queryReflectVec = vec3( flipEnvMap * reflectVec.x, reflectVec.yz );
                        #ifdef TEXTURE_LOD_EXT
                            vec4 envMapColor = textureCubeLodEXT( envMap, queryReflectVec, specularMIPLevel );
                        #else
                            vec4 envMapColor = textureCube( envMap, queryReflectVec, specularMIPLevel );
                        #endif
                        envMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;
                    #elif defined( ENVMAP_TYPE_CUBE_UV )
                        vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );
                    #elif defined( ENVMAP_TYPE_EQUIREC )
                        vec2 sampleUV;
                        sampleUV.y = asin( clamp( reflectVec.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
                        sampleUV.x = atan( reflectVec.z, reflectVec.x ) * RECIPROCAL_PI2 + 0.5;
                        #ifdef TEXTURE_LOD_EXT
                            vec4 envMapColor = texture2DLodEXT( envMap, sampleUV, specularMIPLevel );
                        #else
                            vec4 envMapColor = texture2D( envMap, sampleUV, specularMIPLevel );
                        #endif
                        envMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;
                    #elif defined( ENVMAP_TYPE_SPHERE )
                        vec3 reflectView = normalize( ( viewMatrix * vec4( reflectVec, 0.0 ) ).xyz + vec3( 0.0,0.0,1.0 ) );
                        #ifdef TEXTURE_LOD_EXT
                            vec4 envMapColor = texture2DLodEXT( envMap, reflectView.xy * 0.5 + 0.5, specularMIPLevel );
                        #else
                            vec4 envMapColor = texture2D( envMap, reflectView.xy * 0.5 + 0.5, specularMIPLevel );
                        #endif
                        envMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;
                    #endif
                    return envMapColor.rgb * envMapIntensity;
                }
            #endif
            `;            
export default canvas => {
    // objects
    var ground;
    // material
    var diffuseTex, bumpTex, wallMat;
    var defaultMat;

    var rMap;
    var boxProjectedMat;
    
    var WIDTH = canvas.innerWidth;
    var HEIGHT = canvas.innerHeight;
    // camera
    var VIEW_ANGLE = 45;
    var ASPECT = WIDTH / HEIGHT;
    var NEAR = 1;
    var FAR = 800;

    // renderer
    var cubeCamera, controls;
    
    const screenDimensions = {
        width: canvas.width,
        height: canvas.height
    }

    // build
    scene = buildScene();

    renderer = buildRender(screenDimensions);
    camera = buildCamera(screenDimensions);

    createSceneSubjects(scene);

    

    function buildScene() {
        scene = new THREE.Scene();
        //scene.background = new THREE.Color('#000');
        return scene;
    }

    function buildRender({ width, height }) {
        const renderer = new THREE.WebGLRenderer( {canvas: canvas, antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( width, height );
        
        return renderer;
    }

    // input function
    
    function loadModel() { }

    function buildCamera({ width, height }) {

        const camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR );
        camera.position.set( 280, 106, - 5 );

        controls = new OrbitControls( camera, renderer.domElement );
        controls.target.set( 0, - 10, 0 );
        controls.maxDistance = 400;
        controls.minDistance = 10;
        //controls.addEventListener( 'change', renderer );
        controls.update();

        // cube camera for env.

        // cube camera for environment map
        cubeCamera = new THREE.CubeCamera( 1, 1000, 512 );
        cubeCamera.renderTarget.texture.generateMipmaps = true;
        //cubeCamera.renderTarget.texture.minFilter = THREE.NearestMipmapLinearFilter;
        cubeCamera.renderTarget.texture.mapping = THREE.CubeUVReflectionMapping; // update for this version THREEJS

        cubeCamera.position.set( 0, - 100, 0 );
        scene.add( cubeCamera );
        
        return camera;
    }

    function createSceneSubjects(scene , uniforms) {

        // subject
        const customContainer = document.getElementById('canvas-gui-container');
        var gui = new dat.GUI({ autoPlace: false }); 
        
        // material
        rMap = textureLoader.load( './assets/textures/lava/lavatile.jpg');
        rMap.wrapS = THREE.RepeatWrapping;
        rMap.wrapT = THREE.RepeatWrapping;
        rMap.repeat.set( 1, 2 );

        defaultMat = new THREE.MeshPhysicalMaterial( {
            roughness: 1,
            envMap: cubeCamera.renderTarget.texture,
            roughnessMap: rMap
        } );

        boxProjectedMat = new THREE.MeshPhysicalMaterial( {
                    color: new THREE.Color( '#ffffff' ),
                    roughness: 1,
                    envMap: cubeCamera.renderTarget.texture,
                    roughnessMap: rMap
                } );

        boxProjectedMat.onBeforeCompile = function ( shader ) {

                    //these parameters are for the cubeCamera texture
                    shader.uniforms.cubeMapSize = { value: new THREE.Vector3( 200, 200, 100 ) };
                    shader.uniforms.cubeMapPos = { value: new THREE.Vector3( 0, - 50, 0 ) };

                    //replace shader chunks with box projection chunks
                    shader.vertexShader = 'varying vec3 vWorldPosition;\n' + shader.vertexShader;

                    shader.vertexShader = shader.vertexShader.replace(
                        '#include <worldpos_vertex>',
                        worldposReplace
                    );
                    //console.log(shader.fragmentShader);
                    shader.fragmentShader = shader.fragmentShader.replace(
                        '#include <envmap_physical_pars_fragment>',
                        envmapPhysicalParsReplace
                    );

                };


        // material 2
        diffuseTex = textureLoader.load( './assets/textures/brick_diffuse.jpg', function () {
            updateCubeMap();
        } );
        bumpTex = textureLoader.load( './assets/textures/brick_bump.jpg', function () {
            updateCubeMap();
        } );
        wallMat = new THREE.MeshPhysicalMaterial( {
            map: diffuseTex,
            bumpMap: bumpTex,
            bumpScale: 0.3,
        } );


        // background     
        ground = new THREE.Mesh( new THREE.PlaneBufferGeometry( 200, 100, 100 ), boxProjectedMat );

        ground.rotateX( - Math.PI / 2 ); // rotates X/Y to X/Z
        ground.position.set( 0, - 49, 0 );
        //ground.receiveShadow = true;

        ground.material = defaultMat;            
        scene.add( ground );

        


        var planeGeo = new THREE.PlaneBufferGeometry( 100, 100 );

        var planeBack1 = new THREE.Mesh( planeGeo, wallMat );
        planeBack1.position.z = - 50;
                planeBack1.position.x = - 50;
                scene.add( planeBack1 );

                var planeBack2 = new THREE.Mesh( planeGeo, wallMat );
                planeBack2.position.z = - 50;
                planeBack2.position.x = 50;
                scene.add( planeBack2 );

                var planeFront1 = new THREE.Mesh( planeGeo, wallMat );
                planeFront1.position.z = 50;
                planeFront1.position.x = - 50;
                planeFront1.rotateY( Math.PI );
                scene.add( planeFront1 );

                var planeFront2 = new THREE.Mesh( planeGeo, wallMat );
                planeFront2.position.z = 50;
                planeFront2.position.x = 50;
                planeFront2.rotateY( Math.PI );
                scene.add( planeFront2 );

                var planeRight = new THREE.Mesh( planeGeo, wallMat );
                planeRight.position.x = 100;
                planeRight.rotateY( - Math.PI / 2 );
                scene.add( planeRight );

                var planeLeft = new THREE.Mesh( planeGeo, wallMat );
                planeLeft.position.x = - 100;
                planeLeft.rotateY( Math.PI / 2 );
                scene.add( planeLeft );


                var width = 25;
                var height = 25;
                var intensity = 10;

                RectAreaLightUniformsLib.init();

                var blueRectLight = new THREE.RectAreaLight( 0xf3aaaa, intensity, width, height );
                blueRectLight.position.set( 99, 5, 0 );
                blueRectLight.lookAt( 0, 5, 0 );
                scene.add( blueRectLight );

                var blueRectLightHelper = new THREE.RectAreaLightHelper( blueRectLight, 0xffffff );
                blueRectLight.add( blueRectLightHelper );

                var redRectLight = new THREE.RectAreaLight( 0x9aaeff, intensity, width, height );
                redRectLight.position.set( - 99, 5, 0 );
                redRectLight.lookAt( 0, 5, 0 );
                scene.add( redRectLight );

                var redRectLightHelper = new THREE.RectAreaLightHelper( redRectLight, 0xffffff );
                redRectLight.add( redRectLightHelper );

        customContainer.appendChild(gui.domElement);

        //update();
    }

    function updateCubeMap() {

                //disable specular highlights on walls in the environment map
                
                //if (ground){
                    //console.log('a');
                    wallMat.roughness = 1;
                    ground.visible = false;

                    cubeCamera.position.copy( ground.position );

                    cubeCamera.update( renderer, scene );

                    wallMat.roughness = 0.6;

                    ground.visible = true;
                //}
                
                update();

    }
    
    function update() {
        //updateCubeMap();

        //lights.update();

        //renderer.render(scene, camera);
        renderer.render( scene, camera );
    }
    
    function onWindowResize() {
        const { width, height } = canvas;
        
        screenDimensions.width = width;
        screenDimensions.height = height;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        renderer.setSize(width, height);
        //composer.setSize( width,  height);
        
    }

    return {
        update,
        onWindowResize
    }
}