// Css Imoprt 
import "./Graph_Page.css"


// External Imports 
import GP_Background from "../img/Interlagos-Merc (1).jpg"




function Graph_Page() {




  return(

    <div className= "GP_Main_Div ">

      <img src={ GP_Background } className="GP_Background_Img"/>
      
      <div className="GP_Content_Container">

        <div className="GP_Text_Area">
          <h3 className="GP_Tittle_Heading">
            Graphs
          </h3>

          <span className="GP_Text_Span" >

          </span>


        </div>
        
        <div className="GP_Cards_Div">
          <div className="GP_Flip_Card_Div">
            <div className="GP_Flip_Card_Inner_Div">
            
              <div className="GP_Flip_Card_Front_Div">
                <h2>Race</h2>
              </div>
            
              <div className="GP_Flip_Card_Back_Div">
                <a href='/graph/race/tyre_stint' > Tyre Stint </a> 
                <a href='/graph/race/lap_time_line' > Tyre Stint Line</a>
                <a href='/graph/race/lap_time_distr'   > Lap time Distr</a>

              </div>
            
            </div>
          </div>

          <div className="GP_Flip_Card_Div">
            <div className="GP_Flip_Card_Inner_Div">
            
              <div className="GP_Flip_Card_Front_Div">
                <h2>Qualification</h2>
              </div>
            
              <div className="GP_Flip_Card_Back_Div">
                <a href=""></a>
              </div>
            
            </div>
          </div>

          <div className="GP_Flip_Card_Div">
            <div className="GP_Flip_Card_Inner_Div">
            
              <div className="GP_Flip_Card_Front_Div">
                <h2>Practice</h2>
              </div>

              <div className="GP_Flip_Card_Back_Div">
                <a href=""></a>
              </div>
            
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}



export default Graph_Page ;



























