import './App.css';
import Basic from "./components/Basic"
import logo from './evvalogo1.png';

function App() {
  return (
    <div className="App">
      <div className="logo-container">
        <div className="logo-wrapper1">
          <img src={logo} alt="Logo" className="App-logo" />
        </div>
        <div className="logo-wrapper2">
          <img src={logo} alt="Logo" className="App-logo" />
        </div>
      </div>
      <Basic />
    </div>
  );
}

export default App;
