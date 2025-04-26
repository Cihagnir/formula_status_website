// Import 
import axios from 'axios';
import React, {useState, useEffect } from 'react';

// Hand Made Import 
import { BASE_URL} from '../../Commen_Utils';
import Lap_Time_Graph from './Graph_Obj';

// CSS Import 
import './Lap_Time_Bar_Page.css' ;
import home_page_backgraound from '../../../../img/home_page_back.jpg';



// Return function 
function Lap_Time_Bar_Page (){


  // Dropdown Box Selection and Data 
  const [selected_sub_session, set_selected_sub_session] = useState(0); 
  const [selected_race_state, set_selected_race_state] = useState("")
  const [selected_year_state, set_selected_year_state] = useState('')
  const [sub_session_name_state, set_sub_session_name_state] = useState('') ;
  
  // Graph Data 
  const [graph_data_state, set_graph_data_state ] = useState<Array<any> | null>(null)

  // Dropdown Box Datas
  const [seassion_array_state, set_seassion_array_state] =useState( [] ) ;
  const [track_name_array_state, set_track_name_array_state] = useState( ['Select the Race'] ) ;


  // Api Fetch Function
  const api_fetch_func = async(sub_url: string , state_setter : React.Dispatch<React.SetStateAction<any>> ) => {

    const api_response = await axios.get(BASE_URL + sub_url)
    console.log(api_response.data.api_response);
    state_setter(api_response.data.api_response) ;
  }

  // Fetch the Seassion Year Data
  useEffect(() => {
    
    let backend_input_string = '/ui/year/' 
    api_fetch_func(backend_input_string, set_seassion_array_state); 
  }, [])

  // Fetch the Track Name Data 
  useEffect(() => {
   
    if (! (selected_year_state === '') ) {
      let backend_input_string  = `/ui/year/${selected_year_state}/Qualifying/`
      api_fetch_func(backend_input_string, set_track_name_array_state); 
    }
  }, [selected_year_state ] )

  // Fetch the Graph Data 
  useEffect( () => {

    if (!(selected_race_state === '') ) {
      let backend_input_string  = `/graph/Qualification/Lap_Time_Bar/${selected_year_state}/${selected_race_state.split("   ")[0]}/${selected_race_state.split("   ")[1]}/${sub_session_name_state}/` ;
      api_fetch_func(backend_input_string, set_graph_data_state)
    }
  }, [selected_race_state, sub_session_name_state] )

  // Add useEffect to set initial sub session
  useEffect(() => {
    set_sub_session_name_state('Q1');
  }, []);


  const handleSessionChange = (session: number) => {
    set_selected_sub_session(session);
    set_sub_session_name_state(`Q${session + 1}`);
  };
  

  return (
    <div className='LTQ_Main_Div'>

      <img src={home_page_backgraound} alt="Formula 1 Background" className="LTQ_Background_Image" />
      <div className='LTQ_Blur_Div' />

      <div className='LTQ_Window_Div'>

        <div className='LTQ_Combined_Div'>
      
          <div className='LTQ_Combined_Upper_Div'>
      
            <h3 className='LTQ_Info_Title'>
              Qualification Lap Time 
            </h3>
      
            <span className='LTQ_Info_Text'>
            </span>
      
          </div>


          <div className='LTQ_Combined_Middle_Div'>
      
            <p className='LTQ_Select_Title_Span'> Season : </p>
            <select className='LTQ_Select_Box' id='Season_Select_Box' 
              onChange={() => { set_selected_year_state((document.getElementById("Season_Select_Box") as HTMLInputElement).value) }}>
              <option value={'None'} > {'Select the Seassion'} </option> ;
              {
                seassion_array_state.map(
                  (track_name, index) => (
                    <option value={track_name} > {track_name} </option>
                  ) 
                )
              } 
            </select>    

            <p className='LTQ_Select_Title_Span LTQ_Race'> Qualification : </p>
            <select className='LTQ_Select_Box LTQ_Race_Box' id='Race_Select_Box' 
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

          <div className='LTQ_Combined_Bottom_Div'>

            <div className='LTQ_Toggle_Container_Div'>
              <div 
                className='LTQ_Toggle_Slider_Div' 
                style={{ transform: `translateX(${selected_sub_session * 100}%)` }}
              />
              <div className='LTQ_Toggle_Options_Div'>
              
                {['Q1', 'Q2', 'Q3'].map((session, index) => (
                  <div
                    key={session}
                    className={`LTQ_Toggle_Option_Div ${selected_sub_session === index ? 'active' : ''}`}
                    onClick={() => handleSessionChange(index)}
                  >
                    {session}
                  </div>
                ))}
                
              </div>

            </div>
          </div>

        </div>

        {
          (graph_data_state !== null) ? (<Lap_Time_Graph  graph_data={graph_data_state} />) : (null)
        }
      
      </div>

    </div>
  );
}

export default Lap_Time_Bar_Page;

