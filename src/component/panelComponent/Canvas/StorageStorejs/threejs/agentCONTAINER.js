import * as THREE from 'three';
import agentProduct from './agentProduct';

class agentCONTAINER {
    constructor(pv3,scene) {
        this.prop ={
            id:'na',
            type:'p-3',
            contain:null,
            basecen:pv3,
            size:new THREE.Vector3(45.0,45.0,45.0),
            open:new THREE.Vector3(1,0.0,0.0),
            state:0,
            sel:false,
            mesh:new THREE.Mesh(),
            mat:new THREE.MeshBasicMaterial( {color: 0xaaffff, opacity: 0.2, transparent: true, wireframe:true} ),
            //pmat:new THREE.MeshBasicMaterial( {color: 0xff0000, opacity: 0.8, transparent: true} ),
            scene:scene,
            dom:null
        }
       this.init();
     }
    init(){
        const geo= new THREE.BoxBufferGeometry( this.prop.size.x, this.prop.size.y, this.prop.size.z );
        this.prop.mesh = new THREE.Mesh( geo, this.prop.mat );
        //const pgeo= new THREE.BoxBufferGeometry( this.prop.size.x*0.6, this.prop.size.y*0.6, this.prop.size.z*0.6 );
        //this.prop.mesh.add(new THREE.Mesh( geo, this.prop.mat ));
        //this.prop.mesh.add(new THREE.Mesh( pgeo, this.prop.pmat ));
        this.prop.scene.add(this.prop.mesh);
        this.setPosition( this.prop.basecen);

        // dom
        this.prop.dom = document.createElement('button');
        this.prop.dom.id = this.prop.id+'-btn';
        this.prop.dom.innerHTML = '-';
        this.prop.dom.style.fontSize='11px';
        this.prop.dom.style.padding='1px 3px';
        this.prop.dom.style.margin='1px';
        this.prop.dom.style.backgroundColor='rgba(0,0,0)';
        this.prop.dom.style.color='white';
        this.prop.dom.style.border='none';
        this.prop.dom.style.cursor='pointer';
        //this.prop.dom.style.cursor.display='inline-block';
        this.prop.dom.addEventListener("mouseenter",()=> {
            this.prop.dom.style.backgroundColor='rgba(255,0,0,0.8)';
        });
        this.prop.dom.addEventListener("mouseout",()=> {
            this.prop.dom.style.backgroundColor='rgba(0,0,0)';
        });
        this.prop.dom.addEventListener("click",()=> {
            if (this.prop.state===1){
                this.prop.contain.setRemove();
                this.setRemove();
            }
        });
    }
    setType(v){
        this.prop.type=v;
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
    setSel(){
        this.prop.sel=true;
    }
    setDesel(){
        this.prop.sel=false;
    }
    setId(v){
        this.prop.id=v;
    }
    setContain(v){
        this.prop.contain=v;
        this.prop.state=1;
    }
    setRemove(){
        this.prop.contain=null;
        this.prop.state=0;
    }
    getInfo(){
        let t = '';
        if (this.prop.sel){
            t='<li id="'+this.prop.id+'" style="color:yellow;">'+this.prop.id+'('+this.prop.type+') : '+this.prop.state+' </li >';
        }else{
            if (this.prop.state===0){
                t='<li id="'+this.prop.id+'" style="color:red;">'+this.prop.id+'('+this.prop.type+') : '+this.prop.state+' </li >';
            }else{
                t='<li id="'+this.prop.id+'" style="color:white;">'+this.prop.id+'('+this.prop.type+') : '+this.prop.state+' </li >';
            }
            
        }
        return t;
    }
    assignDom(){
        document.getElementById(this.prop.id).appendChild(this.prop.dom);
    }
}
export default agentCONTAINER;