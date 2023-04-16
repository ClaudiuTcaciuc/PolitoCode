import dayjs from 'dayjs';
import 'bootstrap/dist/css/bootstrap.min.css';
import {ListGroup, Nav, Col, Container, Row, Button, Form, Table, Navbar } from 'react-bootstrap';
import { useState } from 'react';
import './style.css';
//define the header of the body

let id = 0;

class film{
    constructor(ID_film, title, favorite, date_watch, rating){
        this.ID_film = ID_film;
        this.title = title;
        this.favorite = favorite;
        this.date_watch = date_watch === null ? null : dayjs(date_watch); 
        this.rating = rating;
    }
    toString(){
        return `ID: ${this.ID_film}, Title: ${this.title}, Favorite: ${this.favorite}, Date Watch: ${this.date_watch === null ? "not watched" : this.date_watch.format("MMMM DD, YYYY")}, Rating: ${this.rating}`;
    }
}

class filmLibrary {
  constructor(){
      this.films = [];
  }
  populateLibrary(film){
      this.films.push(film)
  }
  printLibrary(){
      this.films.forEach(film => console.log(film.toString()));
  }
  sortByDateWatch(){
      return [...this.films].sort((a, b) =>{
          if (a.date_watch === null && b.date_watch === null) return a.ID_film - b.ID_film;
          else if (a.date_watch === null) return 1;
          else if (b.date_watch === null) return -1;
          else return a.date_watch.diff(b.date_watch);
      });
  }
  deleteFilm(ID_film){
      let index = this.films.findIndex(film => film.ID_film === ID_film);
      this.films.splice(index, 1);
  }
  resetWatchedFilms(){
      for (let element of this.films){
          element.date_watch = null;
      }
  }
  getRatedFilms(){
      return this.films.filter(film => film.rating !== null).sort((a,b) => b.rating - a.rating);
  }
}


let film_library = new filmLibrary();
film_library.populateLibrary(new film(1, "The Godfather", true, "March 25, 2019", 1));
film_library.populateLibrary(new film(2, "The Shawshank Redemption", false, "April 15, 2019", 5));
film_library.populateLibrary(new film(3, "The Dark Knight", true, "January 01, 2021", null));
film_library.populateLibrary(new film(4, "The Godfather: Part II", false, "August 25, 2022", 4));
film_library.populateLibrary(new film(5, "The Lord of the Rings: The Return of the King", true, "August 04, 2021", null));


function My_Header(){
  return (
    <Navbar bg = "primary" variant='dark'>
      <Container fluid>
        <Navbar.Brand href = "#home">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-collection-play" viewBox="0 0 16 16">
            <path d="M2 3a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 0-1h-11A.5.5 0 0 0 2 3zm2-2a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7A.5.5 0 0 0 4 1zm2.765 5.576A.5.5 0 0 0 6 7v5a.5.5 0 0 0 .765.424l4-2.5a.5.5 0 0 0 0-.848l-4-2.5z"/>
            <path d="M1.5 14.5A1.5 1.5 0 0 1 0 13V6a1.5 1.5 0 0 1 1.5-1.5h13A1.5 1.5 0 0 1 16 6v7a1.5 1.5 0 0 1-1.5 1.5h-13zm13-1a.5.5 0 0 0 .5-.5V6a.5.5 0 0 0-.5-.5h-13A.5.5 0 0 0 1 6v7a.5.5 0 0 0 .5.5h13z"/>
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
        <Navbar.Brand href = "#home">
          <svg className="bi bi-people-circle" width="20" height="20" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.468 12.37C12.758 11.226 11.195 10 8 10s-4.757 1.225-5.468 2.37A6.987 6.987 0 008 15a6.987 6.987 0 005.468-2.63z"/>
            <path fillRule="evenodd" d="M8 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
            <path fillRule="evenodd" d="M8 1a7 7 0 100 14A7 7 0 008 1zM0 8a8 8 0 1116 0A8 8 0 010 8z" clipRule="evenodd"/>
          </svg>
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
}

function SideBar_Filter(){
  // make a filter under the navbar
  const alertClicked = () => {
    
  };
  return (
    <Container fluid="col-3">
      <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', overflow: 'scroll initial' }}>
        <div className='bg-light' style={{ flex: '0 0 300px' }}>
          <div style={{ padding: '10px' }}>
            <ListGroup variant='flush' defaultActiveKey="#link1">
              <ListGroup.Item className='custom-listgroup' action href="#link1" onClick={alertClicked}> All </ListGroup.Item>
              <ListGroup.Item className='custom-listgroup' action href="#link2" onClick={alertClicked}> Favorite </ListGroup.Item>
              <ListGroup.Item className='custom-listgroup' action href="#link3" onClick={alertClicked}> Best Rated </ListGroup.Item>
              <ListGroup.Item className='custom-listgroup' action href="#link4" onClick={alertClicked}> Seen Last Month </ListGroup.Item>
              <ListGroup.Item className='custom-listgroup' action href="#link5" onClick={alertClicked}> Unseen </ListGroup.Item>
            </ListGroup>
          </div>
        </div>
      </div>
    </Container>
  );
}

function My_Footer(){
  return (
    <Button variant="primary" className='fixed-bottom-right'>
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="25" fill="currentColor" class="bi bi-plus-circle-fill" viewBox="0 0 16 16">
        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z"/>
      </svg>
    </Button>
  );
}

function App() {

  return (
    <div>
      <My_Header/>
      <SideBar_Filter/>
      <My_Footer/>
    </div>
  )
}

export default App
