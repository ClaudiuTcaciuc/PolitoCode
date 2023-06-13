// import react / bootstrap components
import { useState, useEffect } from 'react';
import { Container, Card, Button, Modal, Badge, Row, Col, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
// import API
import API from '../API';
import dayjs from 'dayjs';
// import css
import '../css/style.css';
// import logo
import deleteLogo from '../assets/trash-fill.svg';
import editLogo from '../assets/gear-wide-connected.svg';


function My_Page(props) {
  const [pageContent, setPageContent] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const editable = (props.loggedIn && (props.user.isAdmin === 1 || props.user.id === pageContent.page_info.author_id));
  useEffect(() => {
    API.getPageContent(id)
      .then(data => setPageContent(data)
        // soluzione alternativa per non fare una useEffect aggiuntiva quando edito
        // localStorage.setItem('page', JSON.stringify(data))
      )
      .catch(err => console.log(err));
  }, []);

  const doDeletePage = async () => {
    setShowDeleteModal(false);
    await API.deletePage(id);
    navigate('/');
  };

  if (pageContent.length === 0) return (<div className='d-flex justify-content-center'>
    <Spinner animation="border" role="status"> </Spinner>
    {' '}Loading
  </div>);
  
  function content_type_view(block) {
    return (
      <Card key={block.block_id} className="my-card-container">
        <Card.Body>
          {block.block_type === 1 ? (
            <Card.Title>{block.content}</Card.Title>
          ) : block.block_type === 2 ? (
            <Card.Text>{block.content}</Card.Text>
          ) : null}
        </Card.Body>
      </Card>
    )
  }
  return (
    <Row>
      <Col >
        <div className="author-info">
          <div className="bg-light author-info-container p-2">
            <div style={{ padding: '10px' }}>
              <Container fluid>
                <Badge className='my-badge'>Autore</Badge> {pageContent.page_info.author}
              </Container>
              <Container fluid>
                <Badge className='my-badge'>Data</Badge> {pageContent.page_info.publication_date}
              </Container>
            </div>
          </div>
        </div>
      </Col>
      <Col xs={6}>
        <div className="my-page-title">
          <h1>{pageContent.page_info.title}</h1>
        </div>
        <div className='my-page-content'>
          {pageContent.content.map((block) => content_type_view(block))}
        </div>
      </Col>
      <Col>
        <Container fluid className='mt-3 d-flex justify-content-center'>
          {editable ?
            <Button className='my-btn' variant="primary" onClick={() => navigate(`/edit_page/${id}`)}>
              <img src={editLogo} className='my-svg' />
            </Button>
            : null}
        </Container>
        <Container fluid className='mt-3 d-flex justify-content-center'>
          {editable ?
            <Button className='my-btn' variant="danger" onClick={() => setShowDeleteModal(!showDeleteModal)}>
              <img src={deleteLogo} className='my-svg' />
            </Button>
            : null}
        </Container>
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(!showDeleteModal)}>
          <Modal.Header closeButton>
            <Modal.Title>Delete Confirmation</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to delete this page?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(!showDeleteModal)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => doDeletePage()}>
              Confirm
            </Button>
          </Modal.Footer>
        </Modal>
      </Col>
    </Row>
  );
}

export default My_Page