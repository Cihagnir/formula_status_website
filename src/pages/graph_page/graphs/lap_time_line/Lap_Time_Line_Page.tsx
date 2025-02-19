// Import 
import axios from 'axios';
import React, {useState, useEffect } from 'react';

// Hand Made Import 
import {BASE_URL} from '../Commen_Utils';
import {Lap_Time_Line_Graph }from './Graph_Obj';

// CSS Import 
import './Lap_Time_Line_Page.css' ;


// Interface define section 
interface lap_data_interface {
  lap_number: number;
  lap_time: number;
}

interface graph_data_interface {
  [key : string] : Array<lap_data_interface> ;
}


// Interface Defines 
interface graph_input_interface {
  graph_data : graph_data_interface ;
}


function Lap_Time_Line_Page (){


  // Graph State Area 
  const [selected_race_state, set_selected_race_state] = useState("")
  const [selected_season_state, set_selected_season_state] = useState('')
  const [data_filter_state, set_data_filter_state] = useState(1);
  const [upper_bound_grpah_state, set_upper_bound_graph_state] = useState(1.5);
  const [lower_bound_grpah_state, set_lower_bound_graph_state] = useState(1.5);

  
  // Graph Data 
  const [graph_data_state, set_graph_data_state ] = useState<graph_input_interface | null>(null)
  
  // Dropdown Box Datas
  const [seassion_array_state, set_seassion_array_state] =useState( [] ) ;
  const [track_name_array_state, set_track_name_array_state] = useState( ['Select the Race'] ) ;
  
  // Sliders onChange Data
  const [upper_bound_state, set_upper_bound_state] = useState(1.5);
  const [lower_bound_state, set_lower_bound_state] = useState(1.5);


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
      let backend_input_string  = `/graph/Lap_Time_Line/Race/${selected_season_state}/${selected_race_state}/${data_filter_state}/${upper_bound_grpah_state}/${lower_bound_grpah_state}` ;
      api_fetch_func(backend_input_string, set_graph_data_state)
    }
  },
  [selected_race_state, selected_race_state, selected_season_state, data_filter_state, upper_bound_grpah_state, lower_bound_grpah_state] )

  
  return (
    
    <div className='LTL_Main_Div'>

      <div className='LTL_Info_Div'>
        
        <h3 className='LTL_Info_Title'>
          Lap Time Distrubation
        </h3>

        <span className='LTL_Info_Text'>
        Explore lap time distribution for each races. The graph reveals 
        drivers' consistency, pace variations, and outliers,  helping you 
        analyze performance trends and key race moments. Dive in and see 
        the story behind the numbers !
        </span>

      </div>

      <div className= 'LTL_ComboBox_Div'>
        
        <p className= 'LTL_Select_Title_Span'> Season : </p>
        <select className= 'LTL_Select_Box' id='Season_Select_Box' 
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

        <p className= 'LTL_Select_Title_Span LT_Race'> Races : </p>
        <select className= 'LTL_Select_Box LTL_Race_Box' id='Race_Select_Box' 
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

      <div className='LTL_Control_Container'>
        <button 
          className='LTL_Filter_Button'
          onClick={() => set_data_filter_state(prev => prev === 1 ? 0 : 1)}
        >
          {data_filter_state === 1 ? 'Show All Data' : 'Show Filtered Data'}
        </button>

        <div className='LTL_Range_Slider_Container'>
          <div className='LTL_Slider_Group'>
            <label>Lower Bound: {lower_bound_state.toFixed(2)}</label>
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
            <label>Upper Bound: {upper_bound_state.toFixed(2)}</label>
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
        </div>
      </div>

      <div className= {` LTL_Graph_Div ${ (graph_data_state !== null) ? ('') : ('isPassive') } `}>
        {
          (graph_data_state !== null) ? (<Lap_Time_Line_Graph  graph_data={graph_data_state.graph_data}  />) : (null)
        }
      </div>

    </div>


  );
}

export default Lap_Time_Line_Page;

