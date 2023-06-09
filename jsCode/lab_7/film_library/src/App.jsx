import dayjs from 'dayjs';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ListGroup, Container, Button, Form, Table, Navbar } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import './css/style.css';

class film {
  constructor(ID_film, title, favorite, date_watch, rating) {
    this.ID_film = ID_film;
    this.title = title;
    this.favorite = favorite;
    this.date_watch = date_watch === null ? null : dayjs(date_watch);
    this.rating = rating;
  }
  toString() {
    return `ID: ${this.ID_film}, Title: ${this.title}, Favorite: ${this.favorite}, Date Watch: ${this.date_watch === null ? "not watched" : this.date_watch.format("MMMM DD, YYYY")}, Rating: ${this.rating}`;
  }
}

class filmLibrary {
  constructor() {
    this.films = [];
  }
  populateLibrary(film) {
    this.films.push(film)
  }
  printLibrary() {
    this.films.forEach(film => console.log(film.toString()));
  }
  sortByDateWatch() {
    return [...this.films].sort((a, b) => {
      if (a.date_watch === null && b.date_watch === null) return a.ID_film - b.ID_film;
      else if (a.date_watch === null) return 1;
      else if (b.date_watch === null) return -1;
      else return a.date_watch.diff(b.date_watch);
    });
  }
  deleteFilm(ID_film) {
    let index = this.films.findIndex(film => film.ID_film === ID_film);
    this.films.splice(index, 1);
  }
  resetWatchedFilms() {
    for (let element of this.films) {
      element.date_watch = null;
    }
  }
  getRatedFilms() {
    return this.films.filter(film => film.rating !== null).sort((a, b) => b.rating - a.rating);
  }
  updateFavorite(ID_film, favorite) {
    let index = this.films.findIndex(film => film.ID_film === ID_film);
    this.films[index].favorite = favorite;
  }
  getLastID() {
    return this.films[this.films.length - 1].ID_film;
  }
}

let film_library = new filmLibrary();
film_library.populateLibrary(new film(1, "The Godfather", true, "March 25, 2019", 1));
film_library.populateLibrary(new film(2, "The Shawshank Redemption", false, "April 15, 2019", 5));
film_library.populateLibrary(new film(3, "The Dark Knight", true, "January 01, 2021", null));
film_library.populateLibrary(new film(4, "The Godfather: Part II", false, "August 25, 2022", 4));
film_library.populateLibrary(new film(5, "The Lord of the Rings: The Return of the King", true, "August 04, 2021", null));

function My_Header() {
  return (
    <Navbar bg="primary" variant='dark'>
      <Container fluid>
        <Navbar.Brand href="#home">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-collection-play" viewBox="0 0 16 16">
            <path d="M2 3a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 0-1h-11A.5.5 0 0 0 2 3zm2-2a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7A.5.5 0 0 0 4 1zm2.765 5.576A.5.5 0 0 0 6 7v5a.5.5 0 0 0 .765.424l4-2.5a.5.5 0 0 0 0-.848l-4-2.5z" />
            <path d="M1.5 14.5A1.5 1.5 0 0 1 0 13V6a1.5 1.5 0 0 1 1.5-1.5h13A1.5 1.5 0 0 1 16 6v7a1.5 1.5 0 0 1-1.5 1.5h-13zm13-1a.5.5 0 0 0 .5-.5V6a.5.5 0 0 0-.5-.5h-13A.5.5 0 0 0 1 6v7a.5.5 0 0 0 .5.5h13z" />
          </svg>
          {' '}
          Film Library
        </Navbar.Brand>
        <Form className="my-2 my-lg-0 mx-auto">
          <Form.Control
            type="search"
            placeholder="Search"
            className="me-auto"
            aria-label="Search query"
          />
        </Form>
        <Navbar.Brand href="#home">
          <svg className="bi bi-people-circle" width="20" height="20" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.468 12.37C12.758 11.226 11.195 10 8 10s-4.757 1.225-5.468 2.37A6.987 6.987 0 008 15a6.987 6.987 0 005.468-2.63z" />
            <path fillRule="evenodd" d="M8 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M8 1a7 7 0 100 14A7 7 0 008 1zM0 8a8 8 0 1116 0A8 8 0 010 8z" clipRule="evenodd" />
          </svg>
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
}

function filterAll() {
  let film_lib = new filmLibrary();
  for (let film of film_library.films) {
    film_lib.populateLibrary(film);
  }
  return film_lib;
}

function filterFavorite() {
  let film_lib = new filmLibrary();
  for (let film of film_library.films) {
    if (film.favorite === true) {
      film_lib.populateLibrary(film);
    }
  }
  return film_lib;
}

function filterBestRated() {
  let film_lib = new filmLibrary();
  for (let film of film_library.films) {
    if (film.rating === 5) {
      film_lib.populateLibrary(film);
    }
  }
  return film_lib;
}

function filterSeenLastMonth() {
  let film_lib = new filmLibrary();
  let last_month = dayjs().month(dayjs().month() - 1);
  for (let film of film_library.films) {
    if (film.date_watch !== null && film.date_watch.month() === last_month.month()) {
      film_lib.populateLibrary(film);
    }
  }
  return film_lib;
}

function filterUnseen() {
  let film_lib = new filmLibrary();
  for (let film of film_library.films) {
    if (dayjs(film.date_watch).isValid() === false) {
      film_lib.populateLibrary(film);
    }
  }
  return film_lib;
}

function UpdateFilmForm(props) {
  const { id } = useParams();
  const e = film_library.films.find((e) => e.ID_film === parseInt(id));
  const navigate = useNavigate();
  const [title, setTitle] = useState(e.title);
  const [date, setDate] = useState(dayjs(e.date_watch).format("YYYY-MM-DD"));
  const [formFav, setFormFav] = useState(e.favorite);
  let rate = e.rating;
  const setRating = (value) => {
    e.rating = value;
    props.setUpdateFilm(new film(e.ID_film, e.title, e.favorite, e.date_watch, value))
  }
  let favorite = e.favorite;
  const setFavorite = (value) => {
    e.favorite = value;
    props.setUpdateFilm(new film(e.ID_film, e.title, value, e.date_watch, e.rating))
  };

  const handleResetClose = () => {
    setTitle(e.title);
    setDate(dayjs(e.date_watch).format("YYYY-MM-DD"));
    setRating(parseInt(e.rating));
    setFavorite(e.favorite);
    navigate(-1);
  }

  const handleModifyFilm = (event) => {
    event.preventDefault();
    if (title != "") {
      let new_film = new film(
        e.ID_film,
        title,
        formFav,
        dayjs(date),
        rate,
      );
      props.setUpdateFilm(new_film);
      navigate(-1);
    }
  }
  return (
    <Container fluid>
      <h1 className="mb-2" id="filter-title">Modify Film</h1>
        <Form onSubmit={handleModifyFilm}>
          <Form.Group>
            <Form.Label>Film Title</Form.Label>
            <Form.Control type="text" placeholder="Film Title" value={title} onChange={ev => setTitle(ev.target.value)}/>
            <Form.Label>Watch Date</Form.Label>
            <Form.Control type="date" value={date} onChange={ev => setDate(ev.target.value)}/>
            <Form.Label>Rating</Form.Label>
            <Form.Control type="number" label="Rating" min={0} max={5} placeholder="min = 0 max = 5" onChange={ev => setRating(ev.target.value)}/>
            <Form.Check type="checkbox" label="Favorite" value={favorite} onChange={ev => setFavorite(ev.target.checked)}/>
          </Form.Group>
          <Form.Group>
            <Button variant="primary" type="submit">Modify Film</Button> {' '}
            <Button variant="secondary" onClick={handleResetClose}>Close</Button>
          </Form.Group>
        </Form>
    </Container>
  )
}

function Populate_TablefromLibrary(props) {
  const e = props.e;
  const [hover, setHover] = useState(0);

  let rate = e.rating;
  const setRating = (value) => {
    e.rating = value;
    props.setUpdateFilm(new film(e.ID_film, e.title, e.favorite, e.date_watch, value))
  }
  let favorite = e.favorite;
  const setFavorite = (value) => {
    e.favorite = value;
    props.setUpdateFilm(new film(e.ID_film, e.title, value, e.date_watch, e.rating))
  };

  const setDelete = () => {
    props.setDeleteFilm(e.ID_film);
    film_library.deleteFilm(e.ID_film);
  }
  const favorite_checkbox = <Form.Check type="checkbox" label="Favorite" checked={favorite} onChange={() => setFavorite(!favorite)} />;
  const Set_rating_box = () => {
    let rating_box = [];
    for (let i = 0; i < 5; i++) {
      if (i < rate) {
        rating_box.push(<span className='custom-button' key={i} variant='outline-dark' size="sm" onClick={() => setRating(i + 1)} onMouseEnter={() => setHover(i + 1)} onMouseLeave={() => setHover(rate)}>★</span>);
      }
      else {
        rating_box.push(<span className='custom-button' key={i} variant="light-dark" size="sm" onClick={() => setRating(i + 1)}>☆</span>);
      }
    }
    return rating_box;
  };

  let date_watch = e.date_watch
  if (dayjs(e.date_watch).isValid() === false)
    date_watch = "not watched";
  else
    date_watch = dayjs(e.date_watch).format("DD/MM/YYYY");

  let titleColor = "text-dark";

  if (favorite) {
    titleColor = "text-danger";
  }
  return (
    <tr>
      <td><span className={titleColor}>{e.title}</span></td>
      <td>{favorite_checkbox}</td>
      <td>{date_watch}</td>
      <td>{
        Set_rating_box()
      }
      </td>
      <td>{
        <Container fluid >
          <Link to={`/updatefilm/${e.ID_film}`}>
            <Button variant="primary" size="sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="25" fill="currentColor" className="bi bi-gear-fill" viewBox="0 0 16 16">
                <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z" />
              </svg>
            </Button>
          </Link>
          {' '}
          <Button variant="danger" onClick={() => setDelete()} size="sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="25" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
              <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
            </svg>
          </Button>
        </Container>
      }
      </td>
    </tr>
  );
}

function SideBar_Filter(props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', overflow: 'scroll initial' }}>
      <div className='bg-light' style={{ flex: '0 0 300px' }}>
        <div style={{ padding: '10px' }}>
          <ListGroup variant='flush' defaultActiveKey="#link1">
            <LinkContainer to="/" activeClassName="active">
              <ListGroup.Item className='custom-listgroup' action onClick={() => props.update_filter("All")}> All </ListGroup.Item>
            </LinkContainer>
            <LinkContainer to="/Favorite" activeClassName="active">
              <ListGroup.Item className='custom-listgroup' action onClick={() => props.update_filter("Favorite")}> Favorite </ListGroup.Item>
            </LinkContainer>
            <LinkContainer to="/bestRated" activeClassName="active">
              <ListGroup.Item className='custom-listgroup' action onClick={() => props.update_filter("bestRated")}> Best Rated </ListGroup.Item>
            </LinkContainer>
            <LinkContainer to="/seenLastMonth" activeClassName="active">
              <ListGroup.Item className='custom-listgroup' action onClick={() => props.update_filter("seenLastMonth")}> Seen Last Month </ListGroup.Item>
            </LinkContainer>
            <LinkContainer to="/Unseen" activeClassName="active">
              <ListGroup.Item className='custom-listgroup' action onClick={() => props.update_filter("Unseen")}> Unseen </ListGroup.Item>
            </LinkContainer>
          </ListGroup>
        </div>
      </div>
    </div>
  );
}


function My_Table(props) {
  const [delete_film, setDeleteFilm] = useState(null);

  let film_lib = null;
  let filter_to_use = props.use_filter;
  let filter_name = null;

  if (props.update_film != null) {
    film_library.films[props.update_film.ID_film - 1] = Object.assign(Object.create(Object.getPrototypeOf(props.update_film)), { ...props.update_film });
  }

  if (filter_to_use == "All") {
    film_lib = filterAll();
    filter_name = "All";
  }
  else if (filter_to_use == "Favorite") {
    film_lib = filterFavorite();
    filter_name = "Favorite";
  }
  else if (filter_to_use == "bestRated") {
    film_lib = filterBestRated();
    filter_name = "Best Rated";
  }
  else if (filter_to_use == "seenLastMonth") {
    film_lib = filterSeenLastMonth();
    filter_name = "Seen Last Month";
  }
  else if (filter_to_use == "Unseen") {
    film_lib = filterUnseen();
    filter_name = "Unseen";
  }
  return (
    <div>
      <h1 className="mb-2" id="filter-title">{filter_name}</h1>
      <Table>
        <tbody id="table-body">
          {
            film_lib.films.map((e) => {
              return <Populate_TablefromLibrary e={e} key={e.ID_film} update_film={props.update_film} setUpdateFilm={props.setUpdateFilm} delete_film={delete_film} setDeleteFilm={setDeleteFilm} />
            })
          }
        </tbody>
      </Table>
    </div>
  );
}

function AddNewFilm (props){
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [rating, setRating] = useState(0);
  const [favorite, setFavorite] = useState(false);

  const handleAddFilm = (event) => {
    event.preventDefault();
    if(title !== ""){
      let new_film = new film(
        film_library.getLastID() + 1,
        title,
        favorite,
        dayjs(date),
        rating,
      )
      console.log(new_film);
      props.new_film(() => film_library.populateLibrary(new_film));
      navigate(-1);
    }
  }
  
  const handleClose = () => {
    setTitle("");
    setDate(dayjs().format("YYYY-MM-DD"));
    setRating(0);
    setFavorite(false);
    navigate(-1);
  }

  return (
    <Container fluid>
      <h1 className="mb-2" id="filter-title">Add New Film</h1>
        <Form onSubmit={handleAddFilm}>
          <Form.Group>
            <Form.Label>Film Title</Form.Label>
            <Form.Control type="text" placeholder="Film Title" value={title} onChange={ev => setTitle(ev.target.value)}/>
            <Form.Label>Watch Date</Form.Label>
            <Form.Control type="date" value={date} onChange={ev => setDate(ev.target.value)}/>
            <Form.Label>Rating</Form.Label>
            <Form.Control type="number" label="Rating" min={0} max={5} placeholder="min = 0 max = 5" onChange={ev => setRating(ev.target.value)}/>
            <Form.Check type="checkbox" label="Favorite" value={favorite} onChange={ev => setFavorite(ev.target.checked)}/>
          </Form.Group>
          <Form.Group>
            <Button variant="primary" type="submit">Add New Film</Button> {' '}
            <Button variant="secondary" onClick={handleClose}>Close</Button>
          </Form.Group>
        </Form>
    </Container>    
  )
}

function My_Footer(){

  return (
    <Container fluid>
      <div className='fixed-bottom-right'>
        <Link to="addnewfilm">
          <Button variant="primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="25" fill="currentColor" className="bi bi-plus-circle-fill" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z"/>
          </svg>
          </Button>
        </Link>
      </div>
    </Container>
  );
}

function My_Main(props) {
  if (props.new_film_from_form != null)
    props.new_films_to_lib_from_form(() => null);
  return (
    <>
    <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', overflow: 'scroll initial' }}>
      <div style={{ flex: '1 1 300px' }}>
        <My_Table use_filter={props.use_filter} update_film={props.update_film} setUpdateFilm={props.setUpdateFilm} />
      </div>
    </div>
    <My_Footer />
    </>
  );
}

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
