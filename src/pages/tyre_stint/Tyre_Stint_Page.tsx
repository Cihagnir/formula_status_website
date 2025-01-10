
// General Import 
import axios from 'axios';
import React, {useState, useEffect} from 'react';

// Hand Made Import 
import { Control_Bar, BASE_URL } from '../Common_Items';
import { Tyre_Stint_Graph } from './Graph_Obj';

// CSS Import 
import './Tyre_Stint_Page.css'




function Tyre_Stint_Page(){

  // Dropdown Box Selection and Data 
  const [selected_race_state, set_selected_race_state] = useState('')
  const [selected_season_state, set_selected_season_state] = useState('')

  // Dropdown Box Datas
  const [seassion_array_state, set_seassion_array_state] =useState<Array<string>>( [] ) ;
  const [track_name_array_state, set_track_name_array_state] = useState<Array<string>>( [ ] ) ;

  // Plotly Graph Data 
  const [graph_data_state, set_graph_data_state ] = useState<Array<any> | null>( null);

  
  // Api Fetch Function
  const api_fetch_func = async(sub_url: string , state_setter : React.Dispatch<React.SetStateAction<any>> ) => {

    console.log(BASE_URL + sub_url) ; 
    const api_response = await axios.get(BASE_URL + sub_url) ;
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
      let backend_input_string : string = `/graph/Tyre_Stint/Race/${selected_season_state}/${selected_race_state}/` ;
      api_fetch_func(backend_input_string, set_graph_data_state)      
    }
  }, [selected_race_state] )


  return (

    <div className= 'Tyre_Stint_Page_Main_Div' >

      <Control_Bar/>

      <div className= 'Graph_Control_Div'>


        <div className= 'Title_Area_Div' >
          
          <h3>
            Tyre Stints Graph
          </h3>
          
          <p className= 'Title_Area_Text_Div'>
          This page lets you explore the tyre stints of drivers across different races. 
          Use the dropdowns to select a specific year and race, and the graph will 
          show how long each driver ran on their tyres during the event. It's a simple 
          way to dive into tyre strategies and see how they impacted the race!
          </p>
          
        </div>

        <div className= 'Selection_Area_Div' >

          <div className= 'Season Select_Div'>

            <p className= 'Select_Title_Span'> Season : </p>
            <select className= 'Season_Select_Box' id='Season_Select_Box' 
            onChange={ () => { set_selected_season_state( ( document.getElementById("Season_Select_Box") as HTMLInputElement ).value ) } } >
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

          <div className= 'Race Select_Div'>
            
            <p className= 'Select_Title_Span'> Races : </p>
            <select className= 'Race_Select_Box' id='Race_Select_Box' 
            onChange={() => { set_selected_race_state( ( document.getElementById("Race_Select_Box") as HTMLInputElement ).value ) } }>
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

      <div className= 'Graph_Area_Div'>
        {
           (graph_data_state !== null) ? (<Tyre_Stint_Graph  graph_data={graph_data_state} />) : (null)
        }
      </div>

    </div>

  );
}



export default Tyre_Stint_Page ;

