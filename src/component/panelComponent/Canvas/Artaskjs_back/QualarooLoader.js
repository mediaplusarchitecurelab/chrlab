import Script from '@gumgum/react-script-tag';
import React from 'react';

var scene, camera, renderer, clock, deltaTime, totalTime;
var arToolkitSource, arToolkitContext;
var markerRoot1, markerRoot2;
var mesh1;

class QualarooLoader extends React.Component {
    _onCreate = () => {
        window.THREE = window.THREE || [];
    };
    
    _onSuccess = () => {
        //const userStr = localStorage.getItem('user');
        //const user = JSON.parse(userStr);
        //if (!user) return;

        //const email = user.email;
        //window._kiq.push(['identify', email]);
        scene = new window.THREE.Scene();
    };
    
    _onError = error => {
        throw new Error(`Could not load ${error.outerHTML}`);
    };

    render() {
        return (
            <Script
                src="./assets/arbuild/js/three.js"
                type="text/javascript"
                onCreate={this._onCreate}
                onSuccess={this._onSuccess}
                onError={this._onError}
                defer
            />
        );
    }
}

export default QualarooLoader;