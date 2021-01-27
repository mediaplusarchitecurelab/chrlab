
import React, { Component } from 'react';
import { Header, Button, Grid} from 'semantic-ui-react';
import threeEntryPoint from "./threejs/threeEntryPoint";
import './canvas.css';

//import * as xml_data from '../assets/opencv/haarcascade_frontalface_default.xml';

//const xml = new XMLParser().parseFromString(xml_data);
//const data = require('../assets/opencv/haarcascade_frontalface_default.xml');
//const faceCascadeFile = '';
//import * as util from '../assets/utils.js';
//import opencvfunc from "./threejs/opencvfunc";
/*
const plug_script = (src) => {
  return new Promise(function(resolve, reject){
    let script = document.createElement('script');
    script.src = src;
    script.addEventListener('load', function () {
      resolve();
    });
    script.addEventListener('error', function (e) {
      reject(e);
    });
    document.body.appendChild(script);
  })
};
const dat_script = plug_script('./threejs/assets/js/libs/dat.gui.min.js');
*/
export default class CanvasComponent extends Component {
    

	constructor(props) {
        super(props);
        this.state = {
            activeItem: this.props.activeItem,
            ctx: null,
            video:null,
            delay:100,
            count:0,
            sel:null,
            faceCascade:null,
            faceCascadeURL: null
        };
        //console.log(data);
         //this.state.faceCascadeFile = URL.createObjectURL();
        //var cv;
        /*
        setTimeout(() => {
            const response = {
              file: './assets/opencv/haarcascade_frontalface_default.xml',
            };
            // server sent the url to the file!
            // now, let's download:
            this.state.faceCascadeFile=response.file;
            // you could also do:
            // window.location.href = response.file;
          }, 100);
          */
          
          
    }

    componentDidMount() {

	    threeEntryPoint(this.threeRootElement);

        
        if (this.state){
            var video = document.querySelector('#videoElement');
            this.state.video = video;
            navigator.mediaDevices.getUserMedia({ video: true }) // audio:true
            .then(function(stream) {
                if ("srcObject" in video) {
                    video.srcObject = stream;
                } else {
                    video.src = window.URL.createObjectURL(stream);
                }
                // if webcam execute
                video.onloadedmetadata = function(e) {
                    video.play();
                };
            })
            .catch(function(err) {
                console.log(err.name + ": " + err.message);
            });
        }

        // load opencv
        const script = document.createElement('script');
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
                document.getElementById('loading-opencv').innerHTML='opencv loaded...';
                //console.log(window.cv);
                //var src = cv.imread(document.getElementById('src-image'));
            };
        }


        script.src = './assets/opencv/opencv.js';
        //"./assets/opencv/opencv.js";
        document.getElementsByTagName('head')[0].appendChild(script);
          
        this.interval = setInterval(this.tick, this.state.delay);

        //console.log(xml_data);
        /*
        fetch('../assets/opencv/haarcascade_frontalface_default.xml').then(function(response) {
                if(response.ok) {
                    return response;
                }

                throw new Error('Network response was not ok.');
            }).catch(function(error) {
                console.log('There has been a problem with your fetch operation: ', error.message);
            }).then(response => {
                //var binaryData = [];
                //binaryData.push(data);
                //this.state.faceCascadeFile = window.URL.createObjectURL(new Blob(binaryData, {type: "xml"}));
                //const parser = new DOMParser();
                //const xml = parser.parseFromString(readerData, "text/xml");
                this.state.faceCascadeURL = response.url;
            });
            //
/*
        let request = new XMLHttpRequest();
        request.open('GET', './assets/opencv/haarcascade_frontalface_default.xml', true);
        request.responseType = 'xml';
        request.onload = function(ev) {
            console.log('a');
            request = this;
            if (request.readyState === 4) {
                if (request.status === 200) {
                    let data = new Uint8Array(request.response);
                    this.state.faceCascadeFile = data;
                    //window.cv.FS_createDataFile('/', './assets/opencv/haarcascade_frontalface_default2.xml', data, true, false, false);
                        //callback();
                } else {
                    console.error('Failed to load ' + './assets/opencv/haarcascade_frontalface_default.xml' + ' status: ' + request.status);
                }
            }else {
                    console.error('Failed to load ' + './assets/opencv/haarcascade_frontalface_default.xml' + ' status: ' + request.status);
            }
        };

        const response = await fetch('../assets/opencv/haarcascade_frontalface_default.xml', {
          method: 'PUT'
        })
        .then(response => this.state.faceCascadeFile = response)
        .catch(error => console.error('Error:', error))
        .then(response => console.log('Success:', response));
        /*
        fetch('../assets/opencv/haarcascade_frontalface_default.xml').then(function(response) {
            if(response.ok) {
                //this.state.faceCascadeFile = response;
                return response;
            }
                throw new Error('Network response was not ok.');
            }).then(function(myBlob) { 
                this.state.faceCascadeFile = myBlob;

            }).catch(function(error) {
                console.log('There has been a problem with your fetch operation: ', error.message);
            }); 
/*
            let request = new XMLHttpRequest();
            request.open('GET', './assets/opencv/haarcascade_frontalface_default.xml', true);
            request.responseType = 'arraybuffer';
            request.onload = function(ev) {
                request = this;
                if (request.readyState === 4) {
                    if (request.status === 200) {
                        let data = new Uint8Array(request.response);
                        window.cv.FS_createDataFile('/', './assets/opencv/haarcascade_frontalface_default2.xml', data, true, false, false);
                        //callback();
                    } else {
                        console.error('Failed to load ' + './assets/opencv/haarcascade_frontalface_default.xml' + ' status: ' + request.status);
                    }
                }
            };
            request.send();


        fetch('./assets/opencv/haarcascade_frontalface_default.xml').then(function(response) {
            if(response.ok) {
                return response.text();
            }
                throw new Error('Network response was not ok.');
            }).then(function(myBlob) { 
                this.state.faceCascadeFile = window.URL.createObjectURL(myBlob);

            }).catch(function(error) {
                console.log('There has been a problem with your fetch operation: ', error.message);
            }); 
*/
    }

    // interval //
    
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
        this.setState({      
            count: this.state.count + 1    
        }); 
        if (this.state.sel === 'BWANI'){
            this.exeCT();
            let dst = new window.cv.Mat(); // grey
            window.cv.cvtColor(this.state.ctx, dst, window.cv.COLOR_RGB2GRAY, 0);

            window.cv.imshow('canvasElement', dst);
            dst.delete();
        }else if (this.state.sel === 'EDGEANI'){
            this.exeCT();  // load the image from <img>
            // !!!!all cv = window.cv ro load!!!
            let dst = new window.cv.Mat(); // grey
            window.cv.cvtColor(this.state.ctx, this.state.ctx, window.cv.COLOR_RGB2GRAY, 0);
            window.cv.Canny(this.state.ctx, dst, 50, 100, 3, false); 
            window.cv.imshow('canvasElement', dst);
            //this.state.ctx.delete(); 
            dst.delete();

        }else if (this.state.sel === 'FACEANI'){
            this.exeCT();  
            let dst = new window.cv.Mat(); // grey
            window.cv.cvtColor(this.state.ctx, dst, window.cv.COLOR_RGB2GRAY, 0);
        // identify
            let faces = new window.cv.RectVector();
            let eyes = new window.cv.RectVector();

        //let eyeCascade = new window.cv.CascadeClassifier();

        // error message
            //let utils = new Utils('errorMessage'); //use utils class
        // load pre-trained classifiers
            
       // utils.createFileFromUrl(faceCascadeFile, faceCascadeFile, () => {
       //     faceCascade.load(faceCascadeFile); // in the callback, load the cascade from file 
       // });
        
        // detect faces
            let msize = new window.cv.Size(0, 0);

            this.state.faceCascade = new window.cv.CascadeClassifier();
            if (this.state.faceCascadeURL !== null){
                
                //console.log(this.state.faceCascadeFile)
                this.state.faceCascade.load(this.state.faceCascadeURL);
                this.state.faceCascade.detectMultiScale(dst, faces, 1.1, 3, 0, msize, msize);
                
                for (let i = 0; i < faces.size(); ++i) {
                        let roiGray = dst.roi(faces.get(i));
                        let roiSrc = this.state.ctx.roi(faces.get(i));
                        let point1 = new window.cv.Point(faces.get(i).x, faces.get(i).y);
                        let point2 = new window.cv.Point(faces.get(i).x + faces.get(i).width,
                                                  faces.get(i).y + faces.get(i).height);
                        window.cv.rectangle(this.state.ctx, point1, point2, [255, 0, 0, 255]);
                        roiGray.delete(); roiSrc.delete();
                }
                
            }
            /*
                      this.state.faceCascade.detectMultiScale(dst, faces, 1.1, 3, 0, msize, msize);
                      for (let i = 0; i < faces.size(); ++i) {
                        let roiGray = dst.roi(faces.get(i));
                        let roiSrc = this.state.ctx.roi(faces.get(i));
                        let point1 = new window.cv.Point(faces.get(i).x, faces.get(i).y);
                        let point2 = new window.cv.Point(faces.get(i).x + faces.get(i).width,
                                                  faces.get(i).y + faces.get(i).height);
                        window.cv.rectangle(this.state.ctx, point1, point2, [255, 0, 0, 255]);
                        roiGray.delete(); roiSrc.delete();
                        }
                    // !!!!all cv = window.cv ro load!!!
/*
            if (this.state.faceCascadeFile !== null){
                
                      
/*
                this.state.faceCascade = new window.cv.CascadeClassifier();
                utils.createFileFromUrl(this.state.faceCascadeFile, this.state.faceCascadeFile, () => {
                    this.state.faceCascade.load(this.state.faceCascadeFile); // in the callback, load the cascade from file 
                });
                
                console.log(this.state.faceCascade);
                this.state.faceCascade = new window.cv.CascadeClassifier();
                this.state.faceCascade.load(this.state.faceCascadeFile);
                this.state.faceCascade.detectMultiScale(dst, faces, 1.1, 3, 0, msize, msize);
                
                for (let i = 0; i < faces.size(); ++i) {
                    let roiGray = dst.roi(faces.get(i));
                    let roiSrc = this.state.ctx.roi(faces.get(i));
                    let point1 = new window.cv.Point(faces.get(i).x, faces.get(i).y);
                    let point2 = new window.cv.Point(faces.get(i).x + faces.get(i).width,
                                              faces.get(i).y + faces.get(i).height);
                    window.cv.rectangle(this.state.ctx, point1, point2, [255, 0, 0, 255]);
                    roiGray.delete(); roiSrc.delete();
                }
                
            }else{
                
                
                
                utils.createFileFromUrl(faceCascadeFile, faceCascadeFile, () => {
                    this.state.faceCascade = new window.cv.CascadeClassifier();
                    this.state.faceCascade.load(faceCascadeFile); // in the callback, load the cascade from file 
                });
                
                
                fetch('./assets/opencv/haarcascade_frontalface_default.xml')
                .then(response => response.blob())
                .then(response =>{

                        this.state.faceCascade = new window.cv.CascadeClassifier();
                        this.state.faceCascade.load(response);   
                });
                
                var blob = null;
                var xhr = new XMLHttpRequest();
                xhr.open('GET', './assets/opencv/haarcascade_frontalface_default.xml')
                xhr.responseType = "xml"
                xhr.onload = function() 
                {
                    blob = xhr.response;
                    this.state.faceCascade = new window.cv.CascadeClassifier();
                    this.state.faceCascade.load(blob);                
                }
                

            }
            
            fetch('./assets/opencv/haarcascade_frontalface_default.xml').then(function(response) {
                  if(response.ok) {
                    return response.blob();
                  }
                  throw new Error('Network response was not ok.');
                }).then(function(myBlob) { 
                      this.state.faceCascadeFile = window.URL.createObjectURL(myBlob);
                      

                }).catch(function(error) {
                  console.log('There has been a problem with your fetch operation: ', error.message);
                });
/*
        for (let i = 0; i < faces.size(); ++i) {

        }

        for (let i = 0; i < faces.size(); ++i) {
            let roiGray = dst.roi(faces.get(i));
            let roiSrc = this.state.ctx.roi(faces.get(i));
            let point1 = new window.cv.Point(faces.get(i).x, faces.get(i).y);
            let point2 = new window.cv.Point(faces.get(i).x + faces.get(i).width,
                                      faces.get(i).y + faces.get(i).height);
            window.cv.rectangle(this.state.ctx, point1, point2, [255, 0, 0, 255]);
            

        }

        for (let i = 0; i < faces.size(); ++i) {
            let roiGray = dst.roi(faces.get(i));
            let roiSrc = this.state.ctx.roi(faces.get(i));
            let point1 = new window.cv.Point(faces.get(i).x, faces.get(i).y);
            let point2 = new window.cv.Point(faces.get(i).x + faces.get(i).width,
                                      faces.get(i).y + faces.get(i).height);
            window.cv.rectangle(this.state.ctx, point1, point2, [255, 0, 0, 255]);
            // detect eyes in face ROI
            eyeCascade.detectMultiScale(roiGray, eyes);
            for (let j = 0; j < eyes.size(); ++j) {
                let point1 = new window.cv.Point(eyes.get(j).x, eyes.get(j).y);
                let point2 = new window.cv.Point(eyes.get(j).x + eyes.get(j).width,
                                          eyes.get(j).y + eyes.get(i).height);
                window.cv.rectangle(roiSrc, point1, point2, [0, 0, 255, 255]);
            }
            roiGray.delete(); roiSrc.delete();
        }
*/
        window.cv.imshow('canvasElement', dst);

        //this.state.ctx.delete(); 
        dst.delete();
        //this.state.faceCascade.delete();
        //eyeCascade.delete(); 
        faces.delete(); 
        eyes.delete();
        } 
    }
  

	exeCT = () =>{
        var width = this.state.video.offsetWidth, 
            height = this.state.video.offsetHeight;

        var canvas = document.getElementById('canvasElement');
        canvas.width = width;
        canvas.height = height;

        var ctx = canvas.getContext('2d');
        ctx.drawImage(this.state.video, 0, 0, width, height);
        this.state.ctx = window.cv.imread('canvasElement');
    }
    exeBW = () =>{
        this.exeCT();  // load the image from <img>
        this.state.sel = 'BW';
        // !!!!all cv = window.cv ro load!!!
        let dst = new window.cv.Mat(); // grey
        window.cv.cvtColor(this.state.ctx, dst, window.cv.COLOR_RGB2GRAY, 0);

        window.cv.imshow('canvasElement', dst);

        //this.state.ctx.delete(); 
        dst.delete();
    }
    exeEDGE = () =>{
        this.exeCT();  // load the image from <img>
        this.state.sel = 'EDGE';
        // !!!!all cv = window.cv ro load!!!
        let dst = new window.cv.Mat(); // grey
        window.cv.cvtColor(this.state.ctx, this.state.ctx, window.cv.COLOR_RGB2GRAY, 0);
        window.cv.Canny(this.state.ctx, dst, 50, 100, 3, false); 

        window.cv.imshow('canvasElement', dst);

        //this.state.ctx.delete(); 
        dst.delete();
    }
    exeBWANI = () =>{
        this.state.sel = 'BWANI';        
    }

    exeEDGEANI = () =>{
        this.state.sel = 'EDGEANI';        
    }
    exeFACEANI = () =>{
        // load the image from <img>
        this.state.sel = 'FACEANI';
        
    }
    render () {
    	
        return (
            <div id="panel-canvas" className="panel-canvas" ref={element => this.threeRootElement = element}>    	
            	<div id="canvas-gui-container"  style={{position:'absolute', right:'20px'}}>
                    <div id="infoCanvas" style={{color:'red', fontFamily: 'Titillium Web', position:'fixed'}}></div> 
                </div>
                <div style={{position:'absolute', margin:'20px 20px 20px 20px'}}>
                    <Header as='h2' key={this.state.activeItem}  style={{color:'black', fontFamily: 'Titillium Web'}}>{this.state.activeItem.toUpperCase()}</Header>                    
                    <div as='h6' id="loading-opencv" style={{color:'red',  fontFamily: 'Titillium Web',marginTop:'-10px'}}>loading Opencv...</div>
                </div>
                <video autoPlay={true} id="videoElement" style={{position:'absolute', display:'block', marginLeft:'2.5%', marginTop:'80px', height:'60%'}}></video>
                <canvas autoPlay={true} id="canvasElement" style={{position:'absolute', display:'block', marginLeft:'52.5%', marginTop:'80px', height:'60%'}}></canvas>
                
                <Grid style={{position: 'absolute', bottom:'5%', width: '132.5%'}}>
                    <Grid.Row>
                        <Grid.Column width={2}> <Button id="exeBW" size='mini' inverted color='blue' onClick={()=>this.exeBW()}>BW</Button> </Grid.Column>
                        <Grid.Column width={2}> <Button id="exeEdge" size='mini' inverted color='blue' onClick={()=>this.exeEDGE()}>EDGE</Button> </Grid.Column>
                        <Grid.Column width={2}> <Button id="exeBWani" size='mini' inverted color='red' onClick={()=>this.exeBWANI()}>BWani</Button> </Grid.Column>
                        <Grid.Column width={2}> <Button id="exeEdgeani" size='mini' inverted color='red' onClick={()=>this.exeEDGEANI()}>EDGEani</Button> </Grid.Column>
                        <Grid.Column width={2}> <Button id="exeFaceani" size='mini' inverted color='red' onClick={()=>this.exeFACEANI()}>FACEani</Button> </Grid.Column>
                    </Grid.Row>
                </Grid>
                
            </div>
        );
    }
}