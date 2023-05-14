import dayjs from 'dayjs';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Button, Form } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate, } from 'react-router-dom';
import '../css/style.css';
import film from '../classes/Film';
import film_library from '../classes/film_library';

function AddNewFilm(props) {
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [titleError, setTitleError] = useState('');
    const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [rating, setRating] = useState();
    const [ratingError, setRatingError] = useState('');
    const [favorite, setFavorite] = useState(false);

    const handleAddFilm = (event) => {
        event.preventDefault();
        let rate_value = parseInt(rating);
        if (isNaN(rate_value) || rate_value < 0 || rate_value > 5) {
            setRatingError('Rating must be between 0 and 5');
            return;
        }
        else {
            setRatingError('');
        }
        if (title !== "") {
            setTitleError('');
            let new_film = new film(
                film_library.getLastID() + 1,
                title,
                favorite,
                dayjs(date),
                rate_value,
            );
            props.new_film(() => film_library.populateLibrary(new_film));
            navigate(-1);
        }
        else {
            setTitleError('Title is required');
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
                    <Form.Control type="text" placeholder="Film Title" defaultValue={title} onChange={ev => setTitle(ev.target.value)} />
                    <Form.Text className="text-danger">{titleError}</Form.Text>
                    <br />
                    <Form.Label>Watch Date</Form.Label>
                    <Form.Control type="date" defaultValue={date} onChange={ev => setDate(ev.target.value)} />
                    <br />
                    <Form.Label>Rating</Form.Label>
                    <Form.Control type="number" label="Rating" min={0} max={5} placeholder="min = 0 max = 5" onChange={ev => setRating(ev.target.value)} />
                    <Form.Text className="text-danger">{ratingError}</Form.Text>
                    <br />
                    <Form.Check type="checkbox" label="Favorite" defaultValue={favorite} onChange={ev => setFavorite(ev.target.checked)} />
                </Form.Group>
                <Form.Group>
                    <Button variant="primary" type="submit">Add New Film</Button> {' '}
                    <Button variant="secondary" onClick={handleClose}>Close</Button>
                </Form.Group>
            </Form>
        </Container>
    )
}

export default AddNewFilm;