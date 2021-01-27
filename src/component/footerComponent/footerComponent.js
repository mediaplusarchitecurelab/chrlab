import React from 'react';
import {Container, List, Button, Icon } from 'semantic-ui-react';
import styled from 'styled-components';
	
	// stlyed 
	//======================footer======================
	const FooterContain = styled.div`
    position: fixed;
		z-index: 100;
		width:80%;
    margin-left: 10%;
    height:10vh;
    bottom:5px;

    p{
      color: white;
      margin-top:8px;
    }
	`;


class FooterComponent extends React.Component {
/*
  constructor(props) {
    super(props);    
  }

  handleItemClick = (e, { name }) => {
    this.setState({ 
      activeItem: name 
    });
    console.log(name);
  }
*/
  render() {
    //const { activeItem } = this.state;
        
    return (
      <FooterContain  >
          <Container textAlign='center' >
            <List horizontal divided size='small'>
              <List.Item>
                <Button basic animated size='tiny' color='red'>
                  <Button.Content visible style={{fontFamily: 'Titillium Web'}}>
                    FB
                  </Button.Content>
                  <Button.Content hidden>
                    <Icon loading name='sync' color='red'/>
                  </Button.Content>
                </Button>
              </List.Item>

              <List.Item>
                <p>|</p>
              </List.Item>

              <List.Item>
                <Button basic animated size='tiny' color='red'>
                  <Button.Content visible style={{fontFamily: 'Titillium Web'}}>
                    Contact
                  </Button.Content>
                  <Button.Content hidden>
                    <Icon loading name='sync' color='red'/>
                  </Button.Content>
                </Button>
              </List.Item>

              <List.Item>
                <p>|</p>
              </List.Item>

              <List.Item>
                <Button basic animated size='tiny' color='red'>
                  <Button.Content visible style={{fontFamily: 'Titillium Web'}}>
                    Map
                  </Button.Content>
                  <Button.Content hidden>
                    <Icon loading name='sync' color='red'/>
                  </Button.Content>
                </Button>
              </List.Item>

            </List>
          </Container>
          <p style={{fontFamily: 'Titillium Web'}}>2019 Computing Frabrication Research Labortory All Rights Preserverd. Composing By Chifu Hsiao with React, Threejs.</p> 
      </FooterContain>
    );
  }

}

export default FooterComponent;
