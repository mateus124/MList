import './App.css'
import Header from './components/Header/Header';
import Column from './components/Column/Column';

function App() {
  const columns = ['col-1', 'col-2', 'col-3', 'col-4'];

  return (
    <div>
      <Header/>
      <div className="columns">
        {columns.map((columnId) => (
          <Column key={columnId} columnId={columnId}/>
        ))}
      </div>
    </div>
  )
}

export default App
