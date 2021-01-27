import * as THREE from 'three';

class agentRA {
    constructor(h, scene) {
        this.prop ={
            id:'ra_Z',
            agv:null,
            contain:null,
            height:h,
            basecen:new THREE.Vector3(0,0,0),
            size:new THREE.Vector3(35.0,1.0,35.0),
            state:0,
            mesh:new THREE.Group(),
            mat:new THREE.MeshBasicMaterial( {color: 0x0000ff, opacity: 0.8, transparent: true} ),
            scene:scene
        }
       this.init();
     }
    init(){
        const geop= new THREE.BoxBufferGeometry( this.prop.size.x, this.prop.size.y, this.prop.size.z );
        const geoc= new THREE.BoxBufferGeometry( 10, this.prop.height, 10 );
        var p  = new THREE.Mesh( geop, this.prop.mat );
        p.position.set(0,this.prop.height,0);
        var c  = new THREE.Mesh( geoc, this.prop.mat );
        c.position.set(0,this.prop.height*0.5,0);
        this.prop.mesh.add(p);
        this.prop.mesh.add(c);
        this.prop.scene.add(this.prop.mesh);
    }
    setAGV(v){ // Vector3
        this.prop.agv=v;
        this.prop.agv.prop.ra=this;
        this.prop.mesh.position.set(this.prop.agv.prop.basecen.x,
                                    this.prop.agv.prop.basecen.y+this.prop.agv.prop.size.y,
                                    this.prop.agv.prop.basecen.z);
    }
    agvUpdate(){
        if (this.prop.agv){
            this.prop.mesh.position.set(this.prop.agv.prop.basecen.x,
                                        this.prop.agv.prop.basecen.y+this.prop.agv.prop.size.y,
                                        this.prop.agv.prop.basecen.z);
            this.prop.basecen = new THREE.Vector3(  this.prop.agv.prop.basecen.x,
                                                    this.prop.agv.prop.basecen.y+this.prop.agv.prop.size.y+this.prop.height,
                                                    this.prop.agv.prop.basecen.z);
        }else{
            console.log('not assign agv')
        }
    }
    setHeight(v){
        var oh = parseFloat(this.prop.height.toString());
        this.prop.height=v;
        if (this.prop.mesh) {
            let p = this.prop.mesh.children[0];
            let c = this.prop.mesh.children[1];
            p.position.set(0,this.prop.height,0);
            // 避免超過 boundary
            if (this.prop.height/oh <1){
                c.geometry.scale(1,this.prop.height/oh,1);
            }
            c.position.set(0,this.prop.height*0.5,0);
        }
    }
    setSize(v){
        this.prop.size=v;
        this.setPosition(this.prop.basecen);
    }
    setContain(v){
        this.prop.contain=v;
        this.prop.state=1;
    }
    setRemove(){
        this.prop.contain=null;
        this.prop.state=0;
    }
}
export default agentRA;