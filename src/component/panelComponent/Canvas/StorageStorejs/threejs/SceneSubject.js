import * as THREE from 'three';
import * as dat from 'dat.gui';
import agentAGV from './agentAGV';
import agentCONTAINER from './agentCONTAINER';
import agentSTOCK from './agentSTOCK';
import agentRA from './agentRA';
import agentProduct from './agentProduct';

import taskReplenish from './taskReplenish';
import taskSchedule from './taskSchedule';

export default scene => {
    const maxParticleCount = 1000;
    const particleCount = 100;    
    const w = 800.0;
    const h = 450.0;
    const d = 1200.0;
    const r =800.0;
    const effectController = {
                showDots: true,
                showLines: true,
                limitConnections: false,
                maxConnections: 20,
                particleCount: 200,
                AGV_X:0,
                AGV_Y:0,
                RA_Height:1,
                stockProduct:'loading...',
                productName:'input...[p-3]',
                task: false,
                task_con_num:25,
                task_Time:0,
                task_execute:false
        };
    const group = new THREE.Group();
    const customContainer = document.getElementById('canvas-gui-container');

    var stocksize = new THREE.Vector3(75.0,60.0,75.0);
    var consize = new THREE.Vector3(45.0,45.0,45.0);
    var congap = new THREE.Vector3(5.0,5.0,5.0);
    var agvsize = new THREE.Vector3(60.0,25.0,60.0);

    var particles;
    var particlesData = [];
    var positions, colors;
    var pointCloud;
    var particlePositions;
    var linesMesh;
    var gui = new dat.GUI({ autoPlace: false }); 

    var cons=[];
    var stocks=[];
    var tasks;
    var agv,ra,stock;
    var task,selcon, selstock;
    var conRow = 3
    var conCol = 6;
    var stockRow = 2
    var stockCol = 9;
    var stockTable, conTable, tasksTable, msg;
    var stockval='';
    var conval='';
    var tasksval='';
    var msgval='wait for new task, input productName...';
    var nowtask=0;
    var animate=false;
    // =========CONSTANT==========
    // GUI
    function initGUI() {
        var f1 = gui.addFolder('MANNUAL');
        var f2 = gui.addFolder('TASK');
        var f3 = gui.addFolder('EXECUTE');
        f1.add( effectController, "AGV_X", -0.5*w, 0.5*w ).listen();
        f1.add( effectController, "AGV_Y", -0.5*d, 0.5*d ).listen();
        f1.add( effectController, "RA_Height", 1.0, 300.0 ).listen();
        f2.add( effectController, "stockProduct").listen();
        f2.add( effectController, "productName" ).onFinishChange((v)=> {
            if (!effectController.task){
                let f = -1;
                cons.some((c,i)=>{
                    if (c.prop.type){
                        if(c.prop.type===v){
                            f =i;
                            return true;
                        }
                    }
                });
                let sf = -1;
                stocks.some((st,i)=>{
                    if (st.prop.type){
                        if(st.prop.type===v){
                            sf =i;
                            return true;
                        }
                    }
                });
                if (sf>=0 && f>=0){
                    selcon = cons[f];
                    selstock = stocks[sf];
                    selstock.setSel();
                    selcon.setSel();
                    //effectController.taskmessage='select: '+selcon.prop.id+' & '+selstock.prop.id;
                    if (task){
                        task.setTask(agv,selcon,selstock);
                    }
                }else{
                    //effectController.taskmessage='no product...';
                }
            }
        }).listen();
        f2.add( effectController, "task" ).onChange( (v)=> {
            if (v){
                //console.log(selcon);
                if (selcon){
                    if (selcon.prop.state===0){

                        task=new taskReplenish(agv,selcon,selstock);
                        task.setTask(agv,selcon,selstock);
                        task.setId('t-'+nowtask);
                    }else{
                        // err 1 = clear container
                        msgval = 'wait for clear conatiner, ['+selcon.prop.id+'] is full...';
                        if (selstock.prop.state===0){
                            msgval+='</br>'+'wait for refill product, ['+selstock.prop.id+'] is empty...';
                        }
                        effectController.task=false;
                    }
                }else if (selstock){
                    // err 2 = refill product
                    if (selstock.prop.state===0){
                        msgval = 'wait for refill product, ['+selstock.prop.id+'] is empty...';
                        effectController.task=false;
                    }
                }else{
                    //effectController.taskmessage = 'change productName...'
                        effectController.task=false;
                }
            }else{
                if (task) {
                    if (task.prop.state>220.0/240.0){
                        selcon.setContain(task.prop.product);
                        selstock.setRemove(task.prop.product);
                        ra.setRemove();
                        task.prop.product.setPosition(selcon.prop.basecen);
                    }else{
                        ra.setRemove();
                        selstock.addContain(task.prop.product);
                        selcon.setRemove();
                    }
                }
                task=null;
                selstock.setDesel();
                selcon.setDesel();
                //effectController.taskmessage = 'change productName...'
                effectController.productName = 'input ex. [p-3]';
                msgval='wait for next task, input productName...';
            }
        }).listen();
        f2.add( effectController, "task_Time", 0,240 ).listen();
        f3.add( effectController, "task_execute" ).onChange( (v)=> {
            if (v){
                animate=true;
            }else{
                animate=false;
            }
        });
        f1.open();
        f2.open();
        f3.open();
        customContainer.appendChild(gui.domElement);                
    }

    // =========EXCUTE==========
    init();

    function init() {
        initGUI();
        const helper = new THREE.BoxHelper( new THREE.Mesh( new THREE.BoxBufferGeometry( w, h, d ) ) );
        helper.material.color.setHex( 0x101010 );
        helper.material.blending = THREE.AdditiveBlending;
        helper.material.transparent = true;
        group.add( helper );
        scene.add( group );

        // agents create
        agv = new agentAGV(new THREE.Vector3(effectController.AGV_X,h*-0.5,effectController.AGV_Y),scene);
        agv.setSize(agvsize);
        ra = new agentRA(1,scene);
        ra.setAGV(agv);

        for(let i=1;i<stockRow+1;i+=1){
            for(let j=0;j<stockCol;j+=1){
                let stock = new agentSTOCK(new THREE.Vector3( w*0.5-stocksize.x*0.5+congap.x,
                                                            h*-0.5+agvsize.y+stocksize.y*i+congap.y*i,
                                                            stocksize.z*-0.5*stockCol+stocksize.z*0.5+stocksize.z*j+congap.z*j),scene);
                stock.setSize(stocksize);
                stock.setId('st-'+i+'-'+j);
                stock.setType('p-'+((i-1)*stockCol+j));
                for(let k=0;k<Math.floor(Math.random()*5)+1;k+=1){
                    let p =  new agentProduct(stock.prop.basecen,'p-'+((i-1)*stockCol+j),scene);
                    //console.log(p.prop.type);
                    p.setId('psn-'+p.prop.type+'-'+k);
                    stock.addContain(p);
                }
                stocks.push(stock);
            }
        }
        for(let i=1;i<conRow+1;i+=1){
            for(let j=0;j<conCol;j+=1){
                let con = new agentCONTAINER(new THREE.Vector3( w*-0.5+consize.x*0.5+congap.x,
                                                                h*-0.5+agvsize.y+consize.y*i+congap.y*i,
                                                                consize.z*-0.5*conCol+consize.z*0.5+consize.z*j+congap.z*j),scene);
                con.setSize(consize);
                con.setId('con-'+i+'-'+j);
                con.setType('p-'+((i-1)*conCol+j));
                //let p =  new agentProduct(con.prop.basecen,'p-'+Math.floor(Math.random()*8),scene);
                //con.setContain(p);
                cons.push(con);
            }
        }
        stockTable = document.getElementById('stockdata');
        conTable = document.getElementById('condata');
        tasksTable = document.getElementById('tasksdata');
        msg = document.getElementById('msgdata');
        tasks = new taskSchedule(agv,cons,stocks);


        //document.addEventListener('DOMContentLoaded',function(){
        //    console.log(document.getElementsByClassName("stockli")[0]);
        //},false);
    }
    function update(time) {
        
        // ANIMATE
        if (animate){
            if (task){
                if (effectController.task_Time<240){
                    effectController.task = true;
                    tasks.run();
                    effectController.task_Time = tasks.getTime();
                }else{
                    tasks.removeTaskByStock(selstock);
                    task=null;
                    selstock.setDesel();
                    selcon.setDesel();
                    tasks.tasksUpdate();
                    effectController.task = false;
                    effectController.task_Time = 0;
                }
            }else{
                if (tasks.prop.table.length>0){
                    agv = tasks.prop.table[0].agv;
                    selcon = tasks.prop.table[0].con;
                    selstock = tasks.prop.table[0].stock;
                    selstock.setSel();
                    selcon.setSel();
                    task=new taskReplenish(agv,selcon,selstock);
                    task.setTask(agv,selcon,selstock);
                    task.setId('t-'+nowtask);
                    effectController.productName = selcon.prop.type;
                }else{
                    msgval = tasks.getConclude();
                    tasks.tasksUpdate();
                }
            }
            if (!effectController.task){
                effectController.task_Time = 0;
            }
        }else{
            if (!effectController.task){
                effectController.task_Time = 0;
            }
        }

        if (task){
            task.Progress(effectController.task_Time);
            effectController.AGV_X = agv.prop.basecen.x;
            effectController.AGV_Y = agv.prop.basecen.z;
            effectController.RA_Height = ra.prop.height;
            msgval = task.getMsg();
        }else{
            agv.setPosition(new THREE.Vector3(effectController.AGV_X,h*-0.5,effectController.AGV_Y));
            ra.setHeight(effectController.RA_Height);
        }
        if (selstock){
            if (selstock.prop.contain.length>0){
                effectController.stockProduct = selstock.prop.contain.length + ' products';
            }else{
                effectController.stockProduct = 'no product...';
            }
        }
        // UI
        let stockval = '<div style="color:white;">STOCK</div><ul>';
            if (stocks.length>0){
                stocks.forEach((s,i)=>{
                    stockval+=s.getInfo();
                });
                stockTable.innerHTML=stockval+'</ul>';
                stocks.forEach((s,i)=>{
                    s.assignDom();
                });
            }

        let conval = '<div style="color:white;">CONTAINER</div><ul>';
            if (cons.length>0){
                cons.forEach((c,i)=>{
                    conval+=c.getInfo();
                });
                conTable.innerHTML=conval+'</ul>';
                cons.forEach((c,i)=>{
                    c.assignDom();
                });
            }
        let tasksval = '<div style="color:white;">TASKSCHEDULE</div><ul>';
            if (tasks.prop.table.length>0){
                tasks.prop.table.forEach((t,i)=>{
                    tasksval+=tasks.getInfo(i, animate);
                });
                tasksTable.innerHTML=tasksval+'</ul>';
            }else{
                tasksTable.innerHTML=tasksval+'<li>waiting for replenish stocks...</li>'+'</ul>';
            }
        msg.innerHTML=msgval;
        // listener
        //console.log(document.getElementsByClassName("stockli"));
    }
    return {
        update
    }
}