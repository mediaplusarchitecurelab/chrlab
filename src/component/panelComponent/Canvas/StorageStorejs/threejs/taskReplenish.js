import * as THREE from 'three';

class taskReplenish {
    constructor(agv,con,stock) {
        this.prop ={
            id:'t-',
            agv:agv,
            product:null,
            con:con,
            stock:stock,
            from:new THREE.Vector3(),
            mid:new THREE.Vector3(),
            dest:new THREE.Vector3(),
            state:0.0,
            msg:'init'
        }
       this.init();
     }
    init(){
        this.prop.from = this.prop.agv.prop.basecen;
        this.prop.mid = new THREE.Vector3( this.prop.stock.prop.basecen.x +(this.prop.stock.prop.size.x*this.prop.stock.prop.open.x),
                                            this.prop.stock.prop.basecen.y,
                                            this.prop.stock.prop.basecen.z +(this.prop.stock.prop.size.z*this.prop.stock.prop.open.z));
        this.prop.dest = new THREE.Vector3( this.prop.con.prop.basecen.x +(this.prop.con.prop.size.x*this.prop.con.prop.open.x),
                                            this.prop.con.prop.basecen.y,
                                            this.prop.con.prop.basecen.z +(this.prop.con.prop.size.z*this.prop.con.prop.open.z));
    }

    setTask(agv,con,stock){
        this.prop.stock = stock;
        this.prop.con = con;
        this.prop.agv = agv;
        //console.log(this.prop.stock);
        if (this.prop.stock.prop.state >0){
            this.prop.product = this.prop.stock.prop.contain[this.prop.stock.prop.state-1];
            //console.log(this.prop.product);
        }
        this.init();
    }
    setId(v){
        this.prop.id=v;
    }
    Progress(t){ // Vector3
        let ap=this.prop.from;
        let cp=1;

        if (t<=80){
            ap = new THREE.Vector3( this.prop.from.x+(this.prop.mid.x-this.prop.from.x)*(t*0.0125),
                                    this.prop.from.y,
                                    this.prop.from.z+(this.prop.mid.z-this.prop.from.z)*(t*0.0125),
                                    );
        }else if(t<=100 && t>80){
            ap = new THREE.Vector3(this.prop.mid.x,this.prop.from.y,this.prop.mid.z);
            cp = (this.prop.mid.y-this.prop.from.y)*((t-80)*0.05);
        }else if(t<=120 && t>100){
            ap = new THREE.Vector3(this.prop.mid.x,this.prop.from.y,this.prop.mid.z);
            cp = (this.prop.mid.y-this.prop.from.y)*((120-t)*0.05);
        }else if(t<=200 && t>120){
            ap = new THREE.Vector3( this.prop.mid.x+(( this.prop.con.prop.basecen.x +(this.prop.con.prop.size.x*this.prop.con.prop.open.x)
                                                        -this.prop.mid.x)*((t-120)*0.0125)),
                                    this.prop.from.y,
                                    this.prop.mid.z+(( this.prop.con.prop.basecen.z +(this.prop.con.prop.size.z*this.prop.con.prop.open.z)
                                                        -this.prop.mid.z)*((t-120)*0.0125))
                                    );
        }else if(t<=220 && t>200){
            ap = new THREE.Vector3(this.prop.dest.x,this.prop.from.y,this.prop.dest.z);
            cp = (this.prop.dest.y-this.prop.from.y)*((t-200)*0.05);
        }else if(t<=240 && t>220){
            ap = new THREE.Vector3(this.prop.dest.x,this.prop.from.y,this.prop.dest.z);
            if (t<240){
                cp = (this.prop.dest.y-this.prop.from.y)*((240-t)*0.05);
            }
        }
        this.prop.agv.setPosition(ap);
        this.prop.agv.prop.ra.setHeight(cp);
        this.prop.state = t/240.0;
        if (this.prop.state<=1.0){
            if (this.prop.product){
                if (t>220){
                    this.prop.con.setContain(this.prop.product);
                    this.prop.product.setPosition(this.prop.con.prop.basecen);
                    this.prop.agv.prop.ra.setRemove();
                    this.prop.stock.setRemove(this.prop.product);
                    // product in container
                    this.prop.msg = '[' + this.prop.product.prop.id + '] put in [' + this.prop.con.prop.id + ']';
                }else if (t<=220 && t>100){
                    this.prop.agv.prop.ra.setContain(this.prop.product);
                    this.prop.product.setPosition(this.prop.agv.prop.ra.prop.basecen);
                    this.prop.stock.setRemove(this.prop.product);
                    this.prop.con.setRemove();
                    // product in container
                    this.prop.msg = '[' +this.prop.product.prop.id + '] on AGV (x:' + this.prop.agv.prop.basecen.x.toFixed(2) + ', y:' + this.prop.agv.prop.basecen.z.toFixed(2) + ')';
                }else{
                    this.prop.stock.addContain(this.prop.product);
                    //this.prop.product.setPosition(this.prop.stock.prop.basecen);
                    this.prop.con.setRemove();
                    this.prop.agv.prop.ra.setRemove();
                    this.prop.msg = 'AGV go to [' + this.prop.stock.prop.id + ']';
                }
            }
            if (cp>1){
                this.prop.msg += '</br>['+this.prop.agv.prop.ra.prop.id+'] on height (z:'+cp.toFixed(2)+')';
            }else{
                this.prop.msg += '</br>['+this.prop.agv.prop.ra.prop.id+'] standby...';
            }
        }
    }
    getMsg(){
        return "["+this.prop.id+"]</br>"+this.prop.msg;
    }
}
export default taskReplenish;