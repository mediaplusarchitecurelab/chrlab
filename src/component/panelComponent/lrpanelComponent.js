import React from 'react';
import { Image, Grid, Header } from 'semantic-ui-react';
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
    maxHeight: 75%;
    .txtcontent{
      text-align:justify;
    }
	`;
 
class LRPanelComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
        width: 0, height: 0,
        activedata: this.props.activedata
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

  const panelrender =()=>{
      let til = this.state.activedata.title;
      //let tilup = til.toUpperCase();
      let ntxt = [];
      if (Array.isArray(this.state.activedata.content)){
        this.state.activedata.content.forEach((v,i)=>{
          ntxt.push(<p key={`${til}-p-${i}`}>{v}</p>);
        });
      }else{
        ntxt.push(<p key={`${til}-p-0`}>{this.state.activedata.content}</p>);
      }

      let panelcontent=[]; 
      let elements =[];

      if (this.state.activedata!==null){
        for(let i=0;i<this.state.activedata.pic.length;i+=1){
          let pix = this.state.activedata.pic[i];
          elements.push(<Image src={`${pix}`} key={`${til}-img-${i}`}/>);
        }
      }

      if (this.state.width<640){
        panelcontent.push(
            <Grid key={`${til}-grid`}>
              <Grid.Row>
                <div>
                 <Slider {...settings}>
                    {elements}
                 </Slider>
                </div>
              </Grid.Row>
              <Grid.Row>
                  <Header as='h2' style={{fontFamily: 'Titillium Web'}}>{til.toUpperCase()}</Header>
                    {ntxt}
              </Grid.Row>
              </Grid>
            );
      }else{
        let cl = (this.state.width<900)?8:5;
        panelcontent.push(
          <Grid key={`${til}-grid`}>
            <Grid.Row>
              <Grid.Column width={cl}>
                  <Slider {...settings}>
                    {elements}
                 </Slider>
              </Grid.Column>
              <Grid.Column width={16-cl} className='txtcontent'>
                <Header as='h2' style={{fontFamily: 'Titillium Web'}}>{til.toUpperCase()}</Header>
                  {ntxt}
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

export default LRPanelComponent;
