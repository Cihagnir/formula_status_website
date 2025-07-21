
// Library Imports 
import axios from 'axios';
import React, {useState, useEffect } from 'react';

// Project Imoprts  
import {Lap_Time_Line_Graph }from './Graph_Obj';
import {BASE_URL, lap_duration_graph_input_interface} from '../../../Commen_Utils';

// CSS Import 
import './Lap_Time_Line_Page.css' ;
import home_page_backgraound from '../../../../img/home_page_back.jpg';


// Constant Defines 
const LOCAL_DEBUG = false ; 



// Page Export Funciton 
function Lap_Time_Line_Page (){


// ======== UseState Section ========

  // Graph State Area 
  const [selected_race_state, set_selected_race_state] = useState("")
  const [selected_year_state, set_selected_year_state] = useState('');
  const [data_filter_state, set_data_filter_state] = useState(1);
  const [upper_bound_grpah_state, set_upper_bound_graph_state] = useState(1.5);
  const [lower_bound_grpah_state, set_lower_bound_graph_state] = useState(1.5);

  
  // Graph Data 
  const [graph_data_state, set_graph_data_state ] = useState<lap_duration_graph_input_interface | null>(null)
  
  // Dropdown Box Datas
  const [seassion_array_state, set_seassion_array_state] =useState( [] ) ;
  const [track_name_array_state, set_track_name_array_state] = useState( ['Select the Race'] ) ;
  
  // Sliders onChange Data
  const [upper_bound_state, set_upper_bound_state] = useState(1.5);
  const [lower_bound_state, set_lower_bound_state] = useState(1.5);


// ======== Api Fetch Function ========

  const api_fetch_func = async(sub_url: string , state_setter : React.Dispatch<React.SetStateAction<any>> ) => {
    
    if (LOCAL_DEBUG) console.log('Fetching Data from : ' + BASE_URL + sub_url) ;
    const api_response = await axios.get(BASE_URL + sub_url)
    state_setter(api_response.data.api_response) ;
    if (LOCAL_DEBUG) console.log(api_response.data.api_response)
  }



// =========== UseEffect Section ===========

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

      let backend_input_string : string = `/graph/race_laps_line/?year=${selected_year_state}&race_name=${selected_race_state.split("  ")[0]}&session_name=${selected_race_state.split("  ")[1]}&user_upper_bound=${upper_bound_grpah_state}&user_lower_bound=${lower_bound_grpah_state}&is_filter=${data_filter_state}` ;
      api_fetch_func(backend_input_string, set_graph_data_state)      
    }
  }, [selected_race_state, selected_race_state, selected_year_state, data_filter_state, upper_bound_grpah_state, lower_bound_grpah_state] )


// =========== Return Section ===========
  return (
    
    <div className='LTL_Main_Div'>
      
      <img src={home_page_backgraound} alt="Formula 1 Background" className="LTL_Background_Image" />
      <div className='LTL_Blur_Div' />

      <div className='LTL_Window_Div' >

        <div className='LTL_Control_Area_Div' >

          <div className='LTL_Info_Div'>
            
            <h3 className='LTL_Info_Title'>
              Drivers' Lap Times
            </h3>

            <span className='LTL_Info_Text'>
            This line graph shows the lap times of F1 drivers throughout 
            the race. You could use the legend to filter and compare 
            drivers' performance. Also sliders allow you to set 
            custom filtering range. 
            </span>

          </div>

          <div className='LTL_Control_Div'>

            <div className='LTL_ComboBox_Upper'>
              
              <p className='LTL_Select_Title_Span'> Season : </p>
              <select className='LTL_Select_Box' id='Season_Select_Box' 
              onChange={() => { set_selected_year_state( ( document.getElementById("Season_Select_Box") as HTMLInputElement).value ) }} >
                <option value={''} > {'Select the Seassion'} </option>
                {seassion_array_state.map(
                  (track_name, index) => (
                    <option value={track_name} > {track_name} </option>
                  ) 
                )}
              </select>    

              <p className='LTL_Select_Title_Span LT_Race'> Races : </p>
              <select className='LTL_Select_Box LTL_Race_Box' id='Race_Select_Box' 
              onChange={() => { set_selected_race_state( ( document.getElementById("Race_Select_Box") as HTMLInputElement).value ) }}>          
                <option value={''} > {'Select the Seassion'} </option>
                {track_name_array_state.map(
                  (track_name, index) => (
                    <option value={track_name} > {track_name} </option>
                  ) 
                )}
              </select>   

            </div>

            <div className='LTL_Divider'></div>

            <div className='LTL_ComboBox_Bottom'>
              
              <div className='LTL_Info_Hover_Container'>
                
                <span className='LTL_Info_Icon'>?</span>

                <div className='LTL_Info_Tooltip'>
                  Use the sliders to change the upper and lower bounds of the filter.
                  <br />
                  <br />
                  However data come with the filter you couldn't remove with the sliders.
                  To see the original data, you could use the button on far right. 
              
                </div>
                
              </div>

              <div className='LTL_Slider_Group'>
                <label>Lower Bound : {lower_bound_state.toFixed(2)}</label>
                <input 
                  type="range" 
                  min="0" 
                  max="3" 
                  step="0.1"
                  defaultValue={lower_bound_state}
                  onChange={ (e) => set_lower_bound_state(Number(e.currentTarget.value)) }
                  onMouseUp={ (e) => set_lower_bound_graph_state(Number(e.currentTarget.value)) }
                  className='LTL_Range_Slider'
                />
              </div>
              
              <div className='LTL_Slider_Group'>
                <label>Upper Bound : {upper_bound_state.toFixed(2)}</label>
                <input 
                  type="range" 
                  min="0" 
                  max="3" 
                  step="0.1"
                  defaultValue={upper_bound_state}
                  onChange={ (e) => set_upper_bound_state(Number(e.currentTarget.value)) }
                  onMouseUp={ (e) => set_upper_bound_graph_state(Number(e.currentTarget.value)) }
                  className='LTL_Range_Slider'
                />
              </div>
              
              <button 
                className='LTL_Filter_Button'
                onClick={() => set_data_filter_state(prev => prev === 1 ? 0 : 1)}
              >
                {data_filter_state === 1 ? 'Show All Data' : 'Show Filtered Data'}
              </button>


            </div>

          </div>


        </div>

        {
          (graph_data_state !== null) ? (<Lap_Time_Line_Graph  graph_data={graph_data_state.graph_data} color_map={graph_data_state.color_map}  />) : (null)
        }


      </div>


    </div>


  );
}

export default Lap_Time_Line_Page;

