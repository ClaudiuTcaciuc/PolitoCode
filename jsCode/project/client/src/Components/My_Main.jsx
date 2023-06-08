// import react / bootstrap components
import { useState, useEffect } from 'react';
import { Container, Card, Button, ListGroup, Badge, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
// import API
import API from '../API';
import dayjs from 'dayjs';
// import css
import '../css/style.css';

function My_Row(props) {
    const page = props.page;
    const navigate = useNavigate();

    const navigateToPage = (id) => {
        navigate(`/page/${id}`);
    }

    return (
        <Container fluid>
            <Row className="align-items-center">
                <Col>
                    <Card className="mb-3 my-card" onClick={() => navigateToPage(page.id)}>
                        <Card.Body >
                            <Card.Title>{page.title}</Card.Title>
                            <Card.Text variant="flush">
                                <Badge bg="secondary">Data</Badge> {dayjs(page.publication_date).format('MMMM D, YYYY')}
                            </Card.Text>
                            <Card.Text variant="flush">
                                <Badge bg="secondary">Autore</Badge> {page.author}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}


function My_Main(props) {
    const { filter } = useParams();
    const [pages, setPages] = useState([]);
    const type = props.loggedIn ? 'allpages' : 'publicpages';
    useEffect(() => {
        API.getPages(type)
            .then(data => setPages(data))
            .catch(err => console.log(err));
    }, [props.loggedIn]);

    let filtered_pages = [];
    let header_name = '';

    switch (filter) {
        case undefined:
            if (!props.loggedIn)
                header_name = 'Public Pages';
            else
                header_name = 'All Pages';
            filtered_pages = pages;
            break;
        case 'publicpages':
            header_name = 'Public Pages';
            filtered_pages = pages.filter((page) => dayjs(page.publication_date).isBefore(dayjs()));
            break;
        case 'progpages':
            header_name = 'To Be Released';
            filtered_pages = pages.filter((page) => dayjs(page.publication_date).isAfter(dayjs()));
            break;
        case 'draftpages':
            header_name = 'Draft Pages';
            filtered_pages = pages.filter((page) => !dayjs(page.publication_date).isValid());
            break;
    }
    return (
        <div className="d-flex justify-content-center">
            <div className="w-75">
                <h1>{header_name}</h1>
                {filtered_pages.length === 0 ? (
                    <div className="d-flex justify-content-center">
                        <h3>No Page Found 😞</h3>
                    </div>
                ) : (
                    filtered_pages.map((page) => (
                        <My_Row key={page.id} page={page} loggedIn={props.loggedIn} user={props.user} />
                    ))
                )}
            </div>
        </div>
    );
}

export default My_Main;
