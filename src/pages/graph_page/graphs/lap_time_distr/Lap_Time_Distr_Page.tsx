
// Import 
import axios from 'axios';
import React, {useState, useEffect } from 'react';

// Hand Made Import 
import { BASE_URL} from '../Commen_Utils';
import {Lap_Time_Graph, graph_data_interface }from './Graph_Obj';

// CSS Import 
import './Lap_Time_Distr_Page.css' ;


function Lap_Time_Distr_Page (){


  // Dropdown Box Selection and Data 
  const [selected_race_state, set_selected_race_state] = useState("")
  const [selected_season_state, set_selected_season_state] = useState('')
  
  // Plotly Graph Data 
  const [graph_data_state, set_graph_data_state ] = useState<Array<graph_data_interface> | null>(null)
  
  // Dropdown Box Datas
  const [seassion_array_state, set_seassion_array_state] =useState( [] ) ;
  const [track_name_array_state, set_track_name_array_state] = useState( ['Select the Race'] ) ;
  


  // Api Fetch Function
  const api_fetch_func = async(sub_url: string , state_setter : React.Dispatch<React.SetStateAction<any>> ) => {

    const api_response = await axios.get(BASE_URL + sub_url)
    state_setter(api_response.data.api_response) ;
  }

  // Fetch the Track Name Data 
  useEffect(() => {
   
    if (! (selected_season_state === '') ) {

      let backend_input_string  = `/ui/year/${selected_season_state}/`
      api_fetch_func(backend_input_string, set_track_name_array_state); 
    }
  }, [selected_season_state ] )

  // Fetch the Seassion Year Data
  useEffect( () => {
    
    let backend_input_string = '/ui/seassion/' 
    api_fetch_func(backend_input_string, set_seassion_array_state); 
  }, [])

  // Fetch the Graph Data 
  useEffect( () => {

    if (! (selected_race_state === '') ) {
      let backend_input_string  = `/graph/Lap_Time_Distr/Race/${selected_season_state}/${selected_race_state}/` ;
      api_fetch_func(backend_input_string, set_graph_data_state)
    }
  }, [selected_season_state, selected_race_state] )

  
  return (
    
    <div className='LT_Main_Div'>

      <div className='LT_Info_Div'>
        
        <h3 className='LT_Info_Title'>
          Lap Time Distrubation
        </h3>

        <span className='LT_Info_Text'>
        Explore lap time distribution for each races. The graph reveals 
        drivers' consistency, pace variations, and outliers,  helping you 
        analyze performance trends and key race moments. Dive in and see 
        the story behind the numbers !
        </span>

      </div>

      <div className= 'LT_ComboBox_Div'>
        
        <p className= 'LT_Select_Title_Span'> Season : </p>
        <select className= 'LT_Select_Box' id='Season_Select_Box' 
        onChange={() => { set_selected_season_state( ( document.getElementById("Season_Select_Box") as HTMLInputElement).value ) }} >
          <option value={''} > {'Select the Seassion'} </option> ;
          {
            seassion_array_state.map(
              (track_name, index) => (
                <option value={track_name} > {track_name} </option>
              ) 
            )
          } 
        </select>    

        <p className= 'LT_Select_Title_Span LT_Race'> Races : </p>
        <select className= 'LT_Select_Box LT_Race_Box' id='Race_Select_Box' 
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

      <div className= {` LT_Graph_Div ${ (graph_data_state !== null) ? ('') : ('isPassive') } `}>
        {
          (graph_data_state !== null) ? (<Lap_Time_Graph  graph_data={graph_data_state} />) : (null)
        }
      </div>

    </div>


  );
}

export default Lap_Time_Distr_Page;

