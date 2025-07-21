
// Library Imports 
import axios from 'axios';
import React, {useState, useEffect } from 'react';

// Project Imports 
import {Interval_Line_Graph }from './Graph_Obj';
import {BASE_URL, interval_graph_input_interface} from '../../../Commen_Utils';

// CSS Import 
import './Interval_Line_Page.css' ;
import home_page_backgraound from '../../../../img/home_page_back.jpg';


// Const Defines 
const LOCAL_DEBUG = false ;


// Page Export Funciton 
function Interavl_Line_Page (){


// ======== UseState Section ========

  // Graph State Area 
  const [selected_race_state, set_selected_race_state] = useState('');
  const [selected_year_state, set_selected_year_state] = useState('');
  const [interval_type, set_interval_type] = useState(1);

  
  // Graph Data 
  const [graph_data_state, set_graph_data_state ] = useState<interval_graph_input_interface | null>(null);
  
  // Dropdown Box Datas
  const [seassion_array_state, set_seassion_array_state] =useState( [] ) ;
  const [track_name_array_state, set_track_name_array_state] = useState( ['Select the Race'] ) ;
  


// ======== Api Fetch Function ========

  const api_fetch_func = async(sub_url: string , state_setter : React.Dispatch<React.SetStateAction<any>> ) => {
    
    if (LOCAL_DEBUG) console.log(BASE_URL + sub_url)
    const api_response = await axios.get(BASE_URL + sub_url);
    state_setter(api_response.data.api_response) ;
    if (LOCAL_DEBUG) console.log(api_response.data.api_response);
  }



// ======== UseEffect Section ========

  // Fetch the Seassion Year Data
  useEffect( () => {

    let backend_input_string = '/ui/' 
    api_fetch_func(backend_input_string, set_seassion_array_state); 
  }, [])


  // Fetch the Track Name Data 
  useEffect(() => {
    
    if (! (selected_year_state === '') ) {

      let backend_input_string  = `/ui?year=${selected_year_state}&session_type=${'Race'}`
      api_fetch_func(backend_input_string, set_track_name_array_state);       
    }
  }, [selected_year_state ] )


  // Fetch the Graph Data 
  useEffect( () => {
    
    if (! (selected_race_state === '') ) {

      let backend_input_string : string = `/graph/race_interval/?year=${selected_year_state}&race_name=${selected_race_state.split("  ")[0]}&session_name=${selected_race_state.split("  ")[1]}` ;
      api_fetch_func(backend_input_string, set_graph_data_state)      
    }
  }, [selected_year_state, selected_race_state] )
  


// ======== Return Section ========

  return (

    <div className='IL_Main_Div'>
      <img src={home_page_backgraound} alt="Formula 1 Background" className="IL_Background_Image" />
      <div className='IL_Blur_Div' ></div>

      <div className='IL_Window_Div' >

        <div className='IL_Combined_Div'>
          <div className='IL_Info_Div'>
            <h3 className='IL_Info_Title'>
              Interval Time 
            </h3>
            <span className='IL_Info_Text'>
              This line graph shows the intervals as seconds of F1 drivers throughout 
              the race. You could use the legend to filter and compare 
              drivers' performance. Also you can change the display style of the intervals
              with the toggle button .
            </span>
          </div>

          <div className='IL_Divider'></div>


          <div className='IL_Control_Div'>

            <div className='IL_Control_Upper_Div'>
              
              <p className='IL_Select_Title_Span' > Season : </p>
              <select className='IL_Select_Box' id='Season_Select_Box'
              onChange={() => { set_selected_year_state( ( document.getElementById("Season_Select_Box") as HTMLInputElement).value ) }} >
                <option value={''} > {'Select the Seassion'} </option>
                {seassion_array_state.map(
                  (track_name, index) => (
                    <option value={track_name} > {track_name} </option>
                  ) 
                )}
              </select>    

              <p className='IL_Select_Title_Span LT_Race'> Races : </p>
              <select className='IL_Select_Box IL_Race_Box' id='Race_Select_Box' 
              onChange={() => { set_selected_race_state( ( document.getElementById("Race_Select_Box") as HTMLInputElement).value ) }}>          
                <option className='IL_Select_Option' value={''} > {'Select the Seassion'} </option>
                {track_name_array_state.map(
                  (track_name, index) => (
                    <option value={track_name} > {track_name} </option>
                  ) 
                )}
              </select>   

              {/* <div 
                className='IL_Toggle_Container'
                onClick={() => set_interval_type(prev => prev === 1 ? 0 : 1)}
              >
                <div 
                  className='IL_Toggle_Slider' 
                  style={{ transform: `translateX(${interval_type === 1 ? '0' : '100%'})` }}
                />

                <div className='IL_Toggle_Labels'>
                
                  <span className={`IL_Toggle_Label ${interval_type === 1 ? 'active' : ''}`}>
                    Interval;
                  </span>
                  
                  <span className={`IL_Toggle_Label ${interval_type === 0 ? 'active' : ''}`}>
                    Proportional
                  </span>
                
                </div>

              </div> */}

            </div>
          </div>
        </div>


        {
          (graph_data_state !== null) ? (<Interval_Line_Graph graph_type={interval_type} graph_data={graph_data_state.graph_data} color_map={graph_data_state.color_map} lap_max_interval_json={graph_data_state.lap_max_interval_json}   />) : (null)
        }
    
      </div>
      
    </div>
  );
}

export default Interavl_Line_Page;

