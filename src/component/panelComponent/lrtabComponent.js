import React from 'react';
import { Image, Grid, Header, Tab } from 'semantic-ui-react';
import Slider from "react-slick";
import styled from 'styled-components';

// 匯入 slick的css
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
	// stlyed 
	//======================panel======================
	const LRPanelContain = styled.div`
    width:100%;
    padding:1.5em 1.5em 1.5em 1.5em;
    top: 1.5em;
    overflow: 'auto';
    height:69vh;
    .txtcontent{
      text-align:justify;
    }
	`;
 
class LRTabComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
        width: 0, height: 0,
        activedata: this.props.activedata,
        contentdata: this.props.contentdata,
        activegroup:0
    };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  // ==================RESIZE=======================
  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }
  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  handleTabChange = (e, { activeIndex }) => {
    this.setState({ activegroup: activeIndex });
  }
  // ==================LAYOUT=======================
  render() {
  const settings = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true
  };
  
  const itemspllit =(str,p)=>{
    let ar=str.split(p);
    let datastr=[];
    for (let i=0;i<ar.length;i+=1){
      datastr.push(<p key={`item-${ar[i]}`} style={{lineHeight: '1em'}}>{ar[i]}</p>);
    }
    return datastr;
  }

  const tabcontent = (data, id)=>{
    let contdata =[];
      contdata.push(<Header key={`header-${id}`} as='h2' style={{fontFamily: 'Titillium Web'}}>{data.topic[id]}</Header>);
      contdata.push(<Header key={`info-${id}`} as='h5' style={{fontFamily: 'Titillium Web'}}>{data.info[id]}</Header>);
    return contdata;
  }

  const panelrender =()=>{
      //console.log(this.state.activedata);

      let til = this.state.activedata.title;
      //let tilup = til.toUpperCase();
      let cont = this.state.contentdata;

      let panelcontent=[];

      let grouppanes = [];
      for (let i=0;i<cont.topic.length;i+=1){

          if (this.state.activedata.filename==='preliminary'){
            grouppanes.push({menuItem: `Group${i}`, render: () => <Tab.Pane>{tabcontent(cont, i)}</Tab.Pane>});
          }else if(this.state.activedata.filename==='precedents'){
            grouppanes.push({menuItem: `Keynote${i}`, render: () => <Tab.Pane>{tabcontent(cont, i)}</Tab.Pane>});
          }
      }

      let elements=(id)=>{
        let picdata=[];
        for (let i=0;i<cont.pic1path[id].length;i+=1){
          picdata.push(<Image src={`${cont.pic1path[id][i]}`} key={`${cont.topic[id]}-img-${i}`}/>);
        }
        return picdata;
      }

      if (this.state.width<640){
        panelcontent.push(
            <Grid key={`${til}-grid`}>
              <Grid.Row>
                <div>
                 <Slider {...settings}>
                    {elements(this.state.activegroup)}
                 </Slider>
                </div>
              </Grid.Row>
              <Grid.Row>
                  <Header as='h2' style={{fontFamily: 'Titillium Web'}}>{til.toUpperCase()}</Header>
              </Grid.Row>
              </Grid>
            );
      }else{
        let cl = (this.state.width<900)?8:5;
        panelcontent.push(
          <Grid key={`${til}-grid`}>
            <Grid.Row style={{height:'54vh'}}>
              <Grid.Column width={cl}>
                <Slider {...settings}>
                  {elements(this.state.activegroup)}
                </Slider>
              </Grid.Column>
              <Grid.Column width={16-cl} className='txtcontent'>
                <Tab panes={grouppanes} activeIndex={this.state.activegroup} onTabChange={this.handleTabChange}/>
              </Grid.Column>
            </Grid.Row>

            <Grid.Row divided style={{height:'3vh'}}>
              <Grid.Column width={3} >
                <Header as='h6' style={{fontFamily: 'Titillium Web', textAlign: 'right'}}>[Lecture]</Header>
                <Header as='h5' style={{fontFamily: 'Titillium Web', textAlign: 'right',marginTop: '-0.5em', inlineHeight:'0.05em'}}>{itemspllit(cont.lecture[this.state.activegroup],"| ")}</Header>
              </Grid.Column>
              <Grid.Column width={4}>
                <Header as='h6' style={{fontFamily: 'Titillium Web', textAlign: 'left'}}>[Members]</Header>
                <Header as='h5' style={{fontFamily: 'Titillium Web', textAlign: 'left',marginTop: '-0.5em', inlineHeight:'0.05em'}}>{itemspllit(cont.members[this.state.activegroup],"| ")}</Header>
              </Grid.Column>
              <Grid.Column width={3} >
                <Header as='h6' style={{fontFamily: 'Titillium Web', textAlign: 'left'}}>[Hardware]</Header>
                <Header as='h5' style={{fontFamily: 'Titillium Web', textAlign: 'left',marginTop: '-0.5em', inlineHeight:'0.05em'}}>{itemspllit(cont.hardware[this.state.activegroup],"| ")}</Header>  
              </Grid.Column>
              <Grid.Column width={3}>
                <Header as='h6' style={{fontFamily: 'Titillium Web', textAlign: 'left'}}>[Software]</Header>
                <Header as='h5' style={{fontFamily: 'Titillium Web', textAlign: 'left',marginTop: '-0.5em', inlineHeight:'0.05em'}}>{itemspllit(cont.software[this.state.activegroup],"| ")}</Header>
              </Grid.Column>
              <Grid.Column width={3}>
                <Header as='h6' style={{fontFamily: 'Titillium Web', textAlign: 'left'}}>[Material]</Header>
                <Header as='h5' style={{fontFamily: 'Titillium Web', textAlign: 'left',marginTop: '-0.5em', inlineHeight:'0.05em'}}>{itemspllit(cont.materials[this.state.activegroup],"| ")}</Header>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          );
      }

      return panelcontent;
  };

    return (
      <LRPanelContain>
          {panelrender()}
      </LRPanelContain>
    );
  }

}

export default LRTabComponent;
