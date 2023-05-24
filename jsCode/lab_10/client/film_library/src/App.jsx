import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './css/style.css';
import My_Header from './components/My_Header';
import AddNewFilm from './components/AddNewFilm';
import UpdateFilmForm from './components/ModifyFilm';
import My_Main from './components/My_Main';
import SideBar_Filter from './components/My_Sidebar';
import { filmLibrary } from './classes/FilmLibrary';

function App() {
  const [film_library, setFilmLibrary] = useState(new filmLibrary());
  const [dirty, setDirty] = useState(false);
  const mainProps = {
    film_library: film_library,
    setFilmLibrary: setFilmLibrary,
    dirty: dirty,
    setDirty: setDirty,
  };
  
  return (
    <BrowserRouter>
      <div>
        <My_Header />
        <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', overflow: 'scroll initial' }}>
          <div style={{ flex: '0 0 300px' }}>
            <SideBar_Filter />
          </div>
          <div style={{ flex: '1 1 300px' }}>
            <Routes>
              <Route path="/:filter?" element={<My_Main {...mainProps} />} />
              <Route path="/updatefilm/:id" element={<UpdateFilmForm {...mainProps}/>} />
              <Route path="/addnewfilm" element={<AddNewFilm {...mainProps} />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App
