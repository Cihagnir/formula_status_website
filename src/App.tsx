
// Imports 
import {  Routes, Route } from 'react-router-dom';

// Hand Made Import 
import Home_Page from './pages/home_page/Home_Page';
import About_Page from './pages/about_page/About_Page';
import Tyre_Stint_Page from './pages/tyre_stint/Tyre_Stint_Page';
import Lap_Time_Line_Page from './pages/lap_time_line/Lap_Time_Line_Page';
import Lap_Time_Distr_Page from './pages/lap_time_distr/Lap_Time_Distr_Page';

//Img Imoprt 
import x_img from './pages/img/X_icon.svg'
import git_hub_img from './pages/img/github_icon.svg'

// CSS Import 
import './App.css';


function App() {
  // const [navbar_status_state,  set_navbar_status_state] = useState({link_one : true, link_two : false })

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

        <div className='Nav_Bar_Graph_Div'>

          <a className='Nav_Bar_Item' id ='Nav_Bar_Graph' href="/Graph/Lap_Time">
            Graph
          </a>

          <div className='Sub_Nav_Bar_Graph'>
              <a className='Sub_Nav_Bar_Item' href='/Race/Tyre_Stint' > Tyre Stint </a>     
              <a className='Sub_Nav_Bar_Item' href='/Race/Lap_Time_Line' > Tyre Stint Line</a>           
              <a className='Sub_Nav_Bar_Item' href='/Race/Lap_Time_Distr'   > Lap time Distr</a> 

          </div>
        
        </div>

        <a className='Nav_Bar_Item' href="/About">
          About
        </a>

      </div>


      <Routes>
        <Route path="/" element={ <Home_Page/> }/>
      </Routes>

      <Routes>
        <Route path="/Race/Lap_Time_Distr" element={ <Lap_Time_Distr_Page/> }/>
      </Routes>

      <Routes>
        <Route path="/Race/Lap_Time_Line" element={ <Lap_Time_Line_Page/> }/>
      </Routes>

      <Routes>
        <Route path="/Race/Tyre_Stint" element={ <Tyre_Stint_Page/> }/>
      </Routes>

      <Routes>
        <Route path="/About" element={ <About_Page/> }/>
      </Routes>

    </div>

  
);
}

export default App;
