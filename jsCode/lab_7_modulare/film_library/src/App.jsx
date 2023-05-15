import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './css/style.css';
import My_Header from './components/My_Header';
import AddNewFilm from './components/AddNewFilm';
import UpdateFilmForm from './components/ModifyFilm';
import My_Main from './components/My_Main';
import SideBar_Filter from './components/My_Sidebar';

function App() {
  const [filter, setFilter] = useState("All");
  const [new_film, addNewFilm] = useState(null);
  const [update_film, setUpdateFilm] = useState(null);
  
  const mainProps = {
    use_filter: filter,
    set_filter: setFilter,
    new_film_from_form: new_film,
    new_films_to_lib_from_form: addNewFilm,
    update_film: update_film,
    setUpdateFilm: setUpdateFilm,
  };
  
  return (
    <BrowserRouter>
      <div>
        <My_Header />
        <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', overflow: 'scroll initial' }}>
          <div style={{ flex: '0 0 300px' }}>
            <SideBar_Filter update_filter={setFilter} />
          </div>
          <div style={{ flex: '1 1 300px' }}>
            <Routes>
              <Route path="/" element={<My_Main {...mainProps} />} />
              <Route path="/Favorite" element={<My_Main {...mainProps} use_filter="Favorite" />} />
              <Route path="/bestRated" element={<My_Main {...mainProps} use_filter="bestRated" />} />
              <Route path="/seenLastMonth" element={<My_Main {...mainProps} use_filter="seenLastMonth" />} />
              <Route path="/Unseen" element={<My_Main {...mainProps} use_filter="Unseen" />} />
              <Route path="/updatefilm/:id" element={<UpdateFilmForm {...mainProps}/>} />
              <Route path="/addnewfilm" element={<AddNewFilm new_film={addNewFilm} />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App
