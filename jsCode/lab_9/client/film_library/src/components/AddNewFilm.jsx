import dayjs from 'dayjs';
import { Container, Button, Form } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate, } from 'react-router-dom';
import { film } from '../classes/FilmLibrary';
import '../css/style.css';

function AddNewFilm(props) {
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [titleError, setTitleError] = useState('');
    const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [rating, setRating] = useState('');
    const [ratingError, setRatingError] = useState('');
    const [favorite, setFavorite] = useState(false);

    const handleAddFilm = (event) => {
        event.preventDefault();

        if (title.trim() === '') {
            setTitleError('Title is required');
            return;
        } else {
            setTitleError('');
        }

        const rateValue = parseInt(rating);
        if (isNaN(rateValue) || rateValue < 0 || rateValue > 5) {
            setRatingError('Rating must be between 0 and 5');
            return;
        } else {
            setRatingError('');
        }

        const newFilm = new film(
            props.film_library.getLastID() + 1,
            title.trim(),
            favorite,
            dayjs(date),
            rateValue
        );

        props.setFilmLibrary((prev) => prev.populateLibrary(newFilm));
        navigate("/");
    };

    const handleClose = () => {
        setTitle('');
        setDate(dayjs().format('YYYY-MM-DD'));
        setRating('');
        setFavorite(false);
        navigate(-1);
    };

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