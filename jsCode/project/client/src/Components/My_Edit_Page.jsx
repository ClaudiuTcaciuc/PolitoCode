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
    API.getAllImages()
      .then((data) => {
        setImages(data);
      })
      .catch((err) => console.log(err));
  }, []);

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

  function content_type_view(block, isDragging) {
    const dnd_style = isDragging ? "my-card-container-edit-dnd"
      : block.content === null || block.content === '' ? "my-card-container-edit-empty" : "my-card-container-edit";
    const edit = editable_block === block.block_id;

    const handleDoubleClick = (event) => {
      start_editing(block.block_id);
      const element = event.target;

      const handleMouseUp = (mouseEvent) => {
        element.removeEventListener('mouseup', handleMouseUp);
        const selection = window.getSelection();
        const range = document.createRange();
        const caretPosition = document.caretRangeFromPoint(mouseEvent.clientX, mouseEvent.clientY);
        if (caretPosition) {
          range.setStart(caretPosition.startContainer, caretPosition.startOffset);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      };

      element.addEventListener('mouseup', handleMouseUp);
    };

    const handleBlur = (event) => {
      // fix for content changing on the button text or title
      if (event.target.nodeName === "BUTTON")
        return;
      event.preventDefault();
      update_block_content(event, block.block_id);
      stop_editing();
    };

    const handleFocus = (event) => {
      if (event.target.innerText === "Double Click To Modify") {
        event.target.innerText = "";
      }
    };

    function renderEditableContent(block, edit, handleDoubleClick, handleBlur, handleFocus, handleAdd, handleDelete, isDragging) {
      const BlockElement = block.block_type === 1 ? Card.Title : Card.Text;
      let content;

      if (block.block_type === 1 || block.block_type === 2) {
        content = block.content !== null && block.content !== '' ? block.content : "Double Click To Modify";
      } else {
        if (block.block_type === 3) {
          if (block.content === null || block.content === "") {
            content = (
              <Carousel slide={false}>
                {images.map((image, index) => (
                  <Carousel.Item key={index} onClick={() => handleUpdateFormBlockImage(image, block.block_id)}>
                    <img src={"http://localhost:3000/" + image.image_path} className='image-show' />
                  </Carousel.Item>
                ))}
              </Carousel>
            );
          } else {
            content = (
              <div onClick={() => handleUpdateFormBlockImage("", block.block_id)}>
                <Card.Img src={"http://localhost:3000/" + block.content} className='image-show ' />
                <div className="image-overlay"></div>
              </div>
            );
          }
        }
      }
      return (
        <>
          {block.block_type === 1 || block.block_type === 2 ? (
            <BlockElement
              contentEditable={edit}
              onClick={handleDoubleClick}
              onBlur={handleBlur}
              suppressContentEditableWarning
              className={edit ? 'content-editable' : ''}
              onFocus={handleFocus}
            >
              {content}
            </BlockElement>
          ) : (
            <Container fluid className="d-flex justify-content-center">{content}</Container>
          )}
          {!isDragging && editable_block === null ? (
            <>
              <Button variant="secondary" size="sm" className="hover-button-title" onClick={() => handleAdd(block.order_index, 1)}>Title</Button>
              <Button variant="secondary" size="sm" className="hover-button-text" onClick={() => handleAdd(block.order_index, 2)}>Text</Button>
              <Button variant="secondary" size="sm" className="hover-button-img" onClick={() => handleAdd(block.order_index, 3)}>Img</Button>
              <Button className="hover-button-del" onClick={() => handleErrorDelete(block)}>
                <img src={deleteLogo} className="my-svg" alt="Delete" />
              </Button>
            </>
          ) : null}
        </>
      );
    }

    const handleErrorDelete = (block) => {
      const numHeader = pageContent.content.filter((block) => block.block_type === 1 && block.content.trim() !== "").length;
      const numParagraph = pageContent.content.filter((block) => block.block_type === 2 && block.content.trim() !== "").length;
      const numImage = pageContent.content.filter((block) => block.block_type === 3 && block.content.trim() !== "").length;
      if (numHeader <= 1 && block.type === 1) {
        setError_block("You must have at least one header and one paragraph or image");
        setTimeout(() => {
          setError_block("");
        }, 3000);
        return;
      }
      else {
        if (numParagraph + numImage - 1 <= 0) {
          setError_block("You must have at least one header and one paragraph or image");
          setTimeout(() => {
            setError_block("");
          }, 3000);
          return;
        }
      }
      handleDelete(block.block_id);
    };

    const handleUpdateFormBlockImage = (image, block_id) => {
      const new_path = image === "" ? "" : image.image_path;
      setPageContent((prev) => {
        const new_page_content = prev.content.map((block) => {
          if (block.block_id === block_id) {
            return { ...block, content: new_path };
          }
          return block;
        });
        return { ...prev, content: new_page_content };
      });
      doImageUpdate(new_path, block_id);
    }

    const doImageUpdate = async (image, block_id) => {
      await API.updateBlockImage(image, block_id);
      setDirty(!dirty);
    };

    function update_block_content(event, block_id) {
      const new_content = event.target.innerText;
      if (new_content === "") {
        handleDelete(block_id);
        return;
      }
      setPageContent((prev) => {
        const new_page_content = prev.content.map((block) => {
          if (block.block_id === block_id) {
            return { ...block, content: new_content };
          }
          return block;
        });
        return { ...prev, content: new_page_content };
      });
      doUpdateBlock({ block_id, content: new_content });
    }

    const doUpdateBlock = async (block) => {
      await API.editContentBlock(block, id);
    };

    const handleDelete = async (blockId) => {
      setPageContent((prev) => {
        const delContent = prev.content.find((block) => block.block_id === blockId);
        const newContent = prev.content.filter((block) => block.block_id !== blockId);
        newContent.forEach((block) => {
          if (block.order_index > delContent.order_index) {
            block.order_index = block.order_index - 1;
          }
        });
        return { ...prev, content: newContent };
      });
      doDeleteBlock(blockId);
    };

    const doDeleteBlock = async (block_id) => {
      await API.deleteContentBlock(block_id);
      setDirty(!dirty);
    };

    const handleAdd = (order_index, type) => {
      order_index = order_index - 1;
      const last_id = Math.max.apply(Math, pageContent.content.map(function (o) { return o.block_id; }))

      const new_block = {
        block_id: last_id + 1,
        block_type: type,
        content: "",
        order_index: pageContent.content[order_index].order_index + 1,
        page_id: pageContent.content[order_index].page_id,
      };

      setPageContent((prev) => {
        const newContent = prev.content.map((block) => {
          if (block.order_index >= new_block.order_index) {
            return { ...block, order_index: block.order_index + 1 };
          }
          return block;
        });

        newContent.splice(order_index + 1, 0, new_block);
        return { ...prev, content: newContent };
      });

      doAddBlock(new_block);
    };

    const doAddBlock = async (block) => {
      await API.addContentBlock(block, id);
      setDirty(!dirty);
    };

    return (
      <Card key={block.block_id} className={dnd_style} onMouseDown={(e) => e.preventDefault()}>
        <Card.Body>
          {isDragging ? <img className="my-svg-dnd" src={dndLogo} alt="dnd" /> : null}
          {renderEditableContent(block, edit, handleDoubleClick, handleBlur, handleFocus, handleAdd, handleDelete, isDragging)}
        </Card.Body>
      </Card>
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
    event.stopPropagation();
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

  return (
    <>
      <Row style={{ marginRight: 0 }}>
        <Col>
          <div className="author-info">
            <div className="bg-light author-info-container p-2">
              <div style={{ padding: '10px' }}>
                <Container fluid>
                  <Badge className="my-badge">Autore</Badge> {pageContent.page_info.author} {" "}
                  {props.user.isAdmin ?
                    <Button className='my-btn-mod' size='sm' onClick={() => setShowAuthorModal(!show_author_modal)}>
                      <img src={wrenchLogo} alt="logo" />{" "}
                    </Button> : null}
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
                              <Form.Control type="date" title="date" name="date" disabled={!checked} onChange={(e) => setPubDate(e.target.value)}/>
                            </Col>
                            <Col sm={6}>
                              <Form.Label>Set To Draft</Form.Label>
                              <Form.Check id="checkdate" name="checkdate" type="checkbox" onChange={() => setChecked(!checked)}/>
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
                            {content_type_view(block, snapshot.isDragging)}
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
    </>
  );
}

export default My_Edit_Page;
