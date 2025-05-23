// Library Imports
import React from 'react';
import App from './App';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import { Routes, Route, BrowserRouter } from 'react-router-dom'

// CSS Import s
import './index.css';

// Main Pages 
import Home_Page from './pages/home_page/Home_Page';
import About_Page from './pages/about_page/About_Page';
import Graph_Page from './pages/graph_page/Graph_Page';


// Qualification Pages 
import Lap_Time_Bar_Page from "./pages/graph_page/graphs/qualification/lap_time_bar/Lap_Time_Bar_Page";


// Race Pages 
import Tyre_Stint_Page from './pages/graph_page/graphs/race/tyre_stint/Tyre_Stint_Page';
import Position_Line_Page from './pages/graph_page/graphs/race/position_line/Position_Line_Page';
import Interval_Line_Page from './pages/graph_page/graphs/race/interval_line/Interval_Line_Page';
import Lap_Time_Line_Page from './pages/graph_page/graphs/race/lap_time_line/Lap_Time_Line_Page';
import Lap_Time_Distr_Page from './pages/graph_page/graphs/race/lap_time_distr/Lap_Time_Distr_Page';





const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <BrowserRouter>
    <App/>

    <Routes>
      <Route path="/" element={<Home_Page />}/>
      <Route path="/graph"element={<Graph_Page/>}/>
        
        <Route path="/graph/race/tyre_stint" element={<Tyre_Stint_Page />} />
        <Route path="/graph/race/position_line" element={<Position_Line_Page />} />
        <Route path="/graph/race/interval_line" element={<Interval_Line_Page />} />
        <Route path="/graph/race/lap_time_line" element={<Lap_Time_Line_Page />} />
        <Route path="/graph/race/lap_time_distr" element={<Lap_Time_Distr_Page />} />
        <Route path="/graph/qualification/lap_time" element={<Lap_Time_Bar_Page />} />
          
        
      <Route path="/about" element={<About_Page />} />
    </Routes>
  
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
