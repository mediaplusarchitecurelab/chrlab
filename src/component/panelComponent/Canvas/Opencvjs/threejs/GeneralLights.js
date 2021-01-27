import * as THREE from 'three'

//import { RectAreaLightUniformsLib } from '../../threejs/examples/jsm/lights/RectAreaLightUniformsLib.js';
//import { RectAreaLightHelper } from '../../threejs/examples/jsm/helpers/RectAreaLightHelper.js';

export default scene => {    
//lights
/*
                var width = 50;
                var height = 50;
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
*/                
/*                
    const lightAmbient = new THREE.AmbientLight( 0xcccccc,0.4 );
//    const lightSpot = new THREE.SpotLight( 0xffffff );
    const lightDirect = new THREE.DirectionalLight( 0xffffff, 1.3 );

    //spot light
    lightSpot.angle = Math.PI / 5;
    lightSpot.penumbra = 0.2;
    lightSpot.position.set( 2, 3, 3 );
    lightSpot.castShadow = true;
    lightSpot.shadow.camera.near = 3;
    lightSpot.shadow.camera.far = 10;
    lightSpot.shadow.mapSize.width = 1024;
    lightSpot.shadow.mapSize.height = 1024;
   
    // direct light
    lightDirect.position.set( 10, 10, -10 );
    lightDirect.castShadow = true;
    lightDirect.lightProbeIntensity=1.0;
    lightDirect.directionalLightIntensity=0.2;
    lightDirect.envMapIntensity=1;
    /*
    lightDirect.shadow.camera.near = 1;
    lightDirect.shadow.camera.far = 10;
    lightDirect.shadow.camera.right = 1;
    lightDirect.shadow.camera.left = - 1;
    lightDirect.shadow.camera.top  = 1;
    lightDirect.shadow.camera.bottom = - 1;
    
    lightDirect.shadow.mapSize.width = 1024;
    lightDirect.shadow.mapSize.height = 1024;
    
    // add light            
    scene.add(lightAmbient);
    scene.add(lightDirect);

    //moving light
    const particleLight1 = new THREE.PointLight( 0xff3333, 0.15);
    const particleLight2 = new THREE.PointLight( 0x3333ff, 0.15);

    particleLight1.position.y = 10;
    particleLight2.position.y = 10;

    scene.add( particleLight1 );
    scene.add( particleLight2 );

    const startTime = Date.now();
*/

    function update() {
        /*
            var currentTime = Date.now();
            var timer = ( currentTime - startTime ) / 4000;

            particleLight1.position.x = Math.sin( timer * 3 ) * 10;
            particleLight1.position.z = Math.cos( timer * 3 ) * 10;

            particleLight2.position.x = Math.sin( timer * 3 ) * -10;
            particleLight2.position.z = Math.cos( timer * 3 ) * -10;
            //console.log('a');
        */
    }

    return {
        update
    }
}