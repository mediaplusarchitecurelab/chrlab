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
//
//import { MeshText2D, textAlign } from '../../threejs/examples/jsm/postprocessing/three-text2d';
//import SpriteText from 'three-spritetext';
// two kinds class

// curve >> [] with geoCmap
    /*
    userData {
                "nodes": nidlstr,
                "nodesVec": npts,
                "disteach": diststr,
                "locked": false
            };
    */

// vertex >> [] with geoVmap
    /*
    userData {
                "object":object,
                "tag": vvtag,
                "tagnormal": vt,
                "locked": false
            };
    */


import $ from 'jquery';

//const glsl = require('glslify');
const OrbitControls = require('three-orbit-controls')(THREE);
const textureLoader = new THREE.TextureLoader();

export default canvas => {
    // objects
    var request;
    var loader;
    var parmfont;
    const ssnodeurl = 'https://spreadsheets.google.com/feeds/list/1l3DvxzJxmCPyk3TruBMCC_YXWEvRJXnkwaKcx41IoKA/1/public/values?alt=json';
    const sscrvurl = 'https://spreadsheets.google.com/feeds/list/1l3DvxzJxmCPyk3TruBMCC_YXWEvRJXnkwaKcx41IoKA/2/public/values?alt=json';
    const exeurl = 'https://script.google.com/macros/s/AKfycbyYhxPfFDvS1nPTuDg9n5SZLYwbzaD6zqVbBkVJzzEWDoWjW6B8/exec';
    const ssnodeurledit = 'https://docs.google.com/spreadsheets/d/1l3DvxzJxmCPyk3TruBMCC_YXWEvRJXnkwaKcx41IoKA/edit?usp=sharing';
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
    var displayFolder, teamCallbackFolder;

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

    //parmfont = new THREE.Font( fontJson );

    function preload(){
        // load url1
        fetch(ssnodeurl)
            .then((response)=>{
            return response.text();
        }).then((data)=>{
            // do url1data
            let val = JSON.parse(data);
            encodenode(val);
            // load url2
            fetch(sscrvurl)
                .then((response2)=>{
                return response2.text();
                }).then((data2)=>{
                    // do url2data
                    let val2 = JSON.parse(data2);
                    encodecrv(val2);
                }).catch((error2)=>{
                    console.log(error2);
            });
        }).catch((error)=>{
            console.log(error);
        });

        // font
          
        
               
        /*
        let sprite = new TextSprite({
              fillStyle: '#ff0000',
              fontFamily: '"Times New Roman", Times, serif',
              fontSize: 10,
              fontStyle: 'italic',
              text: 'aa',
            });
            scene.add(sprite); 
        */
        //console.log(geoVmap);
        //loadJSON(ssjointurl, encodejoint);
    }

    function makeLabel(msg, size, pos, ratio) {
            //const borderSize = 1;
            let canvastxt = document.createElement('canvas');
            let ctx = canvastxt.getContext('2d');
            ctx.font = size + 'px Arial';
            // measure how long the name will be
            //ctx.canvas.width = ctx.measureText(msg).width;
            ctx.canvas.width = size*1.75;
            ctx.canvas.height = size*1.75;
            //ctx.canvas.height = size;
/*            
            if (msg.length===1) {
                //size*=0.5;
                ctx.canvas.width = ctx.measureText(msg).width*0.5;
                ctx.canvas.height = size; // fontsize * 1.5
            }
            else if (msg.length===2) {
                //size*=1.0;
                ctx.canvas.width = ctx.measureText(msg).width;
                ctx.canvas.height = size;
            }
            else if (msg.length===3) {
                //size*=1.5;
                ctx.canvas.width = ctx.measureText(msg).width*1.5;
                ctx.canvas.height = size;
            }
*/             
            // after setting the canvas width/height we have to re-set font to apply!?! looks like ctx reset
            ctx.font = size + "px Arial";
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            
            //ctx.fillStyle = 'white';
            //ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            
            ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
            ctx.fillStyle = 'red';
            ctx.fillText(msg, 0, 0);

            let texture = new THREE.CanvasTexture(ctx.canvas);
            texture.minFilter = THREE.LinearFilter;
            //texture.wrapS = THREE.ClampToEdgeWrapping;
            //texture.wrapT = THREE.ClampToEdgeWrapping;

            let matTag = new THREE.SpriteMaterial({
                    map: texture,
                    transparent: true,
            });
            let tag = new THREE.Sprite(matTag);
            tag.scale.x =ratio;
            tag.scale.y =ratio;
            tag.scale.z =ratio;

            tag.position.x = pos.x;
            tag.position.y = pos.y;
            tag.position.z = pos.z;

            tag.visible = false;

            scene.add(tag);
        
            return tag;
    }


    function encodenode(data){

        let vs = [];
        
        let geoMesh = new THREE.SphereBufferGeometry( nodeSize );
        geoMesh.castShadow = true;
        //geoVtMesh = new THREE.InstancedMesh( geoVertics, matFinished, count );
        for (let i = 0; i < data.feed.entry.length; i+=1) {

            let nidlocked = data.feed.entry[i].gsx$locked.$t === '0' ? false : true;

            let object = nidlocked ? new THREE.Mesh( geoMesh, matLocked ) : new THREE.Mesh( geoMesh, matFinished);
            let vv = new THREE.Vector3( 
                parseFloat(data.feed.entry[i].gsx$x.$t),
                parseFloat(data.feed.entry[i].gsx$z.$t),
                parseFloat(data.feed.entry[i].gsx$y.$t));
            let vt = new THREE.Vector3( 
                parseFloat(data.feed.entry[i].gsx$nx.$t)*(-1),
                parseFloat(data.feed.entry[i].gsx$nz.$t)*(-1),
                parseFloat(data.feed.entry[i].gsx$ny.$t)*(-1));
            let vvtag = makeLabel(i.toString(), 30, vt.clone().multiplyScalar(tagdist).add(vv), tagratio);
            object.position.x = vv.x;
            object.position.z = vv.z;
            object.position.y = vv.y;

            vv.userData={
                "object":object,
                "tag": vvtag,
                "tagnormal": vt,
                "locked": nidlocked,
                "parent":[] // not setted right now
            };
            /*
            let  v= { "id": parseInt(data.feed.entry[i].gsx$id.$t),
                      "node": vv,  
                      "mesh":object
                    };
            
            let vvtag = new THREE.ShapeGeometry(
                THREE.Font.generateShapes( "i", {
                    font: parmfont,
                    size: 2,
                }));
            
            let vvtag = new THREE.Texture({
                font: "2px Arial",
                fillStyle:"rgba(255,0,0)",
                fillText:i
            })
            
            let vvtag = new THREE.TextSprite({
              text: 'Hello World!',
              fontFamily: 'Arial, Helvetica, sans-serif',
              fontSize: 12,
              fillColor: '#ffbbff',
            });
            
            vv.userData={
                "tag": vvtag
            };
            */
            
            

            scene.add(object);
            //scene.add(vvtag);
            geoVmap.push(vv);
        }
        //geoVmap = vs;
    }

    function encodecrv(data){

        //let crvs = [];
        
        //let geoMesh = new THREE.SphereBufferGeometry( 0.25 );
        //geoVtMesh = new THREE.InstancedMesh( geoVertics, matFinished, count );
        for (let i = 0; i < data.feed.entry.length; i+=1) {
            let nidlstr = data.feed.entry[i].gsx$nid.$t.split('^');
            let diststr = data.feed.entry[i].gsx$disteach.$t.split('^');
            let cidlocked = data.feed.entry[i].gsx$locked.$t === '0' ? false : true; 
            // data anaylsis
            let npts = [];
            nidlstr.forEach((v)=>{
               npts.push(geoVmap[parseInt(v)]);
            })

            
            let spl = new THREE.CatmullRomCurve3(npts);
            spl.curveType = 'catmullrom';
            let tub = new THREE.TubeBufferGeometry( spl, pipeDegree, pipeSize, pipeRacial, pipeClose );
            //let pipe = new THREE.Mesh( new THREE.TubeBufferGeometry( spl, pipeDegree, pipeSize, pipeRacial, pipeClose), matFade);
            let name = 'crv_'+ data.feed.entry[i].gsx$id.$t;
            let pipe = cidlocked ? new THREE.Mesh( tub, matLocked ) : new THREE.Mesh( tub, matFade);
            pipe.name = name;
            npts.forEach((nv,i)=>{
                nv.userData.parent.push(pipe);
            });

            pipe.userData={
                "object": pipe,
                "nodes": nidlstr,
                "nodesVec": npts,
                "disteach": diststr,
                "locked": cidlocked
            };
            pipe.castShadow = true;
            /*
            let crv = {
                "name": name,
                "curve": spl,
                "pipe": pipe,
                "disteach": diststr
            }
            */
            scene.add(pipe);
            geoCmap.push(pipe);
        }
        ;
        
        //console.log(geoCrvmap );
    }
    // function below

    function buildScene() {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#a0a0a0');
        scene.fog = new THREE.Fog( 0xa0a0a0, 10, 100 );
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
        const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 160 );
        camera.position.set( 70, 70, 0 );       
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

        matLocked = new THREE.MeshStandardMaterial( { 
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

        // background     
        var ground = new THREE.Mesh(
            new THREE.PlaneBufferGeometry( 400, 400, 1, 1 ),
            new THREE.MeshPhongMaterial( { color: 0x999999, shininess: 150, depthWrite: false } )
        );        

        ground.rotation.x = - Math.PI / 2; // rotates X/Y to X/Z
        ground.receiveShadow = true; 
        //ground.name='ground';          
        scene.add( ground );

        window.addEventListener( 'mousemove', onMove );
        window.addEventListener( 'mousedown', onDown, false );

        // subject
        createGUI();  
        initModel();        
    }
    
    function createGUI(){
        //GUI
        //if ( gui ) gui.destroy();

        gui = new dat.GUI({ autoPlace: false });
        /*
        guiData = {
            'tagdist': tagdist
                }.name( 'GUIedit' ).onChange( updateModel );
        gui.add();
        */

        // display floder
        displayFolder = gui.addFolder( 'Display' );
        var displayParams = {
            // tagdist
                get 'TagDistance'() {
                    return tagdist;
                },
                set 'TagDistance'( v ) {
                    tagdist = v;
                    updateModel(0);
                },
            //nodesize
                get 'NodeSize'() {
                    return nodeSize;
                },
                set 'NodeSize'( v ) {
                    nodeSize = v;
                    updateModel(1);
                }
        };
        displayFolder.add(displayParams, 'TagDistance', 0.5,3.0);
        displayFolder.add(displayParams, 'NodeSize', 0.3,2.0);
        displayFolder.open();

        // teamcallback folder
        teamCallbackFolder = gui.addFolder( 'TeamCallback' );
        var teamParam = {
            // upload
            lockupload: ()=>{ 
                // vertex
                let lv='';
                geoVmap.forEach((v,i)=>{
                    // spreadsheet all >> (col)1 = id | (col)2=x | (col)3=y | (col)4=z | (col)5=nx | (col)6=ny | (col)7=nz | (col)8=locked ;
                    // 0 = idv | 8 = locked ;
                    if(v.userData.locked){ // true as 1
                        lv+='0='+i+'|8=1;';
                    }else{ // false as 0
                        lv+='0='+i+'|8=0;';
                    } // next row
                });
                lv = lv.substring(0, lv.length - 1);
                ssVjson(lv,exeurl,ssnodeurl,'node');

                // crv
                let lc='';
                geoCmap.forEach((v,i)=>{
                    // spreadsheet all >> (col)1 = id | (col)2=nid | (col)3=disteach | (col)4=locked;
                    // 0 = idv | 8 = locked ;
                    if(v.userData.locked){ // true as 1
                        lc+='0='+i+'|4=1;';
                    }else{ // false as 0
                        lc+='0='+i+'|4=0;';
                    } // next row
                });
                lc = lc.substring(0, lv.length - 1);
                ssVjson(lc,exeurl,ssnodeurl,'curve');
            },
            // reset and upload
            reset: ()=>{ 

                // crv
                let lc='';
                geoCmap.forEach((vc,i)=>{
                    if (vc.userData.locked){
                        vc.userData.locked = false;
                        vc.userData.object.material = matFade;
                        vc.userData.object.material.needsUpdate =true;
                    }
                    lc+='0='+i+'|4=0;';
                })
                lc = lc.substring(0, lc.length - 1);
                ssVjson(lc,exeurl,ssnodeurl,'curve');
                // vertex
                let lv='';
                geoVmap.forEach((v,i)=>{
                    if (v.userData.locked){
                        v.userData.locked = false;
                        v.userData.object.material = matFinished;
                        v.userData.object.material.needsUpdate =true;
                    }
                    //v.node
                    lv+='0='+i+'|8=0;';
                });
                lv = lv.substring(0, lv.length - 1);
                ssVjson(lv,exeurl,ssnodeurl,'node');
            }
        };
        teamCallbackFolder.add(teamParam,'lockupload');
        teamCallbackFolder.add(teamParam,'reset');
        

        teamCallbackFolder.open();

/*
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
*/
        customContainer.appendChild(gui.domElement);
    }
    function ssVjson(strjs,exeurl,ssurl,tabname){
        
        let jsonout = {
                  data: strjs,
                  sheetUrl: ssnodeurledit,
                  sheetTag: tabname
            };
        $.post(exeurl, jsonout, (data)=>{
            console.log(data);
        }).done(()=>{
            console.log('a');
        }).fail((error)=>{
            console.log(error);
        });
        //console.log('b');
        /*
        $.ajax({
            type: "GET",
            data: JSON.stringify(strjs),
            url: exeurl,
            dataType: "jsonp",
            success: function(data) {
                console.log('a');
            },
            error: function() {
                console.log('Request Error.');
            }
        });
        */
    }

    function updateModel(e){
        switch(e){
            // tagdist
            case 0:
                geoVmap.forEach((v)=>{
                    let vn = v.userData.tagnormal.clone().multiplyScalar(tagdist);
                    let np = vn.add(v);
                    v.userData.tag.position.x= np.x;
                    v.userData.tag.position.y= np.y;
                    v.userData.tag.position.z= np.z;
                    //console.log();
                });
                break;
            // nodesize
            case 1:
                let geobuff = new THREE.SphereBufferGeometry( nodeSize );
                geoVmap.forEach((v)=>{
                    let vog = v.userData.object;
                    vog.geometry=geobuff.clone();
                    vog.position.x=v.x;
                    vog.position.y=v.y;
                    vog.position.z=v.z;
                    //vo.geometry.scale(nodeSize,nodeSize,nodeSize);
                    //console.log();
                });
                break;
            default:

        }
    }
/*    
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
*/
    // assign front and back
    function meshgroupfb(geo, matarr){
        if (geo.type == 'Group'){
            geo.children.forEach((g, i)=>{
                g.material=matarr[i];
                g.material.needsUpdate =true;
            })
        }
    }
/*
    function clearSelection(){
        // All part
        for (let i=geoFinished.length-1; i>=0; i-=1){
            // front
            meshgroupfb(geoFinished[i], matFadeArray);
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
        updateText();
    }
*/
    function initModel(){
        // remove
        /*
        for (let i=0;i<geoAll.length;i+=1){
            geoAll[i].geometry.dispose();
            geoAll[i].material.dispose();
            scene.remove(geoAll[i]);
        }
        */
        //clearModel();
        preload();
        /*
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
        */
        //updateText();
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
        switch (event.which){
            case 2: // mouse middle button
                if (outlinePass !== undefined) {
                    // crv
                    outlinePass.selectedObjects.forEach((v)=>{
                        if (v.name){
                            // crv unlock
                            if (v.userData.locked){
                                v.userData.locked = false;
                                v.material = matFade;
                                // node unlock
                                v.userData.nodesVec.forEach((vn)=>{
                                    // check parent curve locked or not
                                    let checkparent = false;
                                    vn.userData.parent.forEach((vc)=>{
                                        if (vc.userData.locked){
                                            checkparent = true;
                                            return;
                                        }
                                    });
                                    if (checkparent === false){
                                        vn.userData.locked = false;
                                        vn.userData.object.material = matFinished;
                                        vn.userData.object.material.needsUpdate =true;
                                    }
                                });
                                
                            // crv lock
                            }else{
                                v.userData.locked = true;
                                v.material = matLocked;
                                // node lock
                                
                                v.userData.nodesVec.forEach((vn)=>{
                                    // check parent curve locked or not
                                    let checkparent = false;
                                    vn.userData.parent.forEach((vc)=>{
                                        if (vc.userData.locked){
                                            checkparent = true;
                                            return;
                                        }
                                    });
                                    if (checkparent){
                                        vn.userData.locked = true;
                                        vn.userData.object.material = matLocked;
                                        vn.userData.object.material.needsUpdate =true;
                                    }
                                });
                                
                            }
                        }
                        v.material.needsUpdate =true;
                    });    
                }
                // make sure all data locked
                // geoCmap.forEach(b)  
            break;
        }
    }
/*
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

*/
/*
    function clearModel(){
        var geoSelected; 
        removefromScene(geoAll);
        removefromScene(geoFinished);
        removefromScene(geoPossible);
        geoAll=[];
        geoFinished =[];
        geoPossible =[];
    }
*/

    function checkIntersection() {
        geoSelected =[];

        raycaster.setFromCamera( mouse, camera );
        var intersects = raycaster.intersectObjects( [ scene ], true );
        //console.log(intersects);
        
        if ( intersects.length > 0 ) {
            var selectedObject = intersects[ 0 ].object; //>> this just one object not group

            if (selectedObject.name){
                geoSelected.push(selectedObject);
                pieceSelected =true;
            }else{
                pieceSelected =false;
            }
        } else {
            //$('#infoCanvas').text('1');
            pieceSelected =false;
        }

        // render and show text
        if (outlinePass !== undefined && pieceSelected) {
            outlinePass.selectedObjects = geoSelected;    
            updateText();
        }
    }
    function updateText(){
        // make sure hide
        geoVmap.forEach((v,i)=>{
            v.userData.tag.visible=false;
        })
        
        $(document).ready(()=>{

            let textFinished = '';
            let nodeText = '';


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

                        //let vt = geoSelected[0].userData.neodesVec[i];
                        /*
                        let p = geoSelected[0].userData.nodesVec[i].clone();
                        //camera.updateMatrixWorld();
                        
                        let vt = p.project(camera);
                        vt.x = Math.round( (   vt.x + 1 ) * pannelSize.halfwidth);
                        vt.y = Math.round( (   vt.y + 1 ) * pannelSize.halfheight );
                        console.log(vt);
                        //console.log(renderer.context.canvas.width);
                        //sv.project(camera);
                        nodeText+='<div style="position:fixed; left: '+vt.x+'px; top: '+vt.y+'px;">'+val+'</div>';
                        //sv.x = ( sv.x * screenDimensions.halfwidth) + screenDimensions.halfwidth;
                        //sv.y = - ( sv.y * screenDimensions.halfheight) + screenDimensions.halfheight;
                        */
                        //return vector;
                        //geoSelected[0].userData.neodesVec[i].x;
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

/*
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
*/ 
/*
    function checkButton(obj){
        pieceSelected =true;
        geoSelected =[];
        geoSelected.push(obj);
        outlinePass.selectedObjects = geoSelected;
    }   
*/    
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