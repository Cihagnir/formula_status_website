// Import Section 
import React from 'react' ; 

// Css Imoprt
import "./Home_Page.css"
import home_page_backgraound from '../img/home_page_back.jpg';


function Home_Page () {

  return(
    <div className='HP_Main_Div'>
      <img src={home_page_backgraound} alt="Formula 1 Background" className="HP_Background_Image" />
      <div className='HP_Blur_Div'> 
        Form
      </div>
      <div className='HP_Righ_Div'>
        <span className='HP_Right_Title_Span'> ulatics </span>
        <>
        {
          /** Basic Text 
          <span className='HP_Right_Text_Span'>
          Your friendly website for Formula 1 analytics . 
          </span>
          */
        }
        </>
      </div>
    </div>
  );

}


export default Home_Page;

