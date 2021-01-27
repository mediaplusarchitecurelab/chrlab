import * as THREE from 'three';
import * as dat from 'dat.gui';

export default scene => {
    const maxParticleCount = 1000;
    const particleCount = 100;
    const r = 800;
    const rHalf = r / 2;
    const effectController = {
                showDots: true,
                showLines: true,
                minDistance: 150,
                limitConnections: false,
                maxConnections: 20,
                particleCount: 200
        };
    const group = new THREE.Group();
    const customContainer = document.getElementById('canvas-gui-container');

    var particles;
    var particlesData = [];
    var positions, colors;
    var pointCloud;
    var particlePositions;
    var linesMesh;
    var gui = new dat.GUI({ autoPlace: false }); 

    // =========CONSTANT==========
    // GUI
    function initGUI() {
        gui.add( effectController, "showDots" ).onChange( function ( value ) {
            pointCloud.visible = value;
            } );
        gui.add( effectController, "showLines" ).onChange( function ( value ) {
            linesMesh.visible = value;
            } );
        gui.add( effectController, "minDistance", 10, 300 );
        gui.add( effectController, "limitConnections" );
        gui.add( effectController, "maxConnections", 0, 30, 1 );
                    
        customContainer.appendChild(gui.domElement);                
    }

    // =========EXCUTE==========
    init();

    function init() {
        initGUI();

        const helper = new THREE.BoxHelper( new THREE.Mesh( new THREE.BoxBufferGeometry( r, r, r ) ) );
        helper.material.color.setHex( 0x101010 );
        helper.material.blending = THREE.AdditiveBlending;
        helper.material.transparent = true;
        group.add( helper );
        scene.add( group );

        const segments = maxParticleCount * maxParticleCount;

        positions = new Float32Array( segments * 3 );
        colors = new Float32Array( segments * 3 );
        var pMaterial = new THREE.PointsMaterial( {
                    color: 0xFFFFFF,
                    size: 3,
                    blending: THREE.AdditiveBlending,
                    transparent: true,
                    sizeAttenuation: false
                } );
        particles = new THREE.BufferGeometry();
        particlePositions = new Float32Array( maxParticleCount * 3 );

        for ( var i = 0; i < maxParticleCount; i ++ ) {
                    var x = Math.random() * r - r / 2;
                    var y = Math.random() * r - r / 2;
                    var z = Math.random() * r - r / 2;
                    particlePositions[ i * 3 ] = x;
                    particlePositions[ i * 3 + 1 ] = y;
                    particlePositions[ i * 3 + 2 ] = z;
                    // add it to the geometry
                    particlesData.push( {
                        velocity: new THREE.Vector3( - 1 + Math.random() * 2, - 1 + Math.random() * 2, - 1 + Math.random() * 2 ),
                        numConnections: 0
                    } );
                }
        
        particles.setDrawRange( 0, particleCount );
        particles.addAttribute( 'position', new THREE.BufferAttribute( particlePositions, 3 ).setDynamic( true ) );
        
        // create the particle system
        pointCloud = new THREE.Points( particles, pMaterial );
        group.add( pointCloud );
        const geometry = new THREE.BufferGeometry();
        geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ).setDynamic( true ) );
        geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ).setDynamic( true ) );
        geometry.computeBoundingSphere();
        geometry.setDrawRange( 0, 0 );
        const material = new THREE.LineBasicMaterial( {
                    vertexColors: THREE.VertexColors,
                    blending: THREE.AdditiveBlending,
                    transparent: true
                } );
        linesMesh = new THREE.LineSegments( geometry, material );
        group.add( linesMesh );


        /*
        var geometry = new THREE.BufferGeometry();

        // ============ATTRIBUTES MAP================
        var positions = [];
        var colors = [];

        // ============VIRABLE VALUE================
        let color = new THREE.Color();

        let n = 1000, n2 = n / 2; // particles spread in the cube

        for ( let i = 0; i < particles; i ++ ) {
            let x = Math.random() * n - n2;
            let y = Math.random() * n - n2;
            let z = Math.random() * n - n2;
            positions.push( x, y, z ); 

            // colors
            let vx = ( x / n ) + 0.5;
            let vy = ( y / n ) + 0.5;
            let vz = ( z / n ) + 0.5;
            color.setRGB( vx, vy, vz );
            colors.push( color.r, color.g, color.b );
         }
        
        geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
        geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

        geometry.computeBoundingSphere();

        let material = new THREE.PointsMaterial({
            size: 15, vertexColors: THREE.VertexColors }
         );

        let points = new THREE.Points( geometry, material );
        scene.add( points );
        */
    }
/*    
    function deformGeometry(geometry) {
        for (let i=0; i<geometry.vertices.length; i+=2) {
            const scalar = 1 + Math.random()*0.8;
            geometry.vertices[i].multiplyScalar(scalar)
        }

        return geometry;
    }
*/
    function update(time) {
        
        var vertexpos = 0;
                var colorpos = 0;
                var numConnected = 0;
                for ( var k = 0; k < particleCount; k ++ ) { particlesData[ k ].numConnections = 0; }
                for ( var i = 0; i < particleCount; i ++ ) {
                    // get the particle
                    var particleData = particlesData[ i ];
                    particlePositions[ i * 3 ] += particleData.velocity.x;
                    particlePositions[ i * 3 + 1 ] += particleData.velocity.y;
                    particlePositions[ i * 3 + 2 ] += particleData.velocity.z;
                    if ( particlePositions[ i * 3 + 1 ] < - rHalf || particlePositions[ i * 3 + 1 ] > rHalf )
                        particleData.velocity.y = - particleData.velocity.y;
                    if ( particlePositions[ i * 3 ] < - rHalf || particlePositions[ i * 3 ] > rHalf )
                        particleData.velocity.x = - particleData.velocity.x;
                    if ( particlePositions[ i * 3 + 2 ] < - rHalf || particlePositions[ i * 3 + 2 ] > rHalf )
                        particleData.velocity.z = - particleData.velocity.z;
                    if ( effectController.limitConnections && particleData.numConnections >= effectController.maxConnections )
                        continue;
                    // Check collision
                    for ( var j = i + 1; j < particleCount; j ++ ) {
                        var particleDataB = particlesData[ j ];
                        if ( effectController.limitConnections && particleDataB.numConnections >= effectController.maxConnections )
                            continue;
                        var dx = particlePositions[ i * 3 ] - particlePositions[ j * 3 ];
                        var dy = particlePositions[ i * 3 + 1 ] - particlePositions[ j * 3 + 1 ];
                        var dz = particlePositions[ i * 3 + 2 ] - particlePositions[ j * 3 + 2 ];
                        var dist = Math.sqrt( dx * dx + dy * dy + dz * dz );
                        if ( dist < effectController.minDistance ) {
                            particleData.numConnections ++;
                            particleDataB.numConnections ++;
                            var alpha = 1.0 - dist / effectController.minDistance;
                            positions[ vertexpos ++ ] = particlePositions[ i * 3 ];
                            positions[ vertexpos ++ ] = particlePositions[ i * 3 + 1 ];
                            positions[ vertexpos ++ ] = particlePositions[ i * 3 + 2 ];
                            positions[ vertexpos ++ ] = particlePositions[ j * 3 ];
                            positions[ vertexpos ++ ] = particlePositions[ j * 3 + 1 ];
                            positions[ vertexpos ++ ] = particlePositions[ j * 3 + 2 ];
                            colors[ colorpos ++ ] = alpha;
                            colors[ colorpos ++ ] = alpha;
                            colors[ colorpos ++ ] = alpha;
                            colors[ colorpos ++ ] = alpha;
                            colors[ colorpos ++ ] = alpha;
                            colors[ colorpos ++ ] = alpha;
                            numConnected ++;
                        }
                    }
                }
                linesMesh.geometry.setDrawRange( 0, numConnected * 2 );
                linesMesh.geometry.attributes.position.needsUpdate = true;
                linesMesh.geometry.attributes.color.needsUpdate = true;
                pointCloud.geometry.attributes.position.needsUpdate = true;
                //requestAnimationFrame( update );
            }

        /*
        let positions = particles.geometry.attributes.position.array;
        let scales = particles.geometry.attributes.scale.array;
        //let colors = particles.geometry.attributes.color.array;

        //let color = new THREE.Color();
        let i = 0, j = 0;
        for ( var ix = 0; ix < AMOUNTX; ix ++ ) {
            for ( var iy = 0; iy < AMOUNTY; iy ++ ) {
                // ========================= MOTION Y =========================
                positions[ i + 1 ] = ( Math.sin( ( ix + count ) * 0.3 ) * 150 ) +
                                ( Math.sin( ( iy + count ) * 0.5 ) * 150 );
                scales[ j ] = ( Math.sin( ( ix + count ) * 0.3 ) + 1 ) * 5 +
                                ( Math.sin( ( iy + count ) * 0.5 ) + 1 ) * 5;

                //color.setHSL( i / numParticles / 2, 1.0, 0.5 );

                //colors[ i ] = Math.sin(iy + count ); 

                i += 3;
                j ++;
            }
        }
        particles.geometry.attributes.position.needsUpdate = true;
        particles.geometry.attributes.scale.needsUpdate = true;
        particles.geometry.attributes.color.needsUpdate = true;
        count += 0.05;
        */

    return {
        update
    }
}