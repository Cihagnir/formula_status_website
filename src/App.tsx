// Imports 
import {  Routes, Route } from 'react-router-dom';

// Hand Made Import 
import Home_Page from './pages/home_page/Home_Page';
import About_Page from './pages/about_page/About_Page';
import Graph_Page from './pages/graph_page/Graph_Page';

import Tyre_Stint_Page from './pages/graph_page/graphs/tyre_stint/Tyre_Stint_Page';
import Lap_Time_Line_Page from './pages/graph_page/graphs/lap_time_line/Lap_Time_Line_Page';
import Lap_Time_Distr_Page from './pages/graph_page/graphs/lap_time_distr/Lap_Time_Distr_Page';

//Img Imoprt 
import x_img from './pages/img/X_icon.svg'
import git_hub_img from './pages/img/github_icon.svg'

// CSS Import 
import './App.css';


function App() {

  return (

    <div className='App_Div' > 

      <div className='Nav_Bar'>

        <a className='Nav_Bar_Img_Item ' href='https://github.com/Cihagnir/Formulatics'>
          <img src={git_hub_img} alt="GitHub" className="Nav_Bar_Item_Img" />
        </a>

        <a className='Nav_Bar_Img_Item' href='https://github.com/Cihagnir/Formulatics'>
          <img src={x_img} alt="GitHub" className="Nav_Bar_Item_Img" />
        </a>

        <a className='Nav_Bar_Item Space_Bar'> </a>
          
        
        <a className='Nav_Bar_Item' href='/'>
        Home
        </a>
        
        <a className='Nav_Bar_Item' id ='Nav_Bar_Graph' href="/graph">
          Graph
        </a>
        

        <a className='Nav_Bar_Item' href="/About">
          About
        </a>

      </div>

      <Routes>
        <Route path="/" element={<Home_Page />}/>
        <Route path="/graph"element={<Graph_Page/>}/>
        
          <Route path="/graph/race/tyre_stint" element={<Tyre_Stint_Page />} />
          <Route path="/graph/race/lap_time_line" element={<Lap_Time_Line_Page />} />
          <Route path="/graph/race/lap_time_distr" element={<Lap_Time_Distr_Page />} />
        
        <Route path="/about" element={<About_Page />} />
      </Routes>

    </div>

  
);
}

export default App;
