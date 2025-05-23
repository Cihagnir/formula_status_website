
// Library Imports
import axios from 'axios';
import React, {useState, useEffect} from 'react';

// Project Imports
import { BASE_URL } from '../../../Commen_Utils';
import { Tyre_Stint_Graph } from './Graph_Obj';
import { tyre_stint_graph_interface } from '../../../Commen_Utils';

// CSS Import 
import './Tyre_Stint_Page.css'
import home_page_backgraound from '../../../../img/home_page_back.jpg';



// Const Defines
const LOCAL_DEBUG = false ; 


// Page Export Function
function Tyre_Stint_Page(){

  // ======== UseState Section ========

  // Dropdown Box Selection and Data 
  const [selected_race_state, set_selected_race_state] = useState('')
  const [selected_year_state, set_selected_year_state] = useState('')

  // Dropdown Box Datas
  const [seassion_array_state, set_seassion_array_state] =useState<Array<string>>( [] ) ;
  const [track_name_array_state, set_track_name_array_state] = useState<Array<string>>( [] ) ;

  // Plotly Graph Data 
  const [graph_data_state, set_graph_data_state ] = useState< tyre_stint_graph_interface | null>( null);

  
  // Api Fetch Function
  const api_fetch_func = async(sub_url: string , state_setter : React.Dispatch<React.SetStateAction<any>> ) => {

    if ( LOCAL_DEBUG )  console.log(BASE_URL + sub_url) ; 
    const api_response = await axios.get(BASE_URL + sub_url) ;
    state_setter(api_response.data.api_response) ;
    if (LOCAL_DEBUG) console.log(api_response.data.api_response)  ; 
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

      let backend_input_string : string = `/graph/race_tyre_stint/?year=${selected_year_state}&race_name=${selected_race_state.split("  ")[0]}&session_name=${selected_race_state.split("  ")[1]}` ;
      api_fetch_func(backend_input_string, set_graph_data_state)      
    }
  }, [selected_year_state, selected_race_state] )


// =========== Return Section ===========
  return (
    <div className='TS_Main_Div'>

      <img src={home_page_backgraound} alt="Formula 1 Background" className="TS_Background_Image" />
      <div className='TS_Blur_Div' ></div>

      <div className='TS_Window_Div'> 

      
        <div className='TS_Combined_Div'>
        
          <div className='TS_Info_Section'>
        
            <h3 className='TS_Info_Title'>
              Tyre Stint
            </h3>
        
            <span className='TS_Info_Text'>
              This page lets you explore the tyre stints of drivers across different races. 
              Use the dropdowns to select a specific year and race, and the graph will 
              show how long each driver ran on their tyres during the race. It's a simple 
              way to dive into tyre strategies and see how they impacted the race!
            </span>
        
          </div>

          <div className='TS_Divider'></div>

          <div className='TS_ComboBox_Section'>
        
            <div className='TS_Select_Group'>
        
              <p className='TS_Select_Title_Span'>Season:</p>
              <select className='TS_Select_Box' id='Season_Select_Box'
                onChange={() => { set_selected_year_state((document.getElementById("Season_Select_Box") as HTMLInputElement).value) }}>
                <option value={''} > {'Select the Seassion'} </option> ;
                
                {
                  seassion_array_state.map(
                    (track_name, index) => (
                      <option value={track_name} > {track_name} </option>
                    ) 
                  )
                } 
              </select>
            </div>

            <div className='TS_Select_Group'>

              <p className='TS_Select_Title_Span'>Races:</p>
              <select className='TS_Select_Box TS_Race_Box' id='Race_Select_Box'
                onChange={() => { set_selected_race_state((document.getElementById("Race_Select_Box") as HTMLInputElement).value) }}>
                <option value={''} > {'Select the Seassion'} </option> ;
                {
                  track_name_array_state.map(
                    (track_name, index) => (
                      <option value={track_name} > {track_name} </option>
                    ) 
                  )
                }  
              </select>
            </div>
          
          </div>
        
        </div>

        {
          (graph_data_state !== null) ? (<Tyre_Stint_Graph  graph_data={graph_data_state.graph_data} color_maps={graph_data_state.color_maps}  />) : (null)
        }
      
      </div>

    </div>
  );
}



export default Tyre_Stint_Page ;
