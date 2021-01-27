import React from 'react';
import './App.css';
import Canvas from './component/Canvas';

import GoogleFontLoader from 'react-google-font-loader';

import PanelComponent from './component/panelComponent/panelComponent';
import FooterComponent from './component/footerComponent/footerComponent';

function App() {
  return (

    <div className="App">


        <GoogleFontLoader
          fonts={[
            {
              font: 'Titillium Web',
              weights: [300,700],
            },
          ]}
        />	    
    	<PanelComponent/>
    	<Canvas/>
      	<FooterComponent/>      	
    </div>
  );
}

export default App;
