import './App.css'
import Header from './components/Header/Header';
import Column from './components/Column/Column';

function App() {
  return (
    <div>
      <Header/>
      <div className="columns">
        <Column/>
        <Column/>
        <Column/>
        <Column/>
      </div>
    </div>
  )
}

export default App
