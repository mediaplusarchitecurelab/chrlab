import * as THREE from 'three';

class agentProduct {
    constructor(pv3,type,scene) {
        this.prop ={
            id:'na',
            type:type,
            basecen:pv3,
            size:new THREE.Vector3(30.0,30.0,30.0),
            open:new THREE.Vector3(1,0.0,0.0),
            mesh: new THREE.Mesh(),
            mat:new THREE.MeshBasicMaterial( {color: 0xff0000, opacity: 0.8, transparent: true} ),
            scene:scene
        }
       this.init();
     }
    init(){
        const geo= new THREE.BoxBufferGeometry( this.prop.size.x, this.prop.size.y, this.prop.size.z );
        this.prop.mesh = new THREE.Mesh( geo, this.prop.mat );
        this.prop.scene.add(this.prop.mesh);
        this.setPosition( this.prop.basecen);
    }
    setPosition(v){
        this.prop.basecen=v;
        // Hight modify
        this.prop.mesh.position.set(this.prop.basecen.x,this.prop.basecen.y+this.prop.size.y*0.5,this.prop.basecen.z);
    }
    setSize(v){
        this.prop.size=v;
        this.setPosition(this.prop.basecen);
    }
    setId(v){
        this.prop.id=v;
    }
    setRemove(){
        this.prop.scene.remove(this.prop.mesh);
        this.prop.mesh.geometry.dispose();
        this.prop.mesh.material.dispose();
        this.prop.mesh = undefined;
    }
}
export default agentProduct;