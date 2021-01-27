import React from 'react';
import { Button, Header, Table, Icon } from 'semantic-ui-react';
import styled from 'styled-components';

	// stlyed 
	//======================panel======================
	const SSTablePanelContain = styled.div`
    width:100%;
    padding:1.5em 1.5em 1.5em 1.5em;
    top: 1.5em;
    overflow: auto;
    height:65vh;
    .tablecontent{
      text-align:justify;
    }
    .tabletitle{
      background-color:YellowGreen;
    }
    .tableheader{
      background-color:Teal;
      color:White;
    }
	`;
 
class SSTablePanelComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
        width: 0, height: 0,
        activedata: this.props.activedata,
        contentdata: this.props.contentdata
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

  panelrender =()=>{
      let til = this.state.activedata.title;
      let typ = this.state.activedata.type;
      let cont = this.state.contentdata;
      let panelcontent=[];

      let headercont =[];
      let itemcont =[];

      if (cont!==null){        
        
        // header
        for(let i=0;i<cont.header.length;i+=1){
          headercont.push(<Table.Cell key={`${til}-header-${i}`} >{cont.header[i]}</Table.Cell>);
        }
        // item
        for(let i=0;i<cont.week.length;i+=1){
          if (cont.week[i][0]==='W'){
            // 全行事曆
            if (typ === "sstableall"){
              /*
              let docitem = ()=>{
                if (cont.documentpdf[i]===null){return null;}
                else{
                  return
                    (<Table.Cell key={`${til}-documentpdf-${i}`}>
                      
                    </Table.Cell>);
                }
              };
              */
              itemcont.push(
                <Table.Row width={10} key={`${til}-week-${i}`}>
                  <Table.Cell width={1} key={`${til}-week-${i}`}>{cont.week[i]}</Table.Cell>
                  <Table.Cell width={1} key={`${til}-school-${i}`}>{cont.school[i]}</Table.Cell>
                  <Table.Cell width={2} key={`${til}-teacher-${i}`}>{cont.teacher[i]}</Table.Cell>
                  <Table.Cell width={1} key={`${til}-documentpdf-${i}`}>
                    {cont.documentpdf[i]==='' ? null : 
                      <Button size='mini' animated onClick= { () => {window.open(`${cont.documentpdf[i]}`,'_blank'); }}>
                        <Button.Content size='mini' visible><Icon name='clipboard outline' /></Button.Content>
                        <Button.Content size='mini' hidden><Icon name='arrow right'/></Button.Content>
                      </Button>}
                  </Table.Cell>
                  <Table.Cell width={1} key={`${til}-member1-${i}`}>{cont.member1[i]}</Table.Cell>
                  <Table.Cell width={1} key={`${til}-member2-${i}`}>{cont.member2[i]}</Table.Cell>
                  <Table.Cell width={1} key={`${til}-member3-${i}`}>{cont.member3[i]}</Table.Cell>
                  <Table.Cell width={1} key={`${til}-member4-${i}`}>{cont.member4[i]}</Table.Cell>
                  <Table.Cell width={1} key={`${til}-member5-${i}`}>{cont.member5[i]}</Table.Cell>
                </Table.Row>);
              // 各組周記
            }else if (typ === "sstableteam"){
              itemcont.push(
                <Table.Row key={`${til}-week-${i}`}>
                  <Table.Cell key={`${til}-week-${i}`}>{cont.week[i]}</Table.Cell>
                  <Table.Cell key={`${til}-content-${i}`}>{cont.content[i]}</Table.Cell>
                  <Table.Cell key={`${til}-urlpdf-${i}`}>
                    {cont.url[i]==='' ? null : 
                      <Button size='mini' animated onClick= { () => {window.open(`${cont.url[i]}`,'_blank'); }}>
                        <Button.Content size='mini' visible><Icon name='clipboard outline' /></Button.Content>
                        <Button.Content size='mini' hidden><Icon name='arrow right'/></Button.Content>
                      </Button>}
                  </Table.Cell>
                </Table.Row>);
            }
            
          }else{
            itemcont.push(
              <Table.Row key={`${til}-row-${i}`} className='tabletitle'>
                <Table.Cell colSpan='9' textAlign='center' key={`${til}-week-${i}`} >{cont.week[i]}</Table.Cell>
              </Table.Row>
            );
          }
        }

        panelcontent.push(
            <Header as='h2' key={til} style={{fontFamily: 'Titillium Web'}}>{til.toUpperCase()}</Header>
            );

        panelcontent.push(
            <Table striped className='tablecontent' key={`${til}-table`}>
              <Table.Header>
                <Table.Row className='tableheader'>
                  {headercont}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                  {itemcont}
              </Table.Body>
            </Table>
        );
      }

      return panelcontent;
  };

  render() {
        
    return (
      <SSTablePanelContain>
          {this.panelrender()}
      </SSTablePanelContain>
    );
  }

}

export default SSTablePanelComponent;
