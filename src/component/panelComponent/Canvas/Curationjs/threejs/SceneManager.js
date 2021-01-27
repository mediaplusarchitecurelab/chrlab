//import * as THREE from 'three';
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

import { RectAreaLightUniformsLib } from '../../threejs/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { RectAreaLightHelper } from '../../threejs/examples/jsm/helpers/RectAreaLightHelper.js';

import { RGBELoader } from '../../threejs/examples/jsm/loaders/RGBELoader.js';

import { HDRCubeTextureLoader } from '../../threejs/examples/jsm/loaders/HDRCubeTextureLoader.js';
//import { RectAreaLightHelper } from '../../threejs/examples/jsm/helpers/RectAreaLightHelper.js';

//const glsl = require('glslify');
const OrbitControls = require('three-orbit-controls')(THREE);
const modelurl = './assets/curationjs/model/xx.obj';

export default canvas => {
			// =============== DECLEAR ===============
            var model;
			var hdrCubeRenderTarget = null;
			var pmremGenerator;
				
			var ground;
			var diffuseColor;
			var sceneCube, cubeMesh, sphereMesh;

			var textureEquirec, textureCube, textureSphere, textureENV;

			var matHDR = new THREE.MeshStandardMaterial({
				color: 0xff0000,
				roughness: 0.1
        		//emissiveIntensity: .5,
			});

			var matROOM = new THREE.MeshStandardMaterial( {
					color: 0xffffff,
					roughness: 0.5
				});
			var matGROUND = new THREE.MeshStandardMaterial( {
					color: 0x555555,
					roughness: 0.3,
					reflectivity: 0.5
				});
			
			
			// =============== HACK ===============
			const screenDimensions = {
		        width: canvas.width,
		        height: canvas.height
		    }
		    // =============== LOAD ROOM ================
		    
			THREE.Mesh.prototype.clone = function () {

				var newMaterial = ( this.material.isMaterial ) ? this.material.clone() : this.material.slice();

				return new this.constructor( this.geometry.clone(), newMaterial ).copy( this );

			};
			
			// =============== LOAD ROOM ================
            var loadRoom = function(renderer, scene){

                var loader = new OBJLoader(new THREE.LoadingManager(()=>{}));
                
                // =================object will install into ./public not in ./src===================
                loader.load( modelurl , function ( obj ) {
                    // Object
                    obj.children.forEach((child)=>{

                    	if ( child.isMesh ) {
                    		
                    		var geo = child;
                    		geo.material = matROOM;
                    		geo.material.needsUpdate = true;
                    		geo.castShadow = true;
                    		geo.receiveShadow = true;
                            scene.add(geo);
                    	}
                    });

                    // ground					
                    ground = new THREE.Mesh( new THREE.PlaneBufferGeometry( 200, 200 ), matGROUND );
					ground.rotation.x = -Math.PI/2;
					ground.castShadow = true;
					ground.receiveShadow = true;
					scene.add( ground );
                    /*
                    obj.traverse( function ( child ) {
                        if ( child.isMesh ) {
                            var geo = child;
                            geo.material = matRoom;                            
                            geo.castShadow = true;
                            scene.add(geo);                  
                        }               
                    });
                    */
                }, onProgress, onError );
            }
            function onProgress( xhr ) {
	            if ( xhr.lengthComputable ) {
	                var percentComplete = xhr.loaded / xhr.total * 100;
	                console.log( 'model ' + Math.round( percentComplete, 2 ) + '% downloaded' );
	                }
    		}

		    function onError() {
		            console.log( 'error!!' );
		    }
					
			//=============== BUILD ================
		    const scene = buildScene();
		    const renderer = buildRender(screenDimensions);
		    const camera = buildCamera(screenDimensions);
		    const contorls = buildControls(camera);
			init();


			function buildScene() {
		        const scene = new THREE.Scene();
		        scene.background = new THREE.Color('#000');
		        return scene;
		    }
		    
		    function buildRender({ width, height }) {
		        const renderer = new THREE.WebGLRenderer( {canvas: canvas, antialias: true } );
		        renderer.setPixelRatio( window.devicePixelRatio );
		        renderer.setSize( width, height );

		        //renderer.shadowMap.enabled = true;
				//renderer.shadowMap.type = THREE.VSMShadowMap;
				//renderer.setClearColor( 0xCCCCCC, 1 );
				renderer.physicallyCorrectLights = true;
				renderer.toneMapping = THREE.LinearToneMapping;

				// HDR

				THREE.DefaultLoadingManager.onLoad = function ( ) {

					pmremGenerator.dispose();

				};
				

		        // ================= SET HDRI-MATERIAL ======================
		        // Textures
		        /*
				var hdrUrls = [ 'px.hdr', 'nx.hdr', 'py.hdr', 'ny.hdr', 'pz.hdr', 'nz.hdr' ];
				textureCube = new HDRCubeTextureLoader()
					.setPath( './assets/textures/cube/pisaHDR/' )
					.setDataType( THREE.UnsignedByteType )
					.load( hdrUrls, function () {

						hdrCubeRenderTarget = pmremGenerator.fromCubemap( textureCube );
						textureCube.magFilter = THREE.LinearFilter;
						textureCube.needsUpdate = true;

					} );

				pmremGenerator = new THREE.PMREMGenerator( renderer );
				pmremGenerator.compileCubemapShader();

				*/

				renderer.toneMappingExposure = 2;
		        return renderer;
		    }

		    function buildCamera({ width, height }) {

		        const camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 100 );
				camera.position.x = 6;
				camera.position.y = 1.5;
				camera.position.z = 0;
				camera.lookAt(scene);
		        return camera;
		    }
		    function buildControls(camera){
		    	const controls = new OrbitControls( camera, renderer.domElement );
		        controls.update();
		        return controls
		    }
		    // GENERATE ENV
		    function buildENV(){
		    	// create environmet
		    	var envScene = new THREE.Scene();

		    	var mainLight = new THREE.PointLight( 0xffffff, 1, 30, 1.6 ); //( color : Integer, intensity : Float, distance : Number, decay : Float )
		    	mainLight.position.set( 0, 3, 0 );
		    	//mainLight.shadow = true;
				envScene.add( mainLight );

				var geometry = new THREE.BoxBufferGeometry();
				//geometry.deleteAttribute( 'uv' );
				var roomMaterial = new THREE.MeshStandardMaterial( { metalness: 0, side: THREE.BackSide } );
				var room = new THREE.Mesh( geometry, roomMaterial );
				room.scale.setScalar( 10 );
				envScene.add( room );

				var lightMaterial = new THREE.MeshLambertMaterial( { color: 0x000000, emissive: 0xffffff, emissiveIntensity: 10 } );

				var light1 = new THREE.Mesh( geometry, lightMaterial );
				light1.position.set( - 500, 200, 0 );
				light1.scale.set( 0.1, 1, 1 );
				envScene.add( light1 );

				var light2 = new THREE.Mesh( geometry, lightMaterial );
				light2.position.set( 0, 500, 0 );
				light2.scale.set( 1, 0.1, 1 );
				envScene.add( light2 );

				var light2 = new THREE.Mesh( geometry, lightMaterial );
				light2.position.set( 200, 100, 500 );
				light2.scale.set( 1.5, 2, 0.1 );
				envScene.add( light2 );

				// upload as teture map
				var pmremGenerator = new THREE.PMREMGenerator( renderer );
				pmremGenerator.compileCubemapShader();
				textureENV = pmremGenerator.fromScene( envScene, 0.1 );

				matHDR.envMap = textureENV.texture;
		        
		        matROOM.envMap = textureENV.texture;
		        matGROUND.envMap = textureENV.texture;

		        renderer.outputEncoding = THREE.sRGBEncoding;

				return envScene;
		    }


		    function init() {

				

				// room
				/*
				var materials = [];
				
				for ( var i = 0; i < 8; i ++ ) {

					materials.push( new THREE.MeshBasicMaterial( { color: 0xfaaaaa, side: THREE.BackSide } ) );

				}
				var geometry = new THREE.BoxBufferGeometry( 3, 3, 3 );
				var mesh = new THREE.Mesh( geometry, materials );
				scene.add( mesh );
				*/
				// ================= ROOM ======================
				new loadRoom( renderer, scene );
				buildENV();

				//var material = new THREE.MeshBasicMaterial( { vertexColors: true } );
				model = new THREE.Mesh( new THREE.TorusKnotBufferGeometry( 0.75, 0.3, 128, 32, 1 ), matHDR );
				model.geometry.translate(0,1.5,0);
				scene.add( model );
				//new SimpleGI( renderer, scene );
			}

			function onWindowResize() {
		        const { width, height } = canvas;		        
		        screenDimensions.width = width;
		        screenDimensions.height = height;
		        camera.aspect = width / height;
		        camera.updateProjectionMatrix();		        
		        renderer.setSize(width, height);
		    }

			function update() {

				requestAnimationFrame( update );
				//renderer.setRenderTarget( null );
				renderer.render( scene, camera );

			}
    return {
        update,
        onWindowResize
    }
}