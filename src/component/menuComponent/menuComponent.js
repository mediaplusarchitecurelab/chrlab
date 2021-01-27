import React from 'react';
import { Menu, Dropdown} from 'semantic-ui-react';
import logo from './assets/logo.svg';
import styled, { keyframes } from 'styled-components';
	
	// stlyed 
	//======================logo======================
    const spin = keyframes`
    	0% { transform: rotate(0deg); }
    	25% { transform: rotate(360deg); }
    	50% { transform: rotate(0deg); }
    	75% { transform: rotate(-360deg); }
    	100% { transform: rotate(0deg); }
	`;

  const SpinLogo = styled.img`
	 	animation: ${spin} 4s linear infinite;
	 `;
	//======================menutab======================
	const HeaderContain = styled.div`
		width:100%;
	`;

  const menuMapurl = './assets/json/menuMap.json';

export default class MenuComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      activeItem: null
    };
  }

  componentDidMount() {
    fetch(menuMapurl)
    .then((response)=>{
      return response.text();
    })
    .then((data)=>{
      this.setState({menuMap:JSON.parse(data)});
    })
    .catch((error)=>{
      console.log(error);
    });    
  }


  menurender = () =>{
    let menuitem=[];

    if (this.state.menuMap!=null){

      for(let i=0; i<this.state.menuMap.length; i+=1){
            let type = this.state.menuMap[i].type;
            let title = this.state.menuMap[i].title;

            //=======================BUTTOn====================
            if (type==='button'){
              menuitem.push(
              <Menu.Item 
                key={title} id={title} 
                active={this.state.activeItem === {title}}
                onClick={this.props.handleItemUpdate}
              >
                {title.toUpperCase()}
              </Menu.Item>);

              //=======================DROPDOWN====================
            }else if(type==='dropdown'){
                let dropdownitem=[];

                for(let j=0; j<this.state.menuMap[i].sub.length; j+=1){
                    let dtype = this.state.menuMap[i].sub[j].type;
                    let dtitle = this.state.menuMap[i].sub[j].title;
                    //=======================TOPIC====================
                    if (dtype==='topic'){
                      dropdownitem.push(<Dropdown.Header key={`${title}-${dtitle}`}>{dtitle.toUpperCase()}</Dropdown.Header>);
                    //=======================DIVIDER====================
                    }else if (dtype==='divider'){
                      dropdownitem.push(<Dropdown.Divider key={`${title}-divider-${j}`}/>);
                    //=======================BUTTON====================
                    }else if (dtype==='button'){
                      dropdownitem.push(
                        <Dropdown.Item
                          key={`${title}-${dtitle}`} id={`${title}-${dtitle}`}
                          active={this.state.activeItem === `${title}-${dtitle}`}
                          onClick={this.props.handleItemUpdate}
                        >
                          {dtitle.toUpperCase()}
                        </Dropdown.Item>);
                    }else if (dtype==='dropdown'){
                            let dropdownitemsub=[];

                            for(let k=0; k<this.state.menuMap[i].sub[j].sub.length; k+=1){
                                let ddtype = this.state.menuMap[i].sub[j].sub[k].type;
                                let ddtitle = this.state.menuMap[i].sub[j].sub[k].title;
                                //=======================TOPIC====================
                                if (ddtype==='topic'){
                                  dropdownitemsub.push(<Dropdown.Header key={`${title}-${dtitle}-${ddtitle}`}>{ddtitle.toUpperCase()}</Dropdown.Header>);
                                //=======================DIVIDER====================
                                }else if (ddtype==='divider'){
                                  dropdownitemsub.push(<Dropdown.Divider key={`${title}-${dtitle}-divider-${j}`}/>);
                                //=======================BUTTON====================
                                }else if (ddtype==='button'){
                                  dropdownitemsub.push(
                                    <Dropdown.Item
                                      key={`${title}-${dtitle}-${ddtitle}`} id={`${title}-${dtitle}-${ddtitle}`}
                                      active={this.state.activeItem === `${title}-${dtitle}-${ddtitle}`}
                                      onClick={this.props.handleItemUpdate}
                                    >
                                      {ddtitle.toUpperCase()}
                                    </Dropdown.Item>);
                                }
                            }

                            dropdownitem.push(
                              <Dropdown text={dtitle.toUpperCase()} key={`${title}-${dtitle}`} pointing className='link item left'>
                                <Dropdown.Menu>
                                  {dropdownitemsub}
                                </Dropdown.Menu>
                              </Dropdown>
                            );
                    }
                }

                menuitem.push(
                    <Dropdown text={title.toUpperCase()} key={title} pointing className='link item'>
                      <Dropdown.Menu>
                        {dropdownitem}
                      </Dropdown.Menu>
                    </Dropdown>
                );
            }
            
      }
    }
    return menuitem;
  };
  
  
  render() {


    return (
      <HeaderContain>
        <Menu style={{ fontFamily: 'Titillium Web', fontSize:'1.1em'}}>
          <Menu.Item key='logo-menu'><SpinLogo src={logo} alt='logo-spin'></SpinLogo> CFR Lab </Menu.Item>
          {this.menurender()}
        </Menu>
      </HeaderContain>
    );
  }
}