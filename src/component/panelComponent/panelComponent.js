import React from 'react';
import { Segment} from 'semantic-ui-react';
import styled from 'styled-components';

//import CanvasComponent from './CanvasComponent';

import MenuComponent from '../menuComponent/menuComponent';

import LRPanelComponent from './lrpanelComponent';
import SSTablePanelComponent from './sstablepanelComponent';
import NoneComponent from './noneComponent'; 
import LRTabComponent from './lrtabComponent';
import LRTab2Component from './lrtab2Component';
import USDIComponent from './usdiComponent';



import CanvasRhinojsComponent from './Canvas/Rhinojs';
import CanvasParticlesComponent from './Canvas/Particles';
import CanvasPrototypingjsComponent from './Canvas/Prototypingjs';
import CanvasPrototypingjsIIComponent from './Canvas/PrototypingjsII';
import CanvasWeavingjsComponent from './Canvas/Weavingjs';
import CanvasRobotarmjsComponent from './Canvas/Robotarmjs';
import CanvasStorageStorejsComponent from './Canvas/StorageStorejs';

import CanvasOpencvjsComponent from './Canvas/Opencvjs';

import CanvasCurationjsComponent from './Canvas/Curationjs';
import CanvasArtaskjsComponent from './Canvas/Artaskjs';
// Media Project Frame
//import OpenCVjsComponent from './Canvas/OpenCVjs';

	// stlyed 
	//======================panel======================
	const PanelContain = styled.div`
    position: fixed;
    z-index: 100;
    width:80%;
    height:60vh;
    max-height:65vh;
    margin-left: 10%;
    top: 1.5em;
    .Panel{
      padding-top:1.5em;
      opacity: 0.8;
    }
	`;

class PanelComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
        menuMap:null,
        activeItem: null,
        panelpath:null,
        activedata: null,
        sstabledata:null,
        nonedata:false,
    };

    this.handleItemUpdate = this.handleItemUpdate.bind(this);
  }

  // create a function in parent and call it with "this.props.fucniton" in child component can get the tag DOM
  handleItemUpdate = (e) =>{
    // 要把會影響的state都列入，變動時renderer才會重整，否則沒列入的state就算變動了，renderer也不會重整
    this.setState({ 
      activeItem: e.target.id,
      panelpath: './assets/json/data/'+e.target.id+'.json',
      nonedata: false,
      sstabledata:null,
      activedata: null
      // 確認render即時改變要在setState後面加上props的callback
    },()=>{
      this.updatepanel();
    });
    
    
  }


  componentDidMount() {
    //window.cookies.remove('userInfo');
    this.updatepanel(); 
  }
  componentDidCatch() {
    this.setState({nonedata: true});
  }

  updatepanel = ()=>{

    let menuval = (this.state.panelpath===null) ? 'assets/json/data/about.json' : this.state.panelpath;
    
      

    fetch(menuval).then((response)=>{
      return response.text();
    })
    .then((data)=>{
      this.setState({
        activedata:JSON.parse(data)[0],
        nonedata:false
      });
    }).then(()=>{
      // =======================SSTABLE=======================
      if (this.state.activedata.type !== null){

        if (this.state.activedata.type ==="sstableall" || this.state.activedata.type ==="sstableteam" || this.state.activedata.type ==="lrtab2" || this.state.activedata.type ==="lrtab" || this.state.activedata.type ==="usdi") {
          let panelurl = this.state.activedata.url;

            fetch(panelurl)
              .then((responsetable)=>{
                return responsetable.text();
              })
              
              .then((datatable)=>{
                this.setState({
                  sstabledata:JSON.parse(datatable),
                  nonedata:false
                });
              })
              .catch((errortable)=>{
                console.log(errortable);
              });
        }
      }
    })
    .catch((error)=>{
      this.setState({
        activedata:null,
        nonedata:true});
    });
  }

  panelrender =()=>{
    let panelitem=[];
    let val = this.state.activedata;
    
    if (this.state.activedata !== null){
        
        if (val.type === "lrpanel"){
          panelitem.push(<LRPanelComponent activedata={val} key={val.title}></LRPanelComponent>);

        }else if (val.type === "sstableall" || val.type === "sstableteam"){

          if (this.state.sstabledata !== null){

            let tablejson = this.state.sstabledata;
            let table = [];

            // ==============================分項
            
              let itemw = [];
              let items = [];
              let itemt = [];
              let itemd = [];
              let itemm1 = [];
              let itemm2 = [];
              let itemm3 = [];
              let itemm4 = [];
              let itemm5 = [];

            // ==============================全行事曆
            if (val.type === "sstableall"){

              for (let i = 0; i < tablejson.feed.entry.length; i+=1) {
                  let c = tablejson.feed.entry[i].gsx$周次.$t;
                  itemw.push(c);
                  items.push(tablejson.feed.entry[i].gsx$學校行事曆.$t);
                  itemt.push(tablejson.feed.entry[i].gsx$吉甫.$t);
                  itemd.push(tablejson.feed.entry[i].gsx$工作文件.$t);
                  itemm1.push(tablejson.feed.entry[i].gsx$王霄唅.$t);
                  itemm2.push(tablejson.feed.entry[i].gsx$陳又如.$t);
                  itemm3.push(tablejson.feed.entry[i].gsx$陳嘉隆.$t);
                  itemm4.push(tablejson.feed.entry[i].gsx$蔡承恩.$t);
                  itemm5.push(tablejson.feed.entry[i].gsx$譚君恆.$t);                
              }

              table = {
                'header':['周次','學校行事曆','工作規劃','工作文件','王霄唅','陳又如','陳嘉隆','蔡承恩','譚君恆'],
                'week':itemw,
                'school':items,
                'teacher':itemt,
                'documentpdf':itemd,
                'member1':itemm1,
                'member2':itemm2,
                'member3':itemm3,
                'member4':itemm4,
                'member5':itemm5
              };
            
            }
            // ==============================各組周記
            else if (val.type === "sstableteam"){
              for (let i = 0; i < tablejson.feed.entry.length; i+=1) {
                  let c = tablejson.feed.entry[i].gsx$周次.$t;
                  itemw.push(c);
                  items.push(tablejson.feed.entry[i].gsx$內容說明.$t);
                  itemt.push(tablejson.feed.entry[i].gsx$檔案位址.$t);           
              }

              table = {
                'header':['周次','內容說明','檔案位址'],
                'week':itemw,
                'content':items,
                'url':itemt
              };
            }
            
            panelitem.push(<SSTablePanelComponent activedata={val} contentdata={table} key={val.title}></SSTablePanelComponent>);
          }

        // ===================canvasComponent======================== 

        // media 
        }else if (val.type === "mediaproject"){
        	if (val.title === "opencv") panelitem.push(<CanvasOpencvjsComponent activeItem={val.title} key={val.title}/>);
        // ===================lrtabComponent======================== 
        }else if (val.type === "canvasapp"){
          //console.log(val.title);
        // rhino
          if (val.title === "rhinojs") panelitem.push(<CanvasRhinojsComponent activeItem={val.title} key={val.title}/>);
          else if (val.title === "particles") panelitem.push(<CanvasParticlesComponent activeItem={val.title} key={val.title}/>);
          else if (val.title === "prototypingjs") panelitem.push(<CanvasPrototypingjsComponent activeItem={val.title} key={val.title}/>);
          else if (val.title === "prototypingjsII") panelitem.push(<CanvasPrototypingjsIIComponent activeItem={val.title} key={val.title}/>);
          else if (val.title === "weavingjs") panelitem.push(<CanvasWeavingjsComponent activeItem={val.title} key={val.title}/>);
          else if (val.title === "robotarmjs") panelitem.push(<CanvasRobotarmjsComponent activeItem={val.title} key={val.title}/>);
          else if (val.title === "storagestorejs") panelitem.push(<CanvasStorageStorejsComponent activeItem={val.title} key={val.title}/>);
          // 策展
          else if (val.title === "archi2019") panelitem.push(<CanvasCurationjsComponent activeItem={val.title} key={val.title}/>);

        // ===================lrtabComponent========================    
        }else if (val.type === "lrtab"){
          if (this.state.sstabledata !== null){

            let tablejson = this.state.sstabledata;
            let table = [];

            // ==============================分項
            
              let itemtopic = [];
              let itemlecture = [];
              let itemhardware = [];
              let itemsoftware = [];
              let itemmaterials = [];
              let itemmembers = [];
              let iteminfo = [];
              let itempic1path = [];

              for (let i = 0; i < tablejson.feed.entry.length; i+=1) {
                  itemtopic.push(tablejson.feed.entry[i].gsx$課題.$t); 
                  itemlecture.push(tablejson.feed.entry[i].gsx$講師.$t);
                  itemhardware.push(tablejson.feed.entry[i].gsx$硬體.$t);
                  itemsoftware.push(tablejson.feed.entry[i].gsx$軟體.$t);
                  itemmaterials.push(tablejson.feed.entry[i].gsx$材料.$t);
                  itemmembers.push(tablejson.feed.entry[i].gsx$學員.$t);
                  iteminfo.push(tablejson.feed.entry[i].gsx$介紹.$t);

                  let itempicdir = tablejson.feed.entry[i].gsx$圖片資料夾.$t;
                  let itempic1nms = tablejson.feed.entry[i].gsx$圖片名一.$t.split("|");
                  let itempic1group =[];
                  itempic1nms.forEach(function(item){
                    itempic1group.push(itempicdir.concat(item));
                  });
                  itempic1path.push(itempic1group);
              }
              table = {
                'topic':itemtopic,
                'lecture':itemlecture,
                'hardware':itemhardware,
                'software':itemsoftware,
                'materials':itemmaterials,
                'members':itemmembers,
                'info':iteminfo,
                'pic1path':itempic1path
              };
            
            panelitem.push(<LRTabComponent activedata={val} contentdata={table} key={val.title}></LRTabComponent>);
          }
      // ===================lrtab2========================     
      }else if (val.type === "lrtab2"){
          if (this.state.sstabledata !== null){

            //console.log(this.state.sstabledata);
            let tablejson = this.state.sstabledata;
            let table = [];

            // ==============================分項
            
              let itemtitle = [];
              let itemtopic = [];
              let itemmembers = [];
              let itemlecture = [];
              let itemtool = [];
              let itemmaterials = [];
              let iteminfo = [];
              let itempic1path = [];

              for (let i = 0; i < tablejson.feed.entry.length; i+=1) {
                  itemtitle.push(tablejson.feed.entry[i].gsx$題目.$t);
                  itemtopic.push(tablejson.feed.entry[i].gsx$標題.$t);
                  itemmembers.push(tablejson.feed.entry[i].gsx$學員.$t); 
                  itemlecture.push(tablejson.feed.entry[i].gsx$指導老師.$t);
                  itemtool.push(tablejson.feed.entry[i].gsx$工具.$t);
                  itemmaterials.push(tablejson.feed.entry[i].gsx$材料.$t);
                  iteminfo.push(tablejson.feed.entry[i].gsx$介紹.$t);

                  let itempicdir = tablejson.feed.entry[i].gsx$圖片資料夾.$t;
                  let itempic1nms = tablejson.feed.entry[i].gsx$圖片名一.$t.split("|");
                  let itempic1group =[];
                  itempic1nms.forEach(function(item){
                    itempic1group.push(itempicdir.concat(item));
                  });
                  itempic1path.push(itempic1group);
              }
              table = {
                'title':itemtitle,
                'topic':itemtopic,
                'members':itemmembers,
                'lecture':itemlecture,
                'tool':itemtool,
                'materials':itemmaterials,
                'info':iteminfo,
                'pic1path':itempic1path
              };
            
            panelitem.push(<LRTab2Component activedata={val} contentdata={table} key={val.title}></LRTab2Component>);
          }
      // ===================usdiComponent========================     
      }else if (val.type === "usdi"){
          if (this.state.sstabledata !== null){
            //console.log(this.state.panelpath);
            let tablejson = this.state.sstabledata;
            let table = [];

            // ==============================分項
            
              let itemtopic = [];
              let itemlecture = [];
              let itemhardware = [];
              let itemsoftware = [];
              let itemmaterials = [];
              let itemmembers = [];
              let iteminfo = [];
              
              let membernum = [];
              let memberurl = [];
              let memberpath = [];

              for (let i = 0; i < tablejson.feed.entry.length; i+=1) {
                  itemtopic.push(tablejson.feed.entry[i].gsx$課題.$t); 
                  itemlecture.push(tablejson.feed.entry[i].gsx$講師.$t);
                  itemhardware.push(tablejson.feed.entry[i].gsx$平台.$t);
                  itemsoftware.push(tablejson.feed.entry[i].gsx$軟體.$t);
                  iteminfo.push(tablejson.feed.entry[i].gsx$介紹.$t);
                  itemmembers.push(tablejson.feed.entry[i].gsx$學員組成.$t);

                  membernum.push(tablejson.feed.entry[i].gsx$學員.$t);
                  memberurl.push(tablejson.feed.entry[i].gsx$網址.$t);
                  memberpath.push(tablejson.feed.entry[i].gsx$學員圖片1.$t);
              }
              table = {
                'topic':itemtopic,
                'lecture':itemlecture,
                'hardware':itemhardware,
                'software':itemsoftware,
                'members':itemmembers,
                'info':iteminfo,

                'memberpath':memberpath,
                'membernum':membernum,
                'memberurl':memberurl
              };
            
            panelitem.push(<USDIComponent activedata={val} contentdata={table} key={val.title}></USDIComponent>);
          }
          
        }

    // ===================noneCompontent========================
    }else if (this.state.nonedata){

      panelitem.push(<NoneComponent activeItem={this.state.activeItem} key='nonepanel'></NoneComponent>);
    }

    return panelitem;
  }

  render() {
        
    return (
      <PanelContain>
        <MenuComponent menuMap={this.state.menuMap} handleItemUpdate={this.handleItemUpdate} />
        <div className="Panel" >
          <Segment>
            {this.panelrender()}
          </Segment>
        </div>

      </PanelContain>
    );
  }

}

export default PanelComponent;