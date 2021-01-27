import * as THREE from 'three';

class agentAGV {
    constructor(pv3,scene) {
        this.prop ={
            id:'na',
            basecen:pv3,
            des:new THREE.Vector3(0,0,0),
            size:new THREE.Vector3(45,25,45),
            state:1,
            mesh:new THREE.Mesh(),
            mat:new THREE.MeshBasicMaterial( {color: 0x66ff00, opacity: 0.8, transparent: true} ),
            ra:null,
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
        if (this.prop.ra) this.prop.ra.agvUpdate();
    }
    setSize(v){
        this.prop.size=v;
        this.setPosition(this.prop.basecen);
    }
    setRA(ra){
        this.prop.ra=ra;
        this.prop.ra.prop.agv=this;
    }
}
export default agentAGV;