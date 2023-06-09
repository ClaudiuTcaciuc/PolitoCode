// import react / bootstrap components
import { useState, useEffect } from 'react';
import { Container, Card, Button, Modal, Badge, Row, Col, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
// import API
import API from '../API';
// import css
import '../css/style.css';
// import logo
import deleteLogo from '../assets/trash-fill.svg';
import editLogo from '../assets/gear-wide-connected.svg';
import arrowLogo from '../assets/arrow-left-circle-fill.svg'


function My_Page(props) {
  const [pageContent, setPageContent] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    API.getPageContent(id)
      .then(data => setPageContent(data)
      )
      .catch(err => (navigate('/')));
  }, []);

  const doDeletePage = async () => {
    setShowDeleteModal(false);
    await API.deletePage(id);
    navigate('/');
  };

  if (pageContent.length === 0 || props.user === undefined) return (
    <div className='d-flex justify-content-center'>
      <Spinner animation="border" role="status"> </Spinner>
      {' '}Loading
    </div>
  );

  const editable = (props.loggedIn && (props.user.isAdmin === 1 || props.user.id === pageContent.page_info.author_id));

  function content_type_view(block) {
    return (
      <Card key={block.block_id} className="my-card-container">
        <Card.Body>
          {block.block_type === 1 ? (
            <Card.Title>{block.content}</Card.Title>
          ) : block.block_type === 2 ? (
            <Card.Text>{block.content}</Card.Text>
          ) : (
            <Container fluid className="d-flex justify-content-center">
              <Card.Img src={"http://localhost:3000/" + block.content} className='image-show ' />
            </Container>
          )}
        </Card.Body>
      </Card>
    )
  }
  return (
    <Container fluid>
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
            <Button className='my-btn' variant="primary" onClick={() => navigate(-1)}>
              <img src={arrowLogo} className='my-svg' />
            </Button>
          </Container>
          <Container fluid className='mt-3 d-flex justify-content-center'>
            {editable ?
              <Button className='my-btn' variant="primary" onClick={() => navigate(`/edit_page/${id}`)}>
                <img src={editLogo} className='my-svg' />
              </Button>
              : null}
          </Container>
          <Container fluid className='mt-3 d-flex justify-content-center'>
            {editable ?
              <Button variant="danger" onClick={() => setShowDeleteModal(!showDeleteModal)}>
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
    </Container>
  );
}

export default My_Page