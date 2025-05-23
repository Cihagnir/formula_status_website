
// CSS Import 
import './App.css';
import x_img from './pages/img/X_icon.svg'
import git_hub_img from './pages/img/github_icon.svg'



function App() {

  return (

    <div className='App_Div' > 

      <div className='Nav_Bar'>

        <a className='Nav_Bar_Img_Item ' href='https://github.com/Cihagnir/Formulatics'>
          <img src={git_hub_img} alt="GitHub" className="Nav_Bar_Item_Img" />
        </a>

        <a className='Nav_Bar_Img_Item' href='https://github.com/Cihagnir/Formulatics'>
          <img src={x_img} alt="GitHub" className="Nav_Bar_Item_Img" />
        </a>

        <a className='Nav_Bar_Item Space_Bar'> </a>
          
        <a className='Nav_Bar_Item' href='/'>
        Home
        </a>
        
        <a className='Nav_Bar_Item' href="/graph">
          Graph
        </a>
        
        <a className='Nav_Bar_Item' href="/About">
          About
        </a>

      </div>
    </div>

  
);
}

export default App;
