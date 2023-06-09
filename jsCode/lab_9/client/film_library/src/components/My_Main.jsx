import dayjs from 'dayjs';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/style.css';

import { Container, Button, Form, Table } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { film } from '../classes/FilmLibrary';
import My_Footer from '../components/My_Footer';
import API from '../API';


function Populate_TablefromLibrary(props) {
    const e = props.e;
    const [hover, setHover] = useState(0);

    let rate = e.rating;
    const updateLib = (updatedFilm) => {
        props.setFilmLibrary((prevFilmList) => {
            const updatedFilms = [...prevFilmList.films];
            const index = updatedFilms.findIndex((film) => film.ID_film === e.ID_film);
            updatedFilms[index] = updatedFilm;
            return { ...prevFilmList, films: updatedFilms };
        });
    };
    const setRating = (value) => {
        const updated_film = new film(e.ID_film, e.title, e.favorite, e.date_watch, value);
        updateLib(updated_film);
    }
    let favorite = e.favorite;
    const setFavorite = (value) => {
        const updated_film = new film(e.ID_film, e.title, value, e.date_watch, e.rating);
        updateLib(updated_film);
    };

    const setDelete = () => {
        props.setFilmLibrary((prevFilmList) => {
            const updatedFilms = [...prevFilmList.films];
            const index = updatedFilms.findIndex((film) => film.ID_film === e.ID_film);
            updatedFilms.splice(index, 1);
            return { ...prevFilmList, films: updatedFilms };
        });
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

    const date_watch = dayjs(e.date_watch).isValid() ? dayjs(e.date_watch).format('DD/MM/YYYY') : 'not watched';

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

function My_Table(props) {
    let filter_to_use = props.use_filter;
    console.log(filter_to_use);
    let filter_name = null;

    if (props.update_film != null) {
        const index = props.film_library.getPositionInArray(props.update_film.ID_film);
        props.film_library.films[index] = props.update_film;
    }
    switch (filter_to_use) {
        case "all":
            filter_name = "All";
            break;
        case "favorites":
            filter_name = "Favorite";
            break;
        case "bestrated":
            filter_name = "Best Rated";
            break;
        case "seenlastmonth":
            filter_name = "Seen Last Month";
            break;
        case "unseen":
            filter_name = "Unseen";
            break;
    }
    useEffect(() => {
        API.getFilteredFilms(filter_to_use == "all" ? "" : filter_to_use)

            .then((film_fav) => {
                props.setFilmLibrary(film_fav);
            })
            .catch((error) => { console.log(error); });
    }, [filter_to_use, props.setFilmLibrary]);
    if (!props.film_library || !props.film_library.films) {
        return (
            <div>Loading...</div>
        );
    }
    return (
        <div>
            <h1 className="mb-2" id="filter-title">{filter_name}</h1>
            <Table>
                <tbody id="table-body">
                    {
                        props.film_library.films && Array.isArray(props.film_library.films) && props.film_library.films.map((e) => {
                            return <Populate_TablefromLibrary e={e} key={e.ID_film} film_library={props.film_library} setFilmLibrary={props.setFilmLibrary} />;
                        })
                    }
                </tbody>
            </Table>
        </div>
    );
}

function My_Main(props) {
    const { filter } = useParams();
    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', overflow: 'scroll initial' }}>
                <div style={{ flex: '1 1 300px' }}>
                    <My_Table use_filter={filter || "all"} film_library={props.film_library} setFilmLibrary={props.setFilmLibrary} />
                </div>
            </div>
            <My_Footer />
        </>
    );
}

export default My_Main;