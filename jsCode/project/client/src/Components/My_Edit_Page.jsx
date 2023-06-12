import { useState, useEffect } from 'react';
import { Container, Card, Button, Modal, Badge, Row, Col, Spinner, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import API from '../API';
import '../css/style.css';
import deleteLogo from '../assets/trash-fill.svg';
import dndLogo from '../assets/arrow-down-up.svg';
import wrenchLogo from '../assets/wrench.svg';

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
  const [pageContent, setPageContent] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  const [editable_block, setEditableBlock] = useState(null);
  const [hover, setHover] = useState(null);

  const [title_page, setTitle_page] = useState("");
  const [show_modal, setShow_modal] = useState(false);
  const [set_error_title, setError_title] = useState("");

  //console.log(pageContent);
  function start_editing(block_id) {
    setEditableBlock(block_id);
  }

  function stop_editing() {
    setEditableBlock(null);
  }

  const handleCardHover = (block_id) => {
    setHover(block_id);
  }

  const handleCardLeave = () => {
    setHover(null);
  }

  const handleTitleChange = (event) => {
    event.preventDefault();
    if (title_page.trim() === "") {
      setError_title("Il titolo non può essere vuoto.");
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
  
  useEffect(() => {
    API.getPageContent(id)
      .then((data) => {
        setPageContent(data)
        setTitle_page(data.page_info.title);
      })
      .catch((err) => console.log(err));
  }, []);

  if (pageContent.length === 0) {
    return (
      <div>
        <Spinner animation="border" role="status" /> Loading
      </div>
    );
  }

  function content_type_view(block, isDragging) {
    const dnd_style = isDragging ? "my-card-container-edit-dnd" : "my-card-container-edit";
    const edit = editable_block === block.block_id;
    const show_add = hover === block.block_id;

    const handleDoubleClick = () => {
      start_editing(block.block_id);
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
      console.log("focus");
      if (event.target.innerText === "Double Click To Modify") {
        event.target.innerText = "";
      }
    };

    function renderEditableContent(block, edit, handleDoubleClick, handleBlur, handleFocus, handleAdd, handleDelete, show_add, isDragging) {
      const BlockElement = block.block_type === 1 ? Card.Title : block.block_type === 2 ? Card.Text : null;

      if (!BlockElement) return null;

      return (
        <BlockElement
          contentEditable={edit}
          onDoubleClick={handleDoubleClick}
          onBlur={handleBlur}
          suppressContentEditableWarning
          className={edit ? 'content-editable' : ''}
          onFocus={handleFocus}
        >
          {block.content !== null && block.content !== '' ? block.content : 'Double Click To Modify'}
          {!isDragging && editable_block === null ? (
            <>
              <Button variant="secondary" size="sm" className="hover-button-title" onClick={() => handleAdd(block.order_index, 1)}>Title</Button>
              <Button variant="secondary" size="sm" className="hover-button-text" onClick={() => handleAdd(block.order_index, 2)}>Text</Button>
              <Button className="hover-button-del" onClick={() => handleDelete(block.block_id)}>
                <img src={deleteLogo} className="my-svg" alt="Delete" />
              </Button>
            </>
          ) : null}
        </BlockElement>
      );
    }

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
    }

    const handleDelete = (blockId) => {
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
    };

    return (
      <Card key={block.block_id} className={dnd_style} onMouseEnter={() => handleCardHover(block.block_id)} onMouseLeave={() => handleCardLeave()}>
        <Card.Body>
          {isDragging ? <img className="my-svg-dnd" src={dndLogo} alt="dnd" /> : null}
          {renderEditableContent(block, edit, handleDoubleClick, handleBlur, handleFocus, handleAdd, handleDelete, show_add, isDragging)}
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
  }

  return (
    <>
      <Row style={{ marginRight: 0 }}>
        <Col>
          <div className="author-info">
            <div className="bg-light author-info-container p-2">
              <div style={{ padding: '10px' }}>
                <Container fluid>
                  <Badge className="my-badge">Autore</Badge> {pageContent.page_info.author}
                </Container>
                <Container fluid>
                  <Badge className="my-badge">Data</Badge> {pageContent.page_info.publication_date}
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
            <div className='d-flex'>
              <StrictModeDroppable droppableId="content">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {pageContent.content.map((block, index) => (
                      <Draggable key={block.block_id} draggableId={block.block_id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <div ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className='p-2'
                          >
                            {
                              content_type_view(block, snapshot.isDragging)
                            }
                          </div>
                        )}
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

export default My_Edit_Page;
