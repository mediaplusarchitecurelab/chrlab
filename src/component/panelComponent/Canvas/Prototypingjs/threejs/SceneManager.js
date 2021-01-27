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

//const glsl = require('glslify');
const OrbitControls = require('three-orbit-controls')(THREE);
const textureLoader = new THREE.TextureLoader();

export default canvas => {
    // objects
    var loader;
    //var geos = new THREE.Group();
    var geo, geoPts, geoLines;
    var backgroundcube, text;
    // as Three.Group = children[0] = frontface / children[1] = backface
    var geoSelected;
    var geoAll =[]; 
    var geoFinished =[];
    var geoPossible =[];
    // material
    var t1, t2, uniforms;
    var matColor, matFinColor, matPosColor, matShader, matWireframe, matGradient, matShaderSub, matHidden;
    var matFinished, matFinishedBack, matPossible, matPossibleBack, matFade, matFadeBack;
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
    
    // GUI
    var gui, guiData, shading;
    const clock = new THREE.Clock();
    const screenDimensions = {
        width: canvas.width,
        height: canvas.height
    }
    var editFolder;

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

    // function below

    function buildScene() {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#a0a0a0');
        scene.fog = new THREE.Fog( 0xa0a0a0, 10, 22 );
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

        outlinePass.edgeStrength = 3.0
        outlinePass.edgeGlow = 0.0;
        outlinePass.edgeThickness = 1.0;
        outlinePass.pulsePeriod = 0;
        outlinePass.visibleEdgeColor.set( '#ff0000' );
        outlinePass.hiddenEdgeColor.set( '#190a05' );

        composer.addPass( outlinePass );

        return renderer;
    }

    // input function    
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
        const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
        camera.position.set( 6, 6, 0 );       
        return camera;
    }

    function createSceneSubjects(scene , uniforms) {
        // material 1

        backgroundcube = new THREE.CubeTextureLoader()
                    .setPath( './assets/textures/cube/pisa/' )
                    .load( [ 'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png' ] );

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
        matFadeBack = new THREE.MeshBasicMaterial( { 
            color: 0x555555,
            transparent: true,
            opacity: 0.7,
            side: THREE.BackSide
        });
        matFadeArray =[matFade, matFadeBack];

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
        matFinishedBack = new THREE.MeshBasicMaterial( { 
            color: 0x555594,
            side: THREE.BackSide
        });
        matFinishedArray =[matFinished, matFinishedBack];

        matPossible = new THREE.MeshStandardMaterial( { 
            color: 0xeee143,
            transparent: true,
            opacity: 0.7,
            roughness: 0.9,
            depthTest: true,
            depthWrite: true,
            flatShading:true,
            side: THREE.FrontSide
        } );
        matPossibleBack = new THREE.MeshBasicMaterial( { 
            color: 0x888122,
            transparent: true,
            opacity: 0.7,
            side: THREE.BackSide
        });
        matPossibleArray =[matPossible, matPossibleBack];

        // background     
        var ground = new THREE.Mesh(
            new THREE.PlaneBufferGeometry( 400, 400, 1, 1 ),
            new THREE.MeshPhongMaterial( { color: 0x999999, shininess: 150, depthWrite: false } )
        );
                

        ground.rotation.x = - Math.PI / 2; // rotates X/Y to X/Z
        ground.receiveShadow = true; 
        ground.name='ground';          
        scene.add( ground );

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

        // material 3
        matWireframe = new THREE.MeshBasicMaterial( { color: matColor, wireframe: true } );
        
        // material 4
        matGradient = new THREE.MeshLambertMaterial( {
                    vertexColors: THREE.VertexColors,
                    side: THREE.DoubleSide
                });       
        

        window.addEventListener( 'mousemove', onMove );
        window.addEventListener( 'mousedown', onDown, false );

        // subject
        createGUI();  
        updateModel();
        
    }
    
    function createGUI(){
        //GUI
        //if ( gui ) gui.destroy();

        gui = new dat.GUI({ autoPlace: false }); 

        guiData = {
                    'currentURL': './assets/prototypingjs/2020Fab01_00.obj',
                    'drawWireframe': true,
                    'drawStrokes': true
                };

        // pubilc/assets/prototypingjs/XXXX.obj

        gui.add( guiData, 'currentURL', {
                    "2020Fab01_00": './assets/prototypingjs/2020Fab01_00.obj',
                    "2020Fab01_01": './assets/prototypingjs/2020Fab01_01.obj'
                } ).name( 'FabModel' ).onChange( updateModel );
        // gui action
        editFolder = gui.addFolder( 'Edit' );
        var editParms = {
            clearSelection: ()=>{clearSelection();},
            undoSelection: ()=>{undoSelection();}
        };
        editFolder.add(editParms, 'clearSelection');
        editFolder.add(editParms, 'undoSelection');
        editFolder.open();

        customContainer.appendChild(gui.domElement);
    }
    
    function removefromScene(array){
        for (let i=0;i<array.length;i+=1){
            if (array[i].type == 'Group'){
                array[i].children.forEach((g, i)=>{
                    g.material.dispose();
                    g.geometry.dispose();
                })
            }else{
                // ground
                array[i].geometry.dispose();
                array[i].material.dispose();
            }
            scene.remove(array[i]); 
        }
    }
    // assign front and back
    function meshgroupfb(geo, matarr){
        if (geo.type == 'Group'){
            geo.children.forEach((g, i)=>{
                g.material=matarr[i];
                g.material.needsUpdate =true;
            })
        }
    }
    function clearSelection(){
        // All part
        for (let i=geoFinished.length-1; i>=0; i-=1){
            // front
            meshgroupfb(geoFinished[i], matFadeArray);
            /*
            geoFinished[i].children[0].material=matFade;
            geoFinished[i].children[0].material.needsUpdate =true;
            // back
            geoFinished[i].children[1].material=matFade;
            geoFinished[i].children[1].material.needsUpdate =true;
            */
            geoAll.push(geoFinished[i]);
            geoFinished.pop();
        }
        // possible part
        for (let i=geoAll.length-1; i>=0; i-=1){
            // front
            geoAll[i].children[0].material=matFade;
            geoAll[i].children[0].material.needsUpdate =true;
            // back
            geoAll[i].children[0].material=matFade;
            geoAll[i].children[0].material.needsUpdate =true;
        }
        geoPossible=[];

        updateText();
    }
    function undoSelection(){
        // finish part
        if (geoFinished.length>0){
            geoFinished[geoFinished.length-1].material=matFade;
            geoFinished[geoFinished.length-1].material.needsUpdate =true;
            geoAll.push(geoFinished[geoFinished.length-1]);
            geoFinished.pop();
        }
            // possible part
            geoPossible=[];
            var idPos=[];

            for (let i=0; i<geoAll.length; i+=1){
                    geoAll[i].material = matFade;
                    geoAll[i].material.needsUpdate =true;
                    let ac = geoAll[i].geometry.boundingSphere.center;

                    for (let j=0; j<geoFinished.length; j+=1){
                        let fc = geoFinished[j].geometry.boundingSphere.center;
                        let d = fc.distanceTo( ac );
                        if (d<0.65){
                            geoPossible.push(geoAll[i]);
                            idPos.push(i);
                        }
                    }
            }

            for (let k=0; k<idPos.length;k+=1){
                geoAll[idPos[k]].material = matPossible;
                geoAll[idPos[k]].material.needsUpdate =true;
            }
        /*
        for (let i=geoAll.length-1; i>=0; i-=1){
            geoAll[i].material=matFade;
            geoAll[i].material.needsUpdate =true;
        }
        geoPossible=[];
        */
        updateText();
    }

    function updateModel(){
        // remove
        /*
        for (let i=0;i<geoAll.length;i+=1){
            geoAll[i].geometry.dispose();
            geoAll[i].material.dispose();
            scene.remove(geoAll[i]);
        }
        */
        clearModel();
        // manager        
        const manager = new THREE.LoadingManager();
        manager.onProgress = function ( item, loaded, total ) {};

        loader = new OBJLoader(manager);
        // execute input
        // =================object will install into ./public not in ./src===================
        loader.load( guiData.currentURL, function ( obj ) {
            // Object
            obj.traverse( function ( child ) {
                if ( child.isMesh ) {
                        var piece = child.clone();
                        // put data into group then make it show different texture
                        var pieces = new THREE.Group();
                        pieces.add(new THREE.Mesh(piece.geometry, matFade));
                        pieces.add(new THREE.Mesh(piece.geometry, matFadeBack));
                        pieces.children[0].castShadow = true; // only cast one geomtry shadow 
                        pieces.name = piece.name;
                        //console.log(pieces.name);
                        scene.add(pieces);
                        geoAll.push(pieces);                           
                }               
            });
            //scene.add( geos );
        }, onProgress, onError );
        updateText();
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
        checkIntersection();
    }

    function onDown(event){
        //console.log(guiData.currentURL);
        //event.preventDefault();

        switch (event.which){
            case 1:
                var checkFinished = false;
                var idFinished = -1;
                var idAll = -1;
                var idPos = [];
                geoPossible =[];

                // if selected something
                if (pieceSelected){

                    // update all
                    for (let i=0;i<geoAll.length;i+=1){
                        meshgroupfb(geoAll[i], matFadeArray);
                        //geoAll[i].material = matFade;
                    }
                    // for selected
                    if (geoSelected !== undefined && geoSelected.length>0){
                        
                        // check finished
                        if (geoFinished.length>0){
                            for (let i=0;i<geoFinished.length;i+=1){
                                if (geoFinished[i].name === geoSelected[0].name){
                                   idFinished = i;
                                   checkFinished = true;
                                   break;
                                }
                            }
                        }

                        // step1 : if check finidshed > become fade
                        if (checkFinished){
                            // add into geoAll
                            geoAll.push(geoFinished[idFinished]);

                            // texture change
                            meshgroupfb(geoFinished[idFinished], matFadeArray);
                            //geoFinished[idFinished].children[0].material = matFade;
                            //geoFinished[idFinished].children[1].material = matFadeBack;
                            //geoFinished[idFinished].children[0].material.needsUpdate =true;
                            //geoFinished[idFinished].children[1].material.needsUpdate =true;
                            // removed from geofinished
                            geoFinished.splice(idFinished, 1);

                        }else{
                            // if fade > become finished
                            // add into geofinished
                            // geoSelected got group
                            meshgroupfb(geoSelected[0], matFinishedArray);
                            //geoSelected[0].children[0].material = matFinished;
                            //geoSelected[0].children[1].material = matFinishedBack;
                            //geoSelected[0].children[0].material.needsUpdate =true;
                            //geoSelected[0].children[1].material.needsUpdate =true;
                            geoFinished.push(geoSelected[0]);

                            // removed from geoAll
                            for (let i=0;i<geoAll.length;i+=1){
                                if (geoAll[i].name === geoSelected[0].name){
                                   idAll = i;
                                   break;
                                }
                            }
                            geoAll.splice(idAll, 1);
                        }

                        // step2 : check surrounded and preseverd in geoAll

                        for (let i=0; i<geoAll.length; i+=1){
                            let ac = geoAll[i].children[0].geometry.boundingSphere.center;

                            for (let j=0; j<geoFinished.length; j+=1){
                                let fc = geoFinished[j].children[0].geometry.boundingSphere.center;
                                let d = fc.distanceTo( ac );
                                if (d<0.65){
                                    geoPossible.push(geoAll[i]);
                                    idPos.push(i);
                                }
                            }
                        }

                        for (let k=0; k<idPos.length;k+=1){
                            meshgroupfb(geoAll[idPos[k]], matPossibleArray);
                            //geoAll[idPos[k]].material = matPossible;
                            //geoAll[idPos[k]].material.needsUpdate =true;
                        }
                            

                    }
                }
                break;
        }

        updateText();
    }


    function clearModel(){
        var geoSelected; 
        removefromScene(geoAll);
        removefromScene(geoFinished);
        removefromScene(geoPossible);
        geoAll=[];
        geoFinished =[];
        geoPossible =[];
    }

    function checkIntersection() {
        geoSelected =[];

        raycaster.setFromCamera( mouse, camera );
        var intersects = raycaster.intersectObjects( [ scene ], true );
        if ( intersects.length > 0 ) {
            var selectedObject = intersects[ 0 ].object; //>> this just one object not group

            // but need to check it is for ground
            if (selectedObject.name === 'ground'){
                $('#infoCanvas').text('');
                pieceSelected =false;
            }else{
                $('#infoCanvas').text(selectedObject.name);
                $('#infoCanvas').css({
                    left: screen.x+20,
                    top: screen.y+20,
                    fontSize: '24px',
                    textShadow: '5px 5px 1px #333333, 2px 2px 1px #333333'
                });
                // should replace object into group
                geoSelected.push(selectedObject.parent);
                pieceSelected =true;
            }
        } else {
            $('#infoCanvas').text('1');
            pieceSelected =false;
        }

        if (outlinePass !== undefined && pieceSelected) {
            outlinePass.selectedObjects = geoSelected;
        }
        updateText();
    }
    function updateText(){
        //geoSelected =[];
        //var count=0;
        // text attatch
       // $(document).ready(()=>{
            $('#infoProgress').html(()=>{
                textFinished ='Sotck<br>';

                // geoall part
                if (geoAll !== undefined && geoAll.length>0){
                    for (var i=0;i<geoAll.length;i+=1){
                        //textFinished += ''geoFinished[i].name +',';
                        if (i%5==0){ textFinished += '<br>'; }
                        var idstr = geoAll[i].name;
                        
                        textFinished += '<button id="'+idstr+'" class="ui mini inverted button">'+idstr+'</button>';
                    }
                    //count+=1;
                }

                // finished part
                textFinished += '<br><br>Finished<br>';
                if (geoFinished !== undefined && geoFinished.length>0){
                    for (var i=0;i<geoFinished.length;i+=1){
                        //textFinished += ''geoFinished[i].name +',';
                        if (i%5==0){ textFinished += '<br>'; }
                        textFinished += '<button id="'+geoFinished[i].name+'" class="ui mini posstive button">'+geoFinished[i].name+'</button>';

                    }
                    //count+=1;
                } 

                return textFinished;
            });

            if (geoAll !== undefined){
                $('#infoAll').html(()=>{
                    return 'GoeFinishedNum:'+geoFinished.length;
                });

                //var count=0;
                /*
                $('#infoProgress').find('.button').hover(()=>{
                    console.log($(this).id);
                    //count+=1;
                    //$(this).addEventListener('onclick',()=>{
                    //    console.log('a');
                    //});
                    //console.log(count);
                    //count+=1;
                });
                */
                // add interactive hover
                
                if (geoAll.length>0){
                    for(let i=0;i<geoAll.length;i+=1){
                        $('#'+geoAll[i].name).hover(()=>{
                            checkButton(geoAll[i]);
                        });  
                    }    
                }
                if (geoFinished.length>0){
                    for(let i=0;i<geoFinished.length;i+=1){
                        $('#'+geoFinished[i].name).hover(()=>{
                            checkButton(geoFinished[i]);
                        });  
                    }    
                }
            }

            // set pieces
            if (pieceSelected){
                //console.log(geoSelected[0].type);
                if (geoSelected.length>0){
                    $('#'+geoSelected[0].name).addClass("red");
                }
            }
       // });

    }
 

    function checkButton(obj){
        pieceSelected =true;
        geoSelected =[];
        geoSelected.push(obj);
        outlinePass.selectedObjects = geoSelected;
    }   
    
    function update() {
        lights.update();

        var delta = Date.now()*0.0015;
        // postrender
        composer.render();
    }

    function onWindowResize() {
        const { width, height } = canvas;
        
        screenDimensions.width = width;
        screenDimensions.height = height;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        renderer.setSize(width, height);
        composer.setSize(width,  height);

    }

    return {
        update,
        onWindowResize
    }
}