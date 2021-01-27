import * as THREE from 'three'
//import alphaTexture from './assets/textures/stripes_gradient.jpg';

export default scene => {
    // =========CONSTANT==========
    //const group = new THREE.Group();
    const SEPARATION = 80, AMOUNTX = 60, AMOUNTY = 60;
    const numParticles = AMOUNTX * AMOUNTY;
    //const speed = 0.02;
    //const textureOffsetSpeed = 0.02;
    // =========PARTICLES MAP==========
    
    // =========EXCUTE==========
    var particles, count = 0;
    // =========EXCUTE==========
    init();

    function init() {
        // ============ATTRIBUTES MAP================
        var positions = new Float32Array( numParticles * 3 );
        var colors = new Float32Array( numParticles * 3 );
        var scales = new Float32Array( numParticles );

        // ============VIRABLE VALUE================
        let color = new THREE.Color();

        var i = 0, j = 0;
        for ( var ix = 0; ix < AMOUNTX; ix ++ ) {
            for ( var iy = 0; iy < AMOUNTY; iy ++ ) {
                positions[ i ] = ix * SEPARATION - ( ( AMOUNTX * SEPARATION ) / 2 ); // x
                positions[ i + 1 ] = 0; // y
                positions[ i + 2 ] = iy * SEPARATION - ( ( AMOUNTY * SEPARATION ) / 2 ); // z
                scales[ j ] = 1;

                color.setHSL( i / numParticles/2, 1.0, 0.5 );

                colors[ i ] = color.r; //
                colors[ i + 1 ] = color.g; //
                colors[ i + 2 ] = color.b; // 

                i += 3;
                j ++;
            }
         }
        
        var geometry = new THREE.BufferGeometry();
        geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
        geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
        geometry.addAttribute( 'scale', new THREE.Float32BufferAttribute( scales, 1 ) );

        var material = new THREE.ShaderMaterial( {
                uniforms: {
                    // 外部資料放在public底下
                    texture: { value: new THREE.TextureLoader().load( "./assets/textures/sprites/ball.png" ) }
                },
                vertexShader: document.getElementById( 'vertexshader' ).textContent,
                fragmentShader: document.getElementById( 'fragmentshader' ).textContent,

                blending: THREE.AdditiveBlending,
                depthTest: false,
                transparent: true,
                vertexColors: true
        } );

        particles = new THREE.Points( geometry, material );
        scene.add( particles );
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
        let positions = particles.geometry.attributes.position.array;
        let scales = particles.geometry.attributes.scale.array;
        //let colors = particles.geometry.attributes.color.array;

        //let color = new THREE.Color();
        let i = 0, j = 0;
        for ( var ix = 0; ix < AMOUNTX; ix ++ ) {
            for ( var iy = 0; iy < AMOUNTY; iy ++ ) {
                // ========================= MOTION Y =========================
                positions[ i + 1 ] = ( Math.sin( ( ix + count ) * 0.3 ) * 100 ) +
                                ( Math.sin( ( iy + count ) * 0.5 ) * 100 );
                scales[ j ] = ( Math.sin( ( ix + count ) * 0.3 ) + 1 ) * 7 +
                                ( Math.sin( ( iy + count ) * 0.5 ) + 1 ) * 7;

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
    }

    return {
        update
    }
}