
// Css Imoprt
import "./About_Page.css"

// External Imports 
import AP_Background from "../img/about_page_backl.png"



function About_Page () {

  return(

    <div className= 'AP_Main_Div' >
      
      <img src={AP_Background} alt="Formula 1 Background" className="AP_Background_Img" />

      <svg className="AP_Back_Svg">
        <rect x="-400" y="400" width='2400' height="750" transform=" rotate(-30 -700 500)" fill="#A6051A" opacity="0.7"/>
      </svg>

      <div className="AP_Background_Div">
        <h3 className="AP_Info_Tittle">
          About us ...
        </h3>

        <span className="AP_Info_Text">
        This website is a passion project built for fellow Formula One fans who love diving into the numbers <br/>
        behind the action. My goal is to create an open-source, easy-to-use platform for exploring race <br/>
        data, analytics, and insights in a simple and accessible way. It’s not a polished, professional <br/>
        site—just something made with care for those who enjoy the technical side of the sport.
        <br/>
        <br/>
        If you’ve made it to this page, you’re either enjoying the content or wondering <br/>
        what’s going on! Formulatics started as a hobby project and continues <br/>
        to evolve with contributions from enthusiasts like you. If you’re <br/> 
        interested in helping improve the site, feel free to check out <br/> 
        the GitHub repository and contribute to the code. Whether <br/>
        you're  here for fun, curiosity, or deep analysis, <br/>
        I hope you find something interesting!
        </span>
      </div>
    </div>

  );

}


export default About_Page;

