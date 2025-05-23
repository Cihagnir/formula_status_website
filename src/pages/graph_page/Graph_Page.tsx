
// Library Imports
import { useState } from 'react';

// Css Import 
import "./Graph_Page.css"
import GP_Background from "../img/Interlagos-Merc (1).jpg"




function Graph_Page() {

  const [activeTab, setActiveTab] = useState<string | null>('race'); 

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName); 
  };



  return(
  
    <div className="GP_Main_Div">
      <img src={GP_Background} className="GP_Background_Img"/>
      <div className="GP_Content_Container">

        <div className="GP_Text_Area">
          <h3 className="GP_Tittle_Heading">
            Graphs
          </h3>

          <span className="GP_Text_Span">
              Welcome aganin to Formulatics ... 
              <br/>
              <br/>
              Here the our graph dashbord page. Graph dashboard allow you to go thourgh the different 
              graph visulisation for each session. To see the which graph currently we have, you can 
              check the menu bellow the page. As sake of the development time we are trying to 
              add new graph as soon as possible. 
              <br/> 
          </span>
        </div>

        <div className="GP_Accordion_Container">

          <div className={`GP_Accordion_Item ${activeTab === 'race' ? 'active' : ''}`}>
          
            <div className="GP_Accordion_Title" onClick={() => handleTabClick('race')}>
              <span>Race</span>
            </div>
          
            <div className="GP_Accordion_Content">

              <a href='/graph/race/position_line'>Position</a>
              <a href='/graph/race/lap_time_line'>Lap Time</a>
              <a href='/graph/race/tyre_stint'>Tyre Stint</a>
              <a href='/graph/race/interval_line'>Interval Time</a>
              <a href='/graph/race/lap_time_distr'>Lap Time Distribution</a>

            </div>
          </div>

          <div className={`GP_Accordion_Item ${activeTab === 'quali' ? 'active' : ''}`}>

            <div className="GP_Accordion_Title" onClick={() => handleTabClick('quali')}>
              <span>Qualification</span>
            </div>
          
            <div className="GP_Accordion_Content">
              <a href="/graph/qualification/lap_time">Lap Time</a>
            </div>
          
          </div>

          <div className={`GP_Accordion_Item ${activeTab === 'practice' ? 'active' : ''}`}>
          
            <div className="GP_Accordion_Title" onClick={() => handleTabClick('practice')}>
              <span>Practice</span>
            </div>

            <div className="GP_Accordion_Content">
              <a href="#">Coming Soon</a>
            </div>
          
          </div>
        </div>
      </div>
    </div>
  );
}

export default Graph_Page;


























