import { useState, useEffect } from 'react';
import { Container, Card, Button, ListGroup, Badge, Row, Col, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import API from '../API';
import dayjs from 'dayjs';
import '../css/style.css';
import deleteLogo from '../assets/trash-fill.svg';
import dndLogo from '../assets/arrow-down-up.svg';

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

  function start_editing(block_id) {
    setEditableBlock(block_id);
  }
  function stop_editing() {
    setEditableBlock(null);
  }

  function update_block_content(event) {
    const new_content = event.target.innerText;
    const block_id = editable_block;

    setPageContent((prev) => {
      const new_page_content = prev.content.map((block) => {
        if (block.block_id === block_id) {
          block.content = new_content;
        }
        return block;
      });
      return { ...prev, content: new_page_content };
    });
  }

  useEffect(() => {
    API.getPageContent(id)
      .then((data) => setPageContent(data))
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

    const handleDoubleClick = () => {
      start_editing(block.block_id);
    };

    const handleBlur = () => {
      stop_editing();
    };

    const handleChange = (event) => {
      update_block_content(event);
    };

    return (
      <Card key={block.block_id} className={dnd_style}>
        <Card.Body>
          {isDragging ? (<img className='my-svg-dnd' src={dndLogo} alt="dnd" />) : null}
          {block.block_type === 1 ? (
            <Card.Title
              contentEditable={edit}
              onDoubleClick={handleDoubleClick}
              onBlur={handleBlur}
              onChange={handleChange}
              suppressContentEditableWarning
              className={edit ? "content-editable" : ""}
            >
              {block.content}
            </Card.Title>
          ) : block.block_type === 2 ? (
            <Card.Text
              contentEditable={edit}
              onDoubleClick={handleDoubleClick}
              onBlur={handleBlur}
              onChange={handleChange}
              suppressContentEditableWarning
              className={edit ? "my-card-container-edit-dnd" : ""}
            >
              {block.content}
            </Card.Text>
          ) : null}
        </Card.Body>
      </Card>
    )
  }
  // print new order
  const items = Array.from(pageContent.content);
  const order = items.map((item) => item.block_id);
  //console.log(order);

  function handleOnDragEnd(result) {

    if (!result.destination) return;
    const { source, destination } = result;

    if (destination.droppableId === 'delete') {
      setPageContent(
        (prev) => {
          const new_page_content = [...prev.content];
          new_page_content.splice(source.index, 1);
          return { ...prev, content: new_page_content };
        },
      );
    } else {
      const { source, destination } = result;
      const items = Array.from(pageContent.content);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);

      setPageContent({ ...pageContent, content: items });
    }
  }
  console.log(pageContent);
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
              <h1>{pageContent.page_info.title}</h1>
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
            <Button className="my-btn" variant="danger" onClick={() => navigate(`/edit_page/${id}`)}>
              <img src={deleteLogo} className="my-svg" alt="Delete" />
            </Button>
          </Container>
        </Col>
      </Row>
    </>
  );
}

export default My_Edit_Page;
