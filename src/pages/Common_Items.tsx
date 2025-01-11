
// Import 
import React, {useState} from 'react';

// CSS Import
import './Common_Items.css'; 


export var BASE_URL = "https://formulatics.onrender.com" ;


export function Control_Bar (){

  const [control_panel_status_state, set_control_panel_status_state] = useState(false) ;



  
  return (

    <div className='Control_Div'>
    <button className=
    {` Control_Panel_Icon_Button  ${ (control_panel_status_state) ? ('Panel_Pop') : ('') }  `}
    onClick={
      () => {
        set_control_panel_status_state(!control_panel_status_state)
      }
    }>
    </button>


    <div className= {` Control_Panel_Div  ${ (control_panel_status_state) ? ('') : ('Is_Passive_Panel') }  `}>

      <div className= {` Control_Panel_Text_Div  ${ (control_panel_status_state) ? ('') : ('Is_Passive_Text') } `} >

        <p> <a href='/Graph/Lap_Time' className = {` Control_Panel_Text_Span  ${ (control_panel_status_state) ? ('') : ('Is_Passive_Text') } `} > 
          Lap time 
        </a> </p>

        <p> <a href='/Graph/Tyre_Stint' className = {` Control_Panel_Text_Span  ${ (control_panel_status_state) ? ('') : ('Is_Passive_Text') } `} > 
          Tyre stint 
          </a> </p>

      </div>

    </div>
  
  </div>  


  );


}












