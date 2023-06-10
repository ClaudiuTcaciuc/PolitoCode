import { useState } from 'react';
import { Container, Card, Button, Dropdown, DropdownButton, Badge, Row, Col, Spinner, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ContentEditable from 'react-contenteditable';
import API from '../API';
import dayjs from 'dayjs';
import '../css/style.css';
import deleteLogo from '../assets/trash-fill.svg';
import dndLogo from '../assets/arrow-down-up.svg';
import addLogo from '../assets/plus-circle-fill.svg';

function My_Add_Page(props) {
  const [formBlocks, setFormBlocks] = useState([]);

  if (!props.loggedIn) return (
    <div className='d-flex justify-content-center'>
      <Spinner animation="border" role="status" /> Loading
    </div>
  );

  const handleAddPage = (event) => {
    event.preventDefault();
  };

  const handleAddFormBlock = () => {
    setFormBlocks((prevBlocks) => [...prevBlocks, {}]);
  };

  const renderFormBlocks = () => {
    return formBlocks.map((block, index) => (
      <Form.Group key={index}>
        <Form.Label>Contenuto</Form.Label>
        <Form.Control as="textarea" rows={3} placeholder="Inserisci il contenuto" />
      </Form.Group>
    ));
  };

  return (
    <>
      <Row style={{ marginRight: 0 }}>
        <Col>
          <div className="author-info">
            <div className="bg-light author-info-container p-2">
              <div style={{ padding: '10px' }}>
                <Container fluid>
                  <Badge className="my-badge">Autore</Badge> {props.user.name}
                </Container>
              </div>
            </div>
          </div>
        </Col>
        <Col xs={6}>
          <h1 className="mb-2" id="title-page">Add New Page</h1>
          <Form>
            <Form.Group>
              <Form.Label>Titolo</Form.Label>
              <Form.Control type="text" placeholder="Inserisci il titolo" />
            </Form.Group>
            {renderFormBlocks()}
          </Form>
          <Button className="my-btn" variant="secondary" onClick={handleAddFormBlock}>
            Aggiungi Contenuto
          </Button>
        </Col>
        <Col>
          <Container fluid className="mt-3 d-flex justify-content-center">
            <Button id="delete" className="my-btn" variant="danger" onClick={() => navigate(`/edit_page/${id}`)}>
              <img src={deleteLogo} className="my-svg" alt="Delete" />
            </Button>
          </Container>
        </Col>
      </Row>
    </>
  );
}

export default My_Add_Page;
