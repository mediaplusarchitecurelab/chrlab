import * as THREE from 'three';

class agentSTOCK {
    constructor(pv3,scene) {
        this.prop ={
            id:'na',
            contain:[],
            basecen:pv3,
            open:new THREE.Vector3(-1,0.0,0.0),
            size:new THREE.Vector3(75.0,120.0,240.0),
            state:1,
            mesh:new THREE.Mesh(),
            mat:new THREE.MeshBasicMaterial( {color: 0xff10ff, opacity: 0.8, transparent: true} ),
            scene:scene
        }
       this.init();
     }
    init(){
        const geo= new THREE.BoxBufferGeometry( this.prop.size.x, this.prop.size.y, this.prop.size.z );
        this.prop.mesh  = new THREE.Mesh( geo, this.prop.mat );
        this.prop.scene.add(this.prop.mesh);
        this.setPosition( this.prop.basecen);
    }
    setPosition(v){ // Vector3
        this.prop.basecen=v;
        // Hight modify
        this.prop.mesh.position.set(this.prop.basecen.x,this.prop.basecen.y+this.prop.size.y*0.5,this.prop.basecen.z);
    }
    setSize(v){
        this.prop.size=v;
        this.setPosition(this.prop.basecen);
    }
    addContain(v){
        this.prop.contain.push(v);
    }
}
export default agentSTOCK;