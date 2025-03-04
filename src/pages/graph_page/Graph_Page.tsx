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
              Welcome aganin to Formulatics ... 
              <br/>
              <br/>
              Here the our graph dashbord page. Graph dashboard allow you to go thourgh the different 
              graph visulisation for each session. To see the which graph currently we have, you can 
              check the flip card bellow the page. As sake of the development time we are trying to 
              add new graph as soon as possible. 
              <br/> 
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
                <a href='/graph/race/lap_time_line' > Lap Time </a>
                <a href='/graph/race/lap_time_distr'   > Lap Time Distribution</a>

              </div>
            
            </div>
          </div>

          <div className="GP_Flip_Card_Div">
            <div className="GP_Flip_Card_Inner_Div">
            
              <div className="GP_Flip_Card_Front_Div">
                <h2>Qualification</h2>
              </div>
            
              <div className="GP_Flip_Card_Back_Div">
                <a href="/graph/qualification/lap_time">Lap Time</a>
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



























