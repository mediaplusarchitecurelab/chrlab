import React, { Component } from 'react';
import { Header} from 'semantic-ui-react';
import threeEntryPoint from "./threejs/threeEntryPoint";
import "./canvas.css";

import * as THREE from 'three';
//import Qualaroo from './QualarooLoader';

//import {THREE} from '../arbuild/js/three.js';
//require('../arbuild/js/three.js');

    var scene, camera, renderer, clock, deltaTime, totalTime;
    var arToolkitSource, arToolkitContext;
    var markerRoot1, markerRoot2;
    var mesh1;

export default class CanvasComponent extends Component {
	constructor(props) {
    super(props);
    this.state = {
        activeItem: this.props.activeItem,
        scriptloaded: [],
        init:false,
        delay:100
    };
  }


    componentDidMount() {
        var loadscript = function (src) {
          var tag = document.createElement('script');
          tag.async = false;
          tag.src = src;
          var body = document.getElementsByTagName('body')[0];
          body.appendChild(tag);
        }
	    //threeEntryPoint(this.threeRootElement);
        loadscript('./assets/arbuild/js/three.js');
        loadscript('./assets/arbuild/jsartoolkit5/artoolkit.min.js');
        loadscript('./assets/arbuild/jsartoolkit5/artoolkit.api.js');
        loadscript('./assets/arbuild/threex/threex-artoolkitsource.js');
        loadscript('./assets/arbuild/threex/threex-artoolkitcontext.js');
        loadscript('./assets/arbuild/threex/threex-arbasecontrols.js');
        loadscript('./assets/arbuild/threex/threex-armarkercontrols.js');
        
        //this.interval = setInterval(this.tick, this.state.delay);
        
        this.init();      
    }
    /*
    async loadscript(url,name){
        let script = document.createElement('script');
        script.async = true;
        script.type = 'text/javascript';
        if (script.readyState){  //IE
            script.onreadystatechange = function(){
                if (script.readyState == "loaded" ||
                        script.readyState == "complete"){
                    script.onreadystatechange = null;
                    //callback();
                }
            };
        } else {  //Others
            script.onload = function(){
                
            };
        }
        script.src = url;
        document.getElementsByTagName('head')[0].appendChild(script);
        console.log(window);
    }
    */
    componentDidUpdate(prevProps, prevState) {    
        if (prevState.delay !== this.state.delay) {      
            clearInterval(this.interval);      
            this.interval = setInterval(this.tick, this.state.delay);    
        }  
    }

    handleDelayChange = (e) => {
        this.setState({ delay: Number(e.target.value) });

    }

    componentWillUnmount() {    
        clearInterval(this.interval);  
    }  

    tick = () => {   
        if (this.state.init){
            this.animate();
            console.log('nn');
        }else{
            console.log('err');
        }
    }

	init(){

        scene = new THREE.Scene();
        let ambientLight = new THREE.AmbientLight( 0xcccccc, 0.5 );
        scene.add( ambientLight );
            
        camera = new THREE.Camera();
        scene.add(camera);

        renderer = new THREE.WebGLRenderer({
            antialias : true,
            alpha: true
        });
        renderer.setClearColor(new THREE.Color('lightgrey'), 0)
        renderer.setSize( 640, 480 );
        renderer.domElement.style.position = 'absolute'
        renderer.domElement.style.top = '0px'
        renderer.domElement.style.left = '0px'
        document.body.appendChild( renderer.domElement );

        clock = new THREE.Clock();
        deltaTime = 0;
        totalTime = 0;

        arToolkitSource = new window.THREEx.ArToolkitSource({
            sourceType : 'webcam',
        });
    }
 /*     
      ////////////////////////////////////////////////////////////
      // setup arToolkitSource
      ////////////////////////////////////////////////////////////

        

          function onResize()
          {
            arToolkitSource.onResize()  
            arToolkitSource.copySizeTo(renderer.domElement) 
            if ( arToolkitContext.arController !== null )
            {
              arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)  
            } 
          }

          arToolkitSource.init(function onReady(){
            onResize()
          });
      
          // handle resize event
          window.addEventListener('resize', function(){
            onResize()
          });
      
          ////////////////////////////////////////////////////////////
          // setup arToolkitContext
          ////////////////////////////////////////////////////////////  

          // create atToolkitContext
          arToolkitContext = new window.THREEx.ArToolkitContext({
            cameraParametersUrl: '../arbuild/data/camera_para.dat',
            detectionMode: 'mono'
          });
          
          // copy projection matrix to camera when initialization complete
          arToolkitContext.init( function onCompleted(){
            camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
          });

          ////////////////////////////////////////////////////////////
          // setup markerRoots
          ////////////////////////////////////////////////////////////

          // build markerControls
          markerRoot1 = new window.THREE.Group();
          scene.add(markerRoot1);
          let markerControls1 = new window.THREEx.ArMarkerControls(arToolkitContext, markerRoot1, {
            type: 'pattern', patternUrl: "../arbuild/data/hiro.patt",
          })

          let geometry1 = new window.THREE.CubeGeometry(1,1,1);
          let material1 = new window.THREE.MeshNormalMaterial({
            transparent: true,
            opacity: 0.5,
            side: window.THREE.DoubleSide
          }); 
          
          mesh1 = new window.THREE.Mesh( geometry1, material1 );
          mesh1.position.y = 0.5;
          
          markerRoot1.add( mesh1 );
    }
*/
    update()
    {
      // update artoolkit on every frame
      if ( arToolkitSource.ready !== false )
        arToolkitContext.update( arToolkitSource.domElement );
    }


    render()
    {
      renderer.render( scene, camera );
    }


    animate()
    {
      requestAnimationFrame(this.animate);
      deltaTime = clock.getDelta();
      totalTime += deltaTime;
      this.update();
      this.render();
    }

    render () {
    	
        return (
        	
            <div id="panel-canvas" className="panel-canvas" ref={element => this.threeRootElement = element}>
            	  <div id="canvas-gui-container">
            	  	<Header as='h2' color='black' inverted text-align='center' key={this.state.activeItem}  style={{fontFamily: 'Titillium Web'}}>{this.state.activeItem.toUpperCase()}</Header>
            	  </div>
            </div>
        );
    }
}