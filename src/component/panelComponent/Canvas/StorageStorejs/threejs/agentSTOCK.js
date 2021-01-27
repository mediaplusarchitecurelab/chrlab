import * as THREE from 'three';
import agentProduct from './agentProduct';

class agentSTOCK {
    constructor(pv3,scene) {
        this.prop ={
            id:'na',
            type:'p-3',
            contain:[],
            basecen:pv3,
            rnp:0,
            open:new THREE.Vector3(-1,0.0,0.0),
            size:new THREE.Vector3(75.0,60.0,80.0),
            state:1,
            sel:false,
            mesh:new THREE.Mesh(),
            mat:new THREE.MeshBasicMaterial( {color: 0x10aaff, opacity: 0.2, transparent: true, wireframe:true} ),
            scene:scene,
            dom:null
        }
       this.init();
     }
    init(){
        const geo= new THREE.BoxBufferGeometry( this.prop.size.x, this.prop.size.y, this.prop.size.z );
        this.prop.mesh  = new THREE.Mesh( geo, this.prop.mat );
        this.prop.scene.add(this.prop.mesh);
        this.setPosition( this.prop.basecen);
        // dom
        this.prop.dom = document.createElement('button');
        this.prop.dom.id = this.prop.id+'-btn';
        this.prop.dom.innerHTML = '+';
        this.prop.dom.style.fontSize='11px';
        this.prop.dom.style.padding='1px';
        this.prop.dom.style.margin='1px';
        this.prop.dom.style.backgroundColor='rgba(0,0,0)';
        this.prop.dom.style.color='white';
        this.prop.dom.style.border='none';
        this.prop.dom.style.cursor='pointer';
        this.prop.dom.addEventListener("mouseenter",()=> {
            this.prop.dom.style.backgroundColor='rgba(255,0,0,0.8)';
        });
        this.prop.dom.addEventListener("mouseout",()=> {
            this.prop.dom.style.backgroundColor='rgba(0,0,0)';
        });
        this.prop.dom.addEventListener("click",()=> {
            let np = new agentProduct(this.prop.basecen,this.prop.type,this.prop.scene);
            np.setId('psn-'+this.prop.type+'-rnp-'+this.prop.rnp);
            this.prop.rnp+=1;
            this.addContain(np);
        });
    }
    setPosition(v){ // Vector3
        this.prop.basecen=v;
        // Hight modify
        this.prop.mesh.position.set(this.prop.basecen.x,this.prop.basecen.y+this.prop.size.y*0.5,this.prop.basecen.z);
    }
    setType(v){
        this.prop.type=v;
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
    setSize(v){
        this.prop.size=v;
        this.setPosition(this.prop.basecen);
    }
    addContain(v){
        let f = -1;
        this.prop.contain.some((p,i)=>{
                    if(p.prop.id===v.prop.id){
                        f =i;
                        return true;
                    }
        });
        if (f<0){
            this.prop.contain.push(v);
            v.setPosition(this.prop.basecen);
        }
        this.prop.state=this.prop.contain.length;
    }
    setRemove(v){
        let f = -1;
        this.prop.contain.some((p,i)=>{
                if(p.prop.id===v.prop.id){
                    f = i;
                    return true;
                }
        });
        if (f>=0){
            this.prop.contain.splice(f, 1);
        }
        this.prop.state=this.prop.contain.length;
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
export default agentSTOCK;