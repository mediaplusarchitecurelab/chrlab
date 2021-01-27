import React, { Component } from 'react';
import threeEntryPoint from "./threejs/threeEntryPoint";
import "./canvas.css";

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
    	const stockStyle = {
          position: 'absolute',
          right:'5%',
          left:'85%',
          fontFamily:'Tahoma',
          fontSize:'0.6em',
          textAlign: 'right'
        };
        const conStyle = {
          position: 'absolute',
          right:'15%',
          left:'75%',
          fontFamily:'Tahoma',
          fontSize:'0.6em',
          textAlign: 'right'
        };
        const tasksStyle = {
          position: 'absolute',
          right:'70%',
          left:'20%',
          fontFamily:'Tahoma',
          fontSize:'0.6em',
          textAlign: 'right'
        };
        const msgStyle = {
          position: 'absolute',
          transform: 'translate(-50%)',
          left:'50%',
          bottom:'5%',
          fontFamily:'Tahoma',
          fontSize:'0.6em',
          color:'red'
        };
        return (
            <div id="panel-canvas" className="panel-canvas" ref={element => this.threeRootElement = element}>
            	  
            	<div id="canvas-gui-container">
                </div>
                <div id="stockdata" style={stockStyle}>
                    loadding...
                </div>
                <div id="condata" style={conStyle}>
                    loadding...
                </div>
                <div id="tasksdata" style={tasksStyle}>
                    loadding...
                </div>
                <div id="msgdata" style={msgStyle}>
                    waiting...
                </div>
            </div>
        );
    }
}