import React from 'react';
import { Grid, Header, Icon } from 'semantic-ui-react';
import styled from 'styled-components';

	// stlyed 
	//======================panel======================
	const NoneContain = styled.div`
    width:100%;
    padding:1.5em 1.5em 1.5em 1.5em;
    top: 1.5em;
    overflow: 'auto';
    maxHeight: 75%;
    .txtcontent{
      text-align:justify;
    }
	`;
 
class NoneComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
        width: 0, height: 0,
        activeItem: this.props.activeItem
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
  nonerender =()=>{
      let panelcontent=[]; 
      let til =this.state.activeItem;
      panelcontent.push(
          <Grid key={`${til}-grid`}>
            <Grid.Row>
              <Grid.Column className='txtcontent'  >
                <Header as='h2' key={`${til}-nonetitle`} style={{fontFamily: 'Titillium Web'}}>{til.toUpperCase()}</Header>
                <Header as='h5' key={`${til}-nonecontent`}><Icon loading name='setting' />UnderConstruction</Header>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          );

      return panelcontent;
  };

  render() {
        
    return (
      <NoneContain>
          {this.nonerender()}
      </NoneContain>
    );
  }

}

export default NoneComponent;
