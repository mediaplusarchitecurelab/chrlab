import * as THREE from '../../threejs/src/Three.js';
import * as dat from 'dat.gui';

class customCanvas extends THREE.Scene{
    
}

export default scene => {

    const group = new THREE.Group();
    const customContainer = document.getElementById('canvas-gui-container');
    const renderer = document.getElementById('canvas-gui-container');

    var object, material, localPlane, globalPlane;
    var gui = new dat.GUI({ autoPlace: false }); 

    // =========CONSTANT==========
    // GUI
   
    function initGUI() {
         var folderLocal = gui.addFolder( 'Local Clipping' );

         var propsLocal = {
                        get 'Enabled'() {
                            return renderer.localClippingEnabled;
                        },
                        set 'Enabled'( v ) {
                            renderer.localClippingEnabled = v;
                        },
                        get 'Shadows'() {
                            return material.clipShadows;
                        },
                        set 'Shadows'( v ) {
                            material.clipShadows = v;
                        },
                        get 'Plane'() {
                            return localPlane.constant;
                        },
                        set 'Plane'( v ) {
                            localPlane.constant = v;
                        }
                    };

         folderLocal.add( propsLocal, 'Enabled' );
         folderLocal.add( propsLocal, 'Shadows' );
         folderLocal.add( propsLocal, 'Plane', 0.3, 1.25 );
      /*   
        gui.add( effectController, "showLines" ).onChange( function ( value ) {
            linesMesh.visible = value;
            } );
                    
        
       
        var propsLocal = {
                        get 'Enabled'() {
                            return renderer.localClippingEnabled;
                        },
                        set 'Enabled'( v ) {
                            renderer.localClippingEnabled = v;
                        },
                        get 'Shadows'() {
                            return material.clipShadows;
                        },
                        set 'Shadows'( v ) {
                            material.clipShadows = v;
                        },
                        get 'Plane'() {
                            return localPlane.constant;
                        },
                        set 'Plane'( v ) {
                            localPlane.constant = v;
                        }
                    };
        
                    
                    folderGlobal = gui.addFolder( 'Global Clipping' ),
                    propsGlobal = {
                        get 'Enabled'() {
                            return renderer.clippingPlanes !== Empty;
                        },
                        set 'Enabled'( v ) {
                            renderer.clippingPlanes = v ? globalPlanes : Empty;
                        },
                        get 'Plane'() {
                            return globalPlane.constant;
                        },
                        set 'Plane'( v ) {
                            globalPlane.constant = v;
                        }
                    };
                folderLocal.add( propsLocal, 'Enabled' );
                folderLocal.add( propsLocal, 'Shadows' );
                folderLocal.add( propsLocal, 'Plane', 0.3, 1.25 );
                folderGlobal.add( propsGlobal, 'Enabled' );
                folderGlobal.add( propsGlobal, 'Plane', - 0.4, 3 );
         */   
        customContainer.appendChild(gui.domElement);                
    }
    

    // =========EXCUTE==========
    init();

    function init() {
        
        
        var localPlane = new THREE.Plane( new THREE.Vector3( 0, - 1, 0 ), 0.8 );
        var globalPlane = new THREE.Plane( new THREE.Vector3( - 1, 0, 0 ), 0.1 );

        // Geometry
        var material = new THREE.MeshPhongMaterial( {
                    color: 0x80ee10,
                    shininess: 100,
                    side: THREE.DoubleSide,
                    // ***** Clipping setup (material): *****
                    clippingPlanes: [ localPlane ],
                    clipShadows: true
                } );
        var geometry = new THREE.TorusKnotBufferGeometry( 0.4, 0.08, 95, 20 );
        object = new THREE.Mesh( geometry, material );
        object.castShadow = true;
        
        
        var ground = new THREE.Mesh(
                    new THREE.PlaneBufferGeometry( 9, 9, 1, 1 ),
                    new THREE.MeshPhongMaterial( { color: 0xa0adaf, shininess: 150 } )
        );
        ground.rotation.x = - Math.PI / 2; // rotates X/Y to X/Z
        ground.receiveShadow = true;

        scene.add( object );
        scene.add( ground );

        initGUI();
    }
    function update(time) {
        
        
    }


    return {
        update
    }
}