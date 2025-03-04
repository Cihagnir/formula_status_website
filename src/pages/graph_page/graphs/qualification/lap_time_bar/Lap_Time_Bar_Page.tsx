// Import 
import axios from 'axios';
import React, {useState, useEffect } from 'react';

// Hand Made Import 
import { BASE_URL} from '../../Commen_Utils';
import Lap_Time_Graph from './Graph_Obj';

// CSS Import 
import './Lap_Time_Bar_Page.css' ;



// Return function 
function Lap_Time_Bar_Page (){


  // Dropdown Box Selection and Data 
  const [selected_race_state, set_selected_race_state] = useState("")
  const [selected_season_state, set_selected_season_state] = useState('')
  const [selected_session_type_state, set_selected_session_type_state ] = useState('')
  
  // Graph Data 
  const [graph_data_state, set_graph_data_state ] = useState<Array<any> | null>(null)

  // Dropdown Box Datas
  const [seassion_array_state, set_seassion_array_state] =useState( [] ) ;
  const [track_name_array_state, set_track_name_array_state] = useState( ['Select the Race'] ) ;
  const [session_type_array_state, set_session_type_array_state ] = useState( ['Select the Session'])


  // Api Fetch Function
  const api_fetch_func = async(sub_url: string , state_setter : React.Dispatch<React.SetStateAction<any>> ) => {

    console.log(sub_url);
    const api_response = await axios.get(BASE_URL + sub_url)
    console.log(api_response.data.api_response);
    state_setter(api_response.data.api_response) ;
  }

  // Fetch the Seassion Year Data
  useEffect(() => {
    
    let backend_input_string = '/ui/seassion/' 
    api_fetch_func(backend_input_string, set_seassion_array_state); 
  }, [])

  // Fetch the Track Name Data 
  useEffect(() => {
   
    if (! (selected_season_state === '') ) {

      let backend_input_string  = `/ui/year/${selected_season_state}/`
      api_fetch_func(backend_input_string, set_track_name_array_state); 
    }
  }, [selected_season_state ] )

  // Fetch the Session Type Data 
  useEffect(() => {
    
    if (!(selected_race_state === '')) {

      let backend_input_string  = `/ui/session_type/${selected_season_state}/${selected_race_state}/`
      api_fetch_func(backend_input_string, set_session_type_array_state); 
    }
  },[selected_race_state])




  // Fetch the Graph Data 
  useEffect( () => {


    if (!(selected_race_state === '') && !(selected_session_type_state === '') ) {
      let backend_input_string  = `/graph/Qualification/Lap_Time_Bar/${selected_session_type_state}/${selected_season_state}/${selected_race_state}/` ;
      api_fetch_func(backend_input_string, set_graph_data_state)
    }
  }, [selected_race_state, selected_session_type_state] )

  
  return (
    
    <div className='LTQ_Main_Div'>

      <div className='LTQ_Info_Div'>
        
        <h3 className='LTQ_Info_Title'>
          Qualification Lap Time 
        </h3>

        <span className='LTQ_Info_Text'>

        </span>

      </div>

      <div className= 'LTQ_ComboBox_Div'>
        
        <p className= 'LTQ_Select_Title_Span'> Season : </p>
        <select className= 'LTQ_Select_Box' id='Season_Select_Box' 
        onChange={() => { set_selected_season_state( ( document.getElementById("Season_Select_Box") as HTMLInputElement).value ) }} >
          <option value={'None'} > {'Select the Seassion'} </option> ;
          {
            seassion_array_state.map(
              (track_name, index) => (
                <option value={track_name} > {track_name} </option>
              ) 
            )
          } 
        </select>    

        <p className= 'LTQ_Select_Title_Span LTQ_Race'> Races : </p>
        <select className= 'LTQ_Select_Box LTQ_Race_Box' id='Race_Select_Box' 
        onChange={() => { set_selected_race_state( ( document.getElementById("Race_Select_Box") as HTMLInputElement).value ) }}>          
          {
            track_name_array_state.map(
              (track_name, index) => (
                <option value={track_name} > {track_name} </option>
              ) 
            )
          }  

        </select>   

        <p className= 'LTQ_Select_Title_Span LTQ_Race'> Session Type : </p>

        <select className= 'LTQ_Select_Box LTQ_Race_Box' id='Session_Select_Box' 
        onChange={() => { set_selected_session_type_state( ( document.getElementById("Session_Select_Box") as HTMLInputElement).value ) }}>    
          <option value={''} > {'Select the Seassion Type'} </option> ;
          {
            session_type_array_state.map(
              (session_type_name, index) => (
                <option value={session_type_name} > {session_type_name} </option>
              ) 
            )
          }  

        </select>  

      </div>

      <div className= {` LTQ_Graph_Div ${ (graph_data_state !== null) ? ('') : ('isPassive') } `}>
        {
          (graph_data_state !== null) ? (<Lap_Time_Graph  graph_data={graph_data_state} />) : (null)
        }
      </div>

    </div>


  );
}

export default Lap_Time_Bar_Page;

