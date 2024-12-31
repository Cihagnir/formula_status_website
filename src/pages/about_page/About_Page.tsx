
// Import Section 
import Lottie from "lottie-react"

// Css Imoprt
import "./About_Page.css"

// External Imports 
import github_icon from "../img/github-brands-solid.svg"
import mail_icon from "../img/envelope-solid.svg"
import animation_json from "../img/about_page_animation.json"


function About_Page () {


  return(

    <div className= 'About_Page_Main_Div' >
      
      <div className= 'Info_Div'>

        <div className= 'Info_Text_Div'>
          
          <h1 className= 'Info_Title_Heading'>
            Hello there ...
          </h1>

          <span className= 'Info_Text_Span ' >
          If you’ve surfed through most of the pages and ended up here, it means we’ve either done something really well 
          or terribly wrong! The Formulatics website started—and continues to grow—as one of my hobby projects. My goal 
          is to create an open-source, easy-to-use website for basic analytics and information about Formula One. I hope 
          I’ve managed to achieve at least part of that goal so far.
          </span>

          <span className= 'Info_Text_Span ' >
          A little technical explanation... <br/>
          At its current state, the site probably lacks many of the features it could have. I’ve included a link to the 
          Git repository below, so anyone willing to help improve it is welcome to contribute updates to the source code.
          </span>

        </div>

        <div className= 'Info_Link_Div'>
          
          <div className= 'Link_Div Git'>

            <img className= 'GitHub_Icon_Img'
              src= {github_icon }>
            </img>

            <a className= 'Link_Text' href= "https://github.com/Cihagnir/formula_status_website">
              Git-Hub
            </a>
          </div>

          <div className= 'Link_Div Mail'>

            <img className= 'Mail_Icon_Img'
              src= {mail_icon }>
            </img>

            <a className= "Link_Text" href= "">
              cihangiryigit.yigit@hotmail.com
            </a>
            </div>

        </div>

      </div>

      <div className= 'Animation_Div'>
        <Lottie animationData={animation_json} />
      </div>

    </div>

  );

}


export default About_Page;

