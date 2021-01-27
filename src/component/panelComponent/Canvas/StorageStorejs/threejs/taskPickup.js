import * as THREE from 'three';

class taskPickup {
    constructor(agv,con,stock) {
        this.prop ={
            id:'na',
            agv:agv,
            product:null,
            con:con,
            stock:stock,
            from:new THREE.Vector3(),
            dest:new THREE.Vector3(),
            state:0.0
        }
       this.init();
     }
    init(){
        this.prop.from = this.prop.agv.prop.basecen;
        this.prop.dest = new THREE.Vector3( this.prop.con.prop.basecen.x +(this.prop.con.prop.size.x*this.prop.con.prop.open.x),
                                            this.prop.con.prop.basecen.y,
                                            this.prop.con.prop.basecen.z +(this.prop.con.prop.size.z*this.prop.con.prop.open.z));
        //console.log(this.prop.dest);
    }
    setContainer(agv,con){
        this.prop.con = con;
        this.prop.agv = agv;
        this.prop.product = this.prop.con.prop.contain;
        this.init();
    }
    Progress(t){ // Vector3
        let ap=this.prop.from;
        let cp=1;

        if (t<=80){
            ap = new THREE.Vector3( this.prop.from.x+(this.prop.dest.x-this.prop.from.x)*(t*0.0125),
                                    this.prop.from.y,
                                    this.prop.from.z+(this.prop.dest.z-this.prop.from.z)*(t*0.0125),
                                    );
        }else if(t<=100 && t>80){
            ap = new THREE.Vector3(this.prop.dest.x,this.prop.from.y,this.prop.dest.z);
            cp = (this.prop.dest.y-this.prop.from.y)*((t-80)*0.05);
        }else if(t<=120 && t>100){
            ap = new THREE.Vector3(this.prop.dest.x,this.prop.from.y,this.prop.dest.z);
            cp = (this.prop.dest.y-this.prop.from.y)*((120-t)*0.05);
        }else{
            ap = new THREE.Vector3( this.prop.dest.x+(( this.prop.stock.prop.basecen.x +(this.prop.stock.prop.size.x*this.prop.stock.prop.open.x)
                                                        -this.prop.dest.x)*((t-120)*0.0125)),
                                    this.prop.from.y,
                                    this.prop.dest.z+(( this.prop.stock.prop.basecen.z +(this.prop.stock.prop.size.z*this.prop.stock.prop.open.z)
                                                        -this.prop.dest.z)*((t-120)*0.0125))
                                    );
        }
        this.prop.agv.setPosition(ap);
        this.prop.agv.prop.ra.setHeight(cp);
        this.prop.state = t/200.0;
        if (this.prop.state<1.0){
            if (this.prop.product){
                if (t<100){
                    this.prop.con.setContain(this.prop.product);
                    this.prop.product.setPosition(this.prop.con.prop.basecen);
                    this.prop.agv.prop.ra.setRemove();
                }else {
                    this.prop.agv.prop.ra.setContain(this.prop.product);
                    this.prop.product.setPosition(this.prop.agv.prop.ra.prop.basecen);
                    this.prop.con.setRemove();
                }
            }
        }
    }
}
export default taskPickup;