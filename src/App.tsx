
// Imports 
import {  Routes, Route } from 'react-router-dom';

// Bootstrap Imports 
import Nav from 'react-bootstrap/Nav';


// Hand Made Import 
import Home_Page from './pages/home_page/Home_Page';
import Lap_Time_Page from './pages/lap_time/Lap_Time_Page';
import Tyre_Stint_Page from './pages/tyre_stint/Tyre_Stint_Page';
import About_Page from './pages/about_page/About_Page';

// CSS Import 
import './App.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';



function App() {

  // const [navbar_status_state,  set_navbar_status_state] = useState({link_one : true, link_two : false })


  return (

    <div className='App_Div' > 


      <Nav className='Nav_Bar' defaultActiveKey="/">
          
        <Nav.Item>
          <Nav.Link className= "nav-item"  href="/" > Home </Nav.Link>
        </Nav.Item>
        
        <Nav.Item>
          <Nav.Link className= "nav-item" href="/Graph/Lap_Time" >Graph</Nav.Link>
        </Nav.Item>

        <Nav.Item>
          <Nav.Link className= "nav-item" href="/About" >About</Nav.Link>
        </Nav.Item>

      </Nav>


      <Routes>
        <Route path="/" element={ <Home_Page/> }/>
      </Routes>

      <Routes>
        <Route path="/Graph/Lap_Time" element={ <Lap_Time_Page/> }/>
      </Routes>

      <Routes>
        <Route path="/Graph/Tyre_Stint" element={ <Tyre_Stint_Page/> }/>
      </Routes>

      <Routes>
        <Route path="/About" element={ <About_Page/> }/>
      </Routes>

    </div>

  
);
}

export default App;
