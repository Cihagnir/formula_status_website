
// Css Imoprt
import "./About_Page.css"

// External Imports 
import AP_Background from "../img/about_page_backl.png"



function About_Page () {

  return(

    <div className= 'AP_Main_Div' >
      
      <img src={AP_Background} alt="Formula 1 Background" className="AP_Background_Img" />

      <svg className="AP_Back_Svg">
        <rect className="AP_Rect_Svg" x="-400" y="400" width='2400' height="750" transform=" rotate(-30 -700 500)"  />
      </svg>

      <div className="AP_Background_Div">
        <h3 className="AP_Info_Tittle">
          About us ...
        </h3>

        <span className="AP_Info_Text">

        This website is a passion project built for fellow Formula One fans who love diving into the numbers <br/>
        behind the action. The goal of website is to create an open-source platform for exploring race <br/>
        data, as soon as races have finished. It’s not a polished, professional site just something <br/>
        made with care for those who enjoy the technical side of the sport.
        <br/>
        <br/>
        If you’ve made it to this page, you’re either enjoying the content or wondering <br/>
        what’s going on! You can check the repository of the Formulatics. Feel free <br/>
        to express what you want or what it should be better.
        <br/>
        <br/>
        Whether you're  here for fun, curiosity, or deep analysis, <br/> 
        I hope you find something interesting <br/>


        </span>
      </div>
    </div>

  );

}


export default About_Page;

