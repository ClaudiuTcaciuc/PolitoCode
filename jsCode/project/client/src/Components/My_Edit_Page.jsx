import { useState, useEffect } from 'react';
import { Container, Card, Button, Modal, Badge, Row, Col, Spinner, Form, Alert, Carousel } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import API from '../API';
import '../css/style.css';
import deleteLogo from '../assets/trash-fill.svg';
import dndLogo from '../assets/arrow-down-up.svg';
import wrenchLogo from '../assets/wrench.svg';
import arrowLogo from '../assets/arrow-left-circle-fill.svg'
import saveLogo from '../assets/check-circle-fill.svg';
import dayjs from 'dayjs';
import ContentTypeView from './ContentTypeView';

const StrictModeDroppable = ({ children, droppableId }) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return <Droppable droppableId={droppableId}>{children}</Droppable>;
};

function My_Edit_Page(props) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pageContent, setPageContent] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editable_block, setEditableBlock] = useState(null);
  const [title_page, setTitle_page] = useState("");
  const [show_modal, setShow_modal] = useState(false);
  const [set_error_title, setError_title] = useState("");
  const [dirty, setDirty] = useState(false);
  const [show_empty_block_alert, setShowEmptyBlockAlert] = useState(false);
  const [set_error_block, setError_block] = useState("");
  const [images, setImages] = useState([]);
  const [show_date_modal, setShowDateModal] = useState(false);
  const [pub_date, setPubDate] = useState("");
  const [set_pub_date_error, setPubDateError] = useState("");
  const [show_author_modal, setShowAuthorModal] = useState(false);
  const [checked, setChecked] = useState(false);

  const [list_authors, setListAuthors] = useState([]);
  const [author, setAuthor] = useState("");

  useEffect(() => {
    API.getPageContent(id)
      .then((data) => {
        setPageContent(data)
        setTitle_page(data.page_info.title);
      })
      .catch((err) => console.log(err));
  }, [dirty]);

  // useEffect to clean empty blocks when the page is closed or redirected
  useEffect(() => {
    return () => {
      API.cleanEmptyBlocksInPage(id)
    };
  }, []);

  useEffect(() => {
    if(images.length === 0){
    API.getAllImages()
      .then((data) => {
        setImages(data);
      })
      .catch((err) => console.log(err));
    }
    if(props.user != undefined && props.user.isAdmin === 1){
      API.getAllUsers().then((res) => {
        setListAuthors(res);
      })
        .catch((err) => console.log(err));
    }
  }, [show_author_modal]);

  function start_editing(block_id) {
    setEditableBlock(block_id);
  }

  function stop_editing() {
    setEditableBlock(null);
  }

  const doDeletePage = async () => {
    setShowDeleteModal(false);
    await API.deletePage(id);
    navigate('/');
  };

  const handleSaveClick = () => {
    for (let block of pageContent.content) {
      if (block.content.trim() === "") {
        setShowEmptyBlockAlert(true);
        return;
      }
    }
    setShowEmptyBlockAlert(false);
    navigate("/page/" + id);
  }

  const handleTitleChange = (event) => {
    event.preventDefault();
    if (title_page.trim() === "") {
      setError_title("Title can not be empty");
      return;
    }
    setPageContent((prev) => ({
      ...prev,
      page_info: {
        ...prev.page_info,
        title: title_page,
      },
    }));
    setError_title("");
    setShow_modal(false);
  };

  if (pageContent.length === 0 || pageContent.content === undefined || props.user === null) {
    return (
      <div>
        <Spinner animation="border" role="status" /> Loading
      </div>
    );
  }

  function handleOnDragEnd(result) {
    if (!result.destination) return;
    const { source, destination } = result;
    const items = Array.from(pageContent.content);
    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);
    items.forEach((item, index) => { item.order_index = index + 1; });
    setPageContent({ ...pageContent, content: items });
    doUpdateOrder();
  }

  const doUpdateOrder = async () => {
    await API.updateContentBlockOrder(pageContent);
  };

  const handleDateChange = (event) => {
    event.preventDefault();
    const today = dayjs().format("YYYY-MM-DD");
    if (!dayjs(pub_date).isValid() || (checked && dayjs(pub_date).isBefore(today))) {
      setPubDateError("The date must be today or in the future");
      return;
    }
    setPubDateError("");
    if (checked)
      setPubDate("Draft");
    doDateUpdate(pub_date);
  };

  const doDateUpdate = async (new_date) => {
    await API.updateDatePage(new_date, id);
    setShowDateModal(false);
    setDirty(!dirty);
  };

  const handleModalOnHide = () => {
    setShowDateModal(false);
    setPubDateError("");
  };

  const handleModalGetAuthor = () => {
    setShowAuthorModal(true);
  };

  const handleAuthorChange = (event) => {
    event.preventDefault();
    const author_id = author.split(" ")[0];
    console.log(author_id);
    API.changePageUser(author_id, id);
    setShowAuthorModal(false);
    setDirty(!dirty);
  };

  return (
    <Container fluid>
      <Row style={{ marginRight: 0 }}>
        <Col>
          <div className="author-info">
            <div className="bg-light author-info-container p-2">
              <div style={{ padding: '10px' }}>
                <Container fluid>
                  <Badge className="my-badge">Autore</Badge> {pageContent.page_info.author} {" "}
                  {props.user.isAdmin ?
                    <Button className='my-btn-mod' size='sm' onClick={() => handleModalGetAuthor()}>
                      <img src={wrenchLogo} alt="logo" />{" "}
                    </Button> : null}
                  <Modal show={show_author_modal} onHide={() => setShowAuthorModal(false)} centered>
                    <Modal.Header closeButton>
                      <Modal.Title>Change the Author of the Page</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <Form onSubmit={handleAuthorChange}>
                        <Form.Group controlId="authorSelect">
                          <Form.Control as="select" aria-label="Default select" onChange={(event) => setAuthor(event.target.value)}>
                            {list_authors.map((user, index) => (
                              <option key={index} value={user.user_id}>
                                {user.id} {user.name} ({user.email})
                              </option>
                            ))}
                          </Form.Control>
                        </Form.Group>
                        <Container fluid className="d-flex justify-content-center p-4">
                          <Button variant="primary" type="submit">
                            Submit
                          </Button>
                        </Container>
                      </Form>
                    </Modal.Body>
                  </Modal>
                </Container>
                <Container fluid>
                  <Badge className="my-badge">Data</Badge> {pageContent.page_info.publication_date} {" "}
                  <Button className='my-btn-mod' size='sm' onClick={() => setShowDateModal(!show_date_modal)}>
                    <img src={wrenchLogo} alt="logo" />{" "}
                  </Button>
                  <Modal show={show_date_modal} onHide={() => handleModalOnHide()} centered>
                    <Modal.Header closeButton>
                      <Modal.Title>Change the Date of the Page</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <Form onSubmit={handleDateChange}>
                        {set_pub_date_error !== "" ? <Alert variant="danger">{set_pub_date_error}</Alert> : null}
                        <Form.Group>
                          <Row>
                            <Col sm={6}>
                              <Form.Label>Page Date</Form.Label>
                              <Form.Control type="date" title="date" name="date" disabled={!checked} onChange={(e) => setPubDate(e.target.value)} />
                            </Col>
                            <Col sm={6}>
                              <Form.Label>Set To Draft</Form.Label>
                              <Form.Check id="checkdate" name="checkdate" type="checkbox" onChange={() => setChecked(!checked)} />
                            </Col>
                          </Row>
                        </Form.Group>
                        <Container fluid className="d-flex justify-content-center p-4">
                          <Button variant="primary" type="submit">
                            Submit
                          </Button>
                        </Container>
                      </Form>
                    </Modal.Body>
                  </Modal>
                </Container>
              </div>
            </div>
          </div>
        </Col>
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Col xs={6} >
            <div className="my-page-title">
              <h1>
                {pageContent.page_info.title}
                <Button variant='secondary' className="my-edit-title" onClick={() => setShow_modal(!show_modal)}>
                  <img src={wrenchLogo} alt="logo" />{" "}
                </Button>
                <Modal show={show_modal} onHide={() => setShow_modal(!show_modal)}>
                  <Modal.Header closeButton>
                    <Modal.Title>Change the Title of the Page</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form onSubmit={handleTitleChange}>
                      <Form.Group>
                        <Form.Label>Page Title</Form.Label>
                        <Form.Control
                          type="text"
                          title="title"
                          value={title_page}
                          placeholder="Enter the new title of the page"
                          onChange={(event) => setTitle_page(event.target.value)}
                        />
                      </Form.Group>
                      <p className="text-danger">{set_error_title}</p>
                      <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShow_modal(!show_modal)}>
                          Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                          Submit
                        </Button>
                      </Modal.Footer>
                    </Form>
                  </Modal.Body>
                </Modal>
              </h1>
            </div>
            <>
              {show_empty_block_alert && (
                <Alert variant="danger">Non puoi salvare una pagina con blocchi vuoti.</Alert>
              )}
              {set_error_block !== "" && (
                <Alert variant="danger">{set_error_block}</Alert>
              )}
            </>
            <div className='d-flex'>

              <StrictModeDroppable droppableId="content">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} style={{ minWidth: "100%" }}>
                    {pageContent.content.map((block, index) => (
                      <Draggable key={block.block_id} draggableId={block.block_id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className='p-2' >
                            <ContentTypeView 
                              block={block} 
                              isDragging={snapshot.isDragging}
                              editable_block={editable_block}
                              setEditableBlock={setEditableBlock}
                              pageContent={pageContent}
                              setPageContent={setPageContent}
                              start_editing={start_editing}
                              stop_editing={stop_editing}
                              const page_id ={id}
                              setDirty={setDirty}
                              dirty={dirty}
                              images={images}
                              setImage={setImages}
                            />
                          </div>)}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </StrictModeDroppable>
            </div>
          </Col>
        </DragDropContext>
        <Col>
          <Container fluid className='mt-3 d-flex justify-content-center'>
            <Button className='my-btn' variant="primary" onClick={() => navigate(-1)}>
              <img src={arrowLogo} className='my-svg' />
            </Button>
          </Container>
          <Container fluid className="mt-3 d-flex justify-content-center">
            <Button id="save" variant="success" onClick={() => handleSaveClick()}>
              <img src={saveLogo} className="my-svg" alt="Save" />
            </Button>
          </Container>
          <Container fluid className="mt-3 d-flex justify-content-center">
            <Button id="delete" variant="danger" onClick={() => setShowDeleteModal(!showDeleteModal)}>
              <img src={deleteLogo} className="my-svg" alt="Delete" />
            </Button>
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
          </Container>
        </Col>
      </Row>
    </Container>
  );
}

export default My_Edit_Page;
