import { useState, useEffect } from 'react';
import { Card, Button, ListGroup, Badge } from 'react-bootstrap';
import API from '../API';

function My_Row(page) {
    return (
        <Card className="mb-3 mx-auto">
            <Card.Body>
                <Card.Title>{page.title}</Card.Title>
                <ListGroup variant="flush">
                    <ListGroup.Item>
                        <Badge bg="secondary">Data</Badge>: {page.publication_date}
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <Badge bg="secondary">Autore</Badge>: {page.author}
                    </ListGroup.Item>
                </ListGroup>
            </Card.Body>
        </Card>
    );
}

function My_Main(props) {
    const [pages, setPages] = useState([]);
    
    const type = props.loggedIn ? 'allpages' : 'publicpages';

    useEffect(() => {
        API.getPages(type)
            .then(data => setPages(data))
            .catch(err => console.log(err));
    }, [props.loggedIn]);

    let header_name = '';
    switch (type) {
        case 'allpages':
            header_name = 'All Pages';
            break;
        case 'publicpages':
            header_name = 'Public Pages';
            break;
    }

    return (
        <div className="d-flex justify-content-center">
            <div className="w-75">
                <h1>{header_name}</h1>
                {pages.map((page) => (
                    <My_Row key={page.id} {...page} />
                ))}
            </div>
        </div>
    );
}

export default My_Main;
