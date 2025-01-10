
// Import 
import axios from 'axios';
import React, {useState, useEffect } from 'react';

// Hand Made Import 
import { Control_Bar, BASE_URL} from '../Common_Items';
import {Lap_Time_Graph, graph_data_interface }from './Graph_Obj';

// CSS Import 
import './Lap_Time_Page.css' ;


function Lap_Time_Page (){


  // Dropdown Box Selection and Data 
  const [selected_race_state, set_selected_race_state] = useState("")
  const [selected_season_state, set_selected_season_state] = useState('2024')
     
  // Graph Control 
  const [tyre_stint_selection_state, set_tyre_stint_selection_state ] = useState(false); 
  const [track_sector_selection_state, set_track_sector_selection_state ] = useState(false); 
  const [graph_divider_parameter_state, set_graph_divider_parameter_state ] = useState("driver");
  
  // Plotly Graph Data 
  const [graph_data_state, set_graph_data_state ] = useState<Array<graph_data_interface> | null>(null)
  
  // Dropdown Box Datas
  const [seassion_array_state, set_seassion_array_state] =useState( ["Select Seassion"] ) ;
  const [track_name_array_state, set_track_name_array_state] = useState( ["Select Race" ] ) ;
  


  // Api Fetch Function
  const api_fetch_func = async(sub_url: string , state_setter : React.Dispatch<React.SetStateAction<any>> ) => {

    const api_response = await axios.get(BASE_URL + sub_url)
    console.log(api_response.data.api_response);
    state_setter(api_response.data.api_response) ;
  }

  // Fetch the Track Name Data 
  useEffect(() => {
   
    let backend_input_string  = `/ui/year/${selected_season_state}/`
    api_fetch_func(backend_input_string, set_track_name_array_state); 
  }, [selected_season_state ] )

  // Fetch the Seassion Year Data
  useEffect( () => {
    
    let backend_input_string = '/ui/seassion/' 
    api_fetch_func(backend_input_string, set_seassion_array_state); 
  }, [])

  // Fetch the Graph Data 
  useEffect( () => {

    if (! (selected_race_state === '') ) {
      let backend_input_string  = `/graph/Lap_Time/Race/${selected_season_state}/${selected_race_state}/` ;
      api_fetch_func(backend_input_string, set_graph_data_state)
    }
  }, [selected_race_state, graph_divider_parameter_state] )

  
  return (
    

    <div className='Lap_Time_Page_Main_Div'>
      
      <Control_Bar/>
    
      <div className= 'Graph_Control_Div'>
        

        <div className= 'Title_Area_Div' >
          
          <h3>
            Lap Time Graph
          </h3>
          
          <p className= 'Title_Area_Text_Div'>
          This page provides a detailed look at the lap time distribution of drivers for a selected race. By using the dropdown menus, you can {<br/>}
          choose a specific year and race to explore. The box plot visualizes how consistent or varied the lap times were for each driver, {<br/>} 
          highlighting their overall pace and any outliers that occurred during the event. It’s a useful way to understand performance trends, identify {<br/>} 
          key moments, and compare how drivers managed their speed over the course of the race. Dive in and see how the numbers tell the story!

          </p>
          
        </div>

        <div className= 'Selection_Area_Div' >

          <div className= 'Season Select_Div'>

            <p className= 'Select_Title_Span'> Season : </p>
            <select className= 'Season_Select_Box' id='Season_Select_Box' 
            onChange={() => { set_selected_season_state( ( document.getElementById("Season_Select_Box") as HTMLInputElement).value ) }} >
              {
                seassion_array_state.map(
                  (track_name, index) => (
                    <option value={track_name} > {track_name} </option>
                  ) 
                )
              } 

            </select>    

          </div>

          <div className= 'Race Select_Div'>
            
            <p className= 'Select_Title_Span'> Races : </p>
            <select className= 'Race_Select_Box' id='Race_Select_Box' 
            onChange={() => { set_selected_race_state( ( document.getElementById("Race_Select_Box") as HTMLInputElement).value ) }}>
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
        
        <div className= 'Options_Area_Div' >

          <button className= {` Tyre_Stint_Button ${ (tyre_stint_selection_state) ? ("Selected") : ('') }`} 
            onClick={ 
              () => {
                  set_tyre_stint_selection_state(!tyre_stint_selection_state);
                  set_graph_divider_parameter_state("tyre_type");

                  if ( track_sector_selection_state)
                    set_track_sector_selection_state(!track_sector_selection_state);

                  if ( tyre_stint_selection_state )
                    set_graph_divider_parameter_state("driver_name")

                }
              }
          >
            Tyre Stint  
          </button>

          <button className= {` Track_Sector_Button ${ (track_sector_selection_state) ? ("Selected") : ('') }`} 
            onClick={ 
              () => {
                set_track_sector_selection_state(!track_sector_selection_state);
                set_graph_divider_parameter_state("sector");
                
                if ( tyre_stint_selection_state) 
                  set_tyre_stint_selection_state(!tyre_stint_selection_state);
                
                if ( track_sector_selection_state )
                  set_graph_divider_parameter_state("driver");
                }
              }
          > 
          Track Sectors 
          </button>
            
        </div>


      </div>


      <div className= 'Graph_Area_Div'>
        {
          (graph_data_state !== null) ? (<Lap_Time_Graph  graph_data={graph_data_state} />) : (null)
        }
      </div>

    </div>


  );
}

export default Lap_Time_Page;

