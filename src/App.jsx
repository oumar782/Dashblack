import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './Mainlayout/Sidebar'
import Header from './Mainlayout/Header'
import Apex from '../src/Page/Apex'
import Event from '../src/Page/Event'
import Defi from '../src/Page/Defis'
import Cameleon from '../src/Page/Cameleon'
import Priere from '../src/Page/Priere'
import Fracture from '../src/Page/Fracture'
import Lada from '../src/Page/Lada'

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <div className="main-content">
          <Header />
          <main className="main-container">
            <Routes>  
              <Route path="/apex" element={<Apex />} />
              <Route path="/Event" element={<Event  />} />
              <Route path="/Cameleon" element={<Cameleon  />} />
              <Route path="/Priere" element={<Priere  />} />
              <Route path="/Fracture" element={<Fracture  />} />
              <Route path="/Lada" element={<Lada  />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App