// Import 
import axios from 'axios';
import React, {useState, useEffect } from 'react';

// Hand Made Import 
import { BASE_URL} from '../../Commen_Utils';
import {Lap_Time_Graph, lap_duration_graph_data_interface }from './Graph_Obj';

// CSS Import 
import './Lap_Time_Distr_Page.css' ;
import home_page_backgraound from '../../../../img/home_page_back.jpg';


function Lap_Time_Distr_Page (){


  // Dropdown Box Selection and Data 
  const [selected_race_state, set_selected_race_state] = useState("")
  const [selected_year_state, set_selected_year_state] = useState('')
  
  // Plotly Graph Data 
  const [graph_data_state, set_graph_data_state ] = useState<Array<lap_duration_graph_data_interface> | null>(null)
  
  // Dropdown Box Datas
  const [seassion_array_state, set_seassion_array_state] =useState( [] ) ;
  const [track_name_array_state, set_track_name_array_state] = useState( ['Select the Race'] ) ;
  


  // Api Fetch Function
  const api_fetch_func = async(sub_url: string , state_setter : React.Dispatch<React.SetStateAction<any>> ) => {
    
    console.log(BASE_URL + sub_url)

    const api_response = await axios.get(BASE_URL + sub_url)
    console.log(BASE_URL + sub_url);
    state_setter(api_response.data.api_response) ;
  }

  // Fetch the Track Name Data 
  useEffect(() => {
   
    if (! (selected_year_state === '') ) {

      let backend_input_string  = `/ui/year/${selected_year_state}/Race/`
      api_fetch_func(backend_input_string, set_track_name_array_state); 
    }
  }, [selected_year_state ] )

  // Fetch the Seassion Year Data
  useEffect( () => {
    
    let backend_input_string = '/ui/year/' 
    api_fetch_func(backend_input_string, set_seassion_array_state); 
  }, [])

  // Fetch the Graph Data 
  useEffect( () => {

    if (! (selected_race_state === '') ) {
      let backend_input_string  = `/graph/Race/Lap_Time_Distr/${selected_year_state}/${selected_race_state.split("   ")[0]}/${selected_race_state.split("   ")[1]}/`;
      api_fetch_func(backend_input_string, set_graph_data_state) ;
    }
  }, [selected_year_state, selected_race_state] )

  
  return (

    <div className='LTD_Main_Div'>

      <img src={home_page_backgraound} alt="Formula 1 Background" className="LTD_Background_Image" />
      <div className='LTD_Blur_Div' ></div>

      
      <div className='LTD_Window_Div'>

        <div className='LTD_Combined_Container'>
      
          <div className='LTD_Info_Div'>
      
            <h3 className='LTD_Info_Title'>
              Drivers' Lap Time Distrubation
            </h3>
      
            <span className='LTD_Info_Text'>
            Explore lap time distribution for each races. The graph reveals 
            drivers' consistency, pace variations, and outliers,  helping you 
            analyze performance trends and key race moments. Dive in and see 
            the story behind the numbers !
      
            </span>
      
          </div>

          <div className= 'LTD_ComboBox_Div'>
            
            <p className= 'LTD_Select_Title_Span'> Season : </p>

            <select className= 'LTD_Select_Box' id='Season_Select_Box' 
            onChange={() => { set_selected_year_state( ( document.getElementById("Season_Select_Box") as HTMLInputElement).value ) }} >
              <option value={''} > {'Select the Seassion'} </option> ;
              {
                seassion_array_state.map(
                  (track_name, index) => (
                    <option value={track_name} > {track_name} </option>
                  ) 
                )
              } 
            </select>    

            <p className= 'LTD_Select_Title_Span LTD_Race'> Races : </p>
            
            <select className= 'LTD_Select_Box LTD_Race_Box' id='Race_Select_Box' 
            onChange={() => { set_selected_race_state( ( document.getElementById("Race_Select_Box") as HTMLInputElement).value ) }}>          
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

        {
          (graph_data_state !== null) ? (<Lap_Time_Graph  graph_data={graph_data_state} />) : (null)
        }

      </div>
      

    </div>
  );
}

export default Lap_Time_Distr_Page;

