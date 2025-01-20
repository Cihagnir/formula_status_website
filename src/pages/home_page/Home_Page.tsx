
// Import Section 
import React from 'react' ; 

// Css Imoprt
import "./Home_Page.css"
import  home_page_img from '../img/home_page_img.png';


function Home_Page () {

  return(

    <div className = 'HP_Main_Div' >


      <div className = 'HP_Sub_Div'>

        <div className= 'HP_First_Row_Div'>

          <span className= 'HP_Title_Span'> Formulatics </span>
        
        </div>

        <div className= 'HP_Second_Row_Div' >

          <div className= 'HP_Second_Row_Space_Div' >
          </div>

          <span className= 'HP_Info_Text_One_Span' >
          Hi there! Welcome to my little Formula One corner on the web. This is a hobby project I’ve been 
          tinkering with to share to other Formula fans. Here, you’ll find a simple and easy-to-use interface 
          to check out the numbers behind the action.
          </span>

        </div>

        <div className= 'HP_Third_Row_Div' >

          <span className= 'HP_Info_Text_Two_Span' >
            It’s not a super polished or professional site, but it’s made with care for fellow fans 
            who enjoy diving into the details. Whether you’re here for fun or just  out of curiosity, 
            I hope you find something you like !
          </span>

          <div className= 'HP_Third_Row_Space_Div' >
          </div>

        </div>

        <div className= 'HP_Fourth_Row_Div'>

          <div className= 'HP_Fourth_Row_Space_Div'>
          </div>

          <span className= 'HP_Img_Info_Span' >
            Turkey Grand Prix  <br />
            Istanbul Park  <br />
            2008
          </span>
          <img className= 'HP_Img' 
            src= {home_page_img}>
          </img>



        </div>

      </div>

    </div>

  );

}


export default Home_Page;

