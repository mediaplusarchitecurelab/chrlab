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
            	  
            	  <div id="canvas-gui-container">
            	  	<Header as='h2' color='black' inverted text-align='center' key={this.state.activeItem}  style={{fontFamily: 'Titillium Web'}}>{this.state.activeItem.toUpperCase()}</Header>
            	  </div>
            </div>
        );
    }
}