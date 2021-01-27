import * as THREE from 'three';
import taskReplenish from './taskReplenish';

class taskSchedule {
    constructor(agv,cons,stocks) {
        this.prop ={
            agv:agv,
            cons:cons,
            stocks:stocks,
            task:null,
            table:[],
            taskframe:0,
            taskspeed:2
        }
       this.init();
     }
    init(){
        // re-stocking
        this.clearTable();
        this.prop.cons.forEach((c)=>{
            if (c.prop.state===0){
                this.prop.stocks.some((s)=>{
                    if (c.prop.type === s.prop.type){
                        if (s.prop.state>0){
                            this.addTask(this.prop.agv,c,s);
                        }else{

                        }
                        return true;
                    }
                });
            }
        });
    }
    addTask(agv,con,stock){
        this.prop.table.push({
            agv:agv,
            con:con,
            stock:stock
        });
    }
    addTaskAt(agv,con,stock,i){
        if (i<=this.prop.table.length){
            this.prop.table.splice(i,0,{
                agv:agv,
                con:con,
                stock:stock
            });
        }
    }
    clearTable(){
        this.prop.table=[];
    }
    removeTaskByStock(v){ // v as string or id
        let f =-1;
        this.prop.table.some((a,i)=>{
            if (a.stock === v || a.stock.prop.id === v){
                f=i;
                return true
            }
        });
        this.prop.table.splice(f, 1);
    }
    removeTaskByCon(v){ // v as string or id
        let f =-1;
        this.prop.table.some((a,i)=>{
            if (a.con === v || a.con.prop.id === v){
                f=i;
                return true;
            }
        });
        this.prop.table.splice(f, 1);
    }
    removeTaskByType(v){ // v as string or id
        let f =-1;
        this.prop.table.some((a,i)=>{
            if (a.con.prop.type === v){
                f=i;
                return true;
            }
        });
        this.prop.table.splice(f, 1);
    }
    tasksUpdate(){
        this.init();
        this.prop.taskframe = 0;
    }
    getInfo(i, v){
        let t = '';
        if (i===0 && v){
           t='<li style="color:yellow;">['+this.prop.table[i].stock.prop.id+'] to ['+this.prop.table[i].con.prop.id+']</li >'; 
       }else{
            t='<li style="color:white;">['+this.prop.table[i].stock.prop.id+'] to ['+this.prop.table[i].con.prop.id+']</li >'; 
       }
        return t;
    }
    getConclude(){
        let t = 'please replenish stocks: ';
        this.prop.stocks.forEach((s)=>{
            if (s.prop.state===0){
                t+= s.prop.id +'['+s.prop.type+'], ';
            }
        })
        return t.slice(0, -2);
    }
    getTime(){
        return this.prop.taskframe;
    }
    run(){
        if (this.prop.taskframe<=240){
            this.prop.taskframe += this.prop.taskspeed;
        }
    }
}
export default taskSchedule;