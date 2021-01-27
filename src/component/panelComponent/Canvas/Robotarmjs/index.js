import React, { Component } from 'react';
import { Header} from 'semantic-ui-react';
import threeEntryPoint from "./threejs/threeEntryPoint";
import "./canvas.css";
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
        activeItem: this.props.activeItem
    };
  }


    componentDidMount() {
	    threeEntryPoint(this.threeRootElement);
    }
	
    render () {
    	
        return (
            <div id="panel-canvas" className="panel-canvas" ref={element => this.threeRootElement = element}>    	
            	<div id="canvas-gui-container"  style={{position:'absolute', right:'20px'}}>
                    <div id="infoCanvas" style={{color:'red', fontFamily: 'Titillium Web', position:'fixed'}}></div> 
                </div>
                <div style={{position:'absolute', margin:'20px 20px 20px 20px'}}>
                    <Header as='h2' key={this.state.activeItem}  style={{color:'white', fontFamily: 'Titillium Web'}}>{this.state.activeItem.toUpperCase()}</Header>                    
                    <div as='h6' id="infoProgress" style={{color:'white',  fontFamily: 'Titillium Web', textShadow: '1px 1px 1px #333333, 1px 1px 1px #333333'}}></div>
                </div>
            </div>
        );
    }
}