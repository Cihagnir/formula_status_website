
// Import Section 
import React from 'react' ; 

// Css Imoprt
import "./Home_Page.css"
import  home_page_img from '../img/home_page_img.png';



function Home_Page () {

  return(

    <div className= 'Home_Page_Main_Div' >

      <div className= 'Page_Info_Div' >
        
        <div>

          <h1 className= 'Page_Title_Heading' >
            Formulatics 
          </h1>

          <p className= 'Page_Information_Span' >
              Hi there! Welcome to my little Formula One corner on the web. This is a hobby project I’ve been 
              tinkering with to share to other Formula fans. Here, you’ll find a simple and easy-to-use interface 
              to check out the numbers behind the action. It’s not a super polished or professional site, but it’s 
              made with care for fellow fans who enjoy diving into the details. Whether you’re here for fun or just  
              out of curiosity, I hope you find something you like !
          </p>

        </div>

      </div> 

      <div className= 'Page_Img_Div'>

        <img className= 'Home_Page_Img' 
          src= {home_page_img}>
        </img>

      </div>
      


    </div>

  );

}


export default Home_Page;

