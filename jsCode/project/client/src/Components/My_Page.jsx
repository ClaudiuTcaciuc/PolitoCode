// import react / bootstrap components
import { useState, useEffect } from 'react';
import { Container, Card, Button, ListGroup, Badge, Row, Col, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
// import API
import API from '../API';
import dayjs from 'dayjs';
// import css
import '../css/style.css';


function My_Page(props) {
    const [content, setContent] = useState([]);
    const { id } = useParams();
    const navigate = useNavigate();
    const editable = (props.loggedIn && (props.user.isAdmin === 1 || props.user.id === content.page.author_id));
    useEffect(() => {
        API.getPageContent(id)
            .then(data => setContent(data))
            .catch(err => console.log(err));
    }, []);

    if (content.length === 0) return (<div></div>);

    function content_type_view(block) {
        switch (block.block_type) {
            case 1:
                return <h3 key={block.block_id}>{block.content}</h3>
            case 2:
                return <p key={block.block_id}>{block.content}</p>
            default:
                null
        }
    }
    return (
        <Row>
            <Col >
                <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', overflow: 'scroll initial' }}>
                    <div className='bg-light' style={{ flex: '0 0 69%' }}>
                        <div style={{ padding: '10px' }}>
                            <Container fluid>
                                <Badge bg="secondary">Autore</Badge> {content.page.author}
                            </Container>
                            <Container fluid>
                                <Badge bg="secondary">Data</Badge> {content.page.publication_date}
                            </Container>
                        </div>
                    </div>
                </div>
            </Col>
            <Col xs={6}>
                <div className="text-center">
                    <h1>{content.page.title}</h1>
                </div>
                <div className='my-page-content'>
                    {content.content.map((block) => content_type_view(block))}
                </div>
            </Col>
            <Col>
                <Container fluid className='mt-3 d-flex justify-content-center'>
                    {editable ? 
                        <Button variant="primary" onClick={() => navigate(`/edit/${id}`)}>Modifica</Button>
                        : null}
                </Container>
                <Container fluid className='mt-3 d-flex justify-content-center'>
                    {editable ? 
                        <Button variant="danger" onClick={() => navigate(`/edit/${id}`)}>Elimina</Button>
                        : null}
                </Container>
            </Col>
        </Row>
    );
}

export default My_Page