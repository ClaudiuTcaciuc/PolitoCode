import dayjs from 'dayjs';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Button, Form } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../css/style.css';
import { film } from '../classes/FilmLibrary';
import API from '../API';

function UpdateFilmForm(props) {
    const { id } = useParams();
    const e = props.film_library.films.find((e) => e.id === parseInt(id));
    const navigate = useNavigate();

    const [title, setTitle] = useState(e.title);
    const [titleError, setTitleError] = useState('');
    const [date, setDate] = useState(dayjs(e.watchdate).format("YYYY-MM-DD"));
    const [favorite, setFavorite] = useState(e.favorite);
    const [rate, setRating] = useState(e.rating === null ? 1 : e.rating);
    const [ratingError, setRatingError] = useState('');

    const handleResetClose = () => {
        setTitle(e.title);
        setDate(dayjs(e.watchdate).format("YYYY-MM-DD"));
        setRating(parseInt(e.rating));
        setFavorite(e.favorite);
        navigate(-1);
    }

    const handleModifyFilm = (event) => {
        event.preventDefault();
        let rate_value = parseInt(rate);
        if (isNaN(rate_value) || rate_value < 0 || rate_value > 5) {
            setRatingError('Rating must be between 0 and 5');
            return;
        }
        else {
            setRatingError('');
        }
        if (title.trim() != "") {
            setTitleError('');
            let new_film = new film(
                e.id,
                title,
                favorite,
                dayjs(date),
                rate_value,
            );
            props.setDirty(true);
            API.updateFilmLib(new_film);
            navigate(-1);
        }
        else {
            setTitleError('Title is required');
        }
    }
    return (
        <Container fluid>
            <h1 className="mb-2" id="filter-title">Modify Film</h1>
            <Form onSubmit={handleModifyFilm}>
                <Form.Group>
                    <Form.Label>Film Title</Form.Label>
                    <Form.Control type="text" placeholder="Film Title" defaultValue={title} onChange={ev => setTitle(ev.target.value)} />
                    <Form.Text className="text-danger">{titleError}</Form.Text>
                    <br />
                    <Form.Label>Watch Date</Form.Label>
                    <Form.Control type="date" defaultValue={date} onChange={ev => setDate(ev.target.value)} />
                    <br />
                    <Form.Label>Rating</Form.Label>
                    <Form.Control type="number" label="Rating" defaultValue={rate} min={0} max={5} placeholder="min = 0 max = 5" onChange={ev => setRating(ev.target.value)} />
                    <Form.Text className="text-danger">{ratingError}</Form.Text>
                    <br />
                    <Form.Check type="checkbox" label="Favorite" defaultChecked={favorite} onChange={ev => setFavorite(ev.target.checked)} />
                </Form.Group>
                <Form.Group>
                    <Button variant="primary" type="submit">Modify Film</Button> {' '}
                    <Button variant="secondary" onClick={handleResetClose}>Close</Button>
                </Form.Group>
            </Form>
        </Container>
    )
}

export default UpdateFilmForm;