
// General Import 
import Plot from 'react-plotly.js'
import React, {useState, useEffect} from 'react';


// Hand Made Import 
import { Control_Bar } from '../Common_Items';


// CSS Import 
import './Tyre_Stint_Page.css'





function Tyre_Stint_Page(){

  // Dropdown Box Selection and Data 
  const [selected_race_state, set_selected_race_state] = useState('')
  const [selected_season_state, set_selected_season_state] = useState('2024')

  // Dropdown Box Datas
  const [seassion_array_state, set_seassion_array_state] =useState<Array<string>>( ["Select Seassion"] ) ;
  const [track_name_array_state, set_track_name_array_state] = useState<Array<string>>( [ ] ) ;

  // Plotly Graph Data 
  const [graph_data_state, set_graph_data_state ] = useState({data: [], layout: {}})



  // Fetch the Track Name Data 
  useEffect(() => {
    
    const backend_input_string : string = `/ui/${selected_season_state}/`

    fetch(backend_input_string)
      .then( backend_response => backend_response.json())
      .then(
        backend_response => {
          
        let track_name_array: Array<string> = backend_response.query_return;

        set_track_name_array_state(track_name_array);
    
      }
    )
  }, [selected_season_state ] )

  // Fetch the Seassion Year Data
  useEffect( () => {
    
    const backend_input_string : string = '/ui/seassion/' 

    fetch(backend_input_string)
      .then( backend_response => backend_response.json() )
      .then( backend_data => {
        
        let seassion_list : Array<string> = backend_data.query_return ;
        set_seassion_array_state(seassion_list);

      } )

  }, [])

  // Fetch the Graph Data 
  useEffect( () => {

    const backend_input_string : string = `/graph/Tyre_Stint/Race/${selected_season_state}/${selected_race_state}/` ;
    console.log(backend_input_string);

    fetch(backend_input_string)
      .then( backend_response => backend_response.json() )
      .then( backend_data => set_graph_data_state(backend_data) )

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
        
        <div className= 'Graph_Div' >
          <Plot data={graph_data_state.data} layout={graph_data_state.layout} />
        </div>
        
      </div>

    </div>

  );
}



export default Tyre_Stint_Page ;

