import { useState, useEffect } from 'react';
import { Container, Alert, Button, Badge, Row, Col, Spinner, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import API from '../API';
import dayjs from 'dayjs';
import '../css/style.css';
import deleteLogo from '../assets/trash-fill.svg';
import dndLogo from '../assets/arrow-down-up.svg';
import addLogo from '../assets/plus-circle-fill.svg';

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

function My_Add_Page(props) {
  const [pageContent, setPageContent] = useState({
    title: '',
    user: props.user,
    blocks: [],
    date: dayjs().format('YYYY-MM-DD'),
  });

  const [formBlocks, setFormBlocks] = useState([]);
  const [title, setTitle] = useState('');
  const [error_message, setError_message] = useState('');
  const [save_message, setSave_message] = useState('');
  const [validated, setValidated] = useState(false);

  if (!props.loggedIn) return (
    <div className='d-flex justify-content-center'>
      <Spinner animation="border" role="status" /> Loading
    </div>
  );

  const generateUniqueId = () => {
    return `${Math.random().toString(36)}`
  }

  const handleAddFormBlock = (type) => {
    const new_block = {
      id: generateUniqueId(),
      order_index: formBlocks.length,
      type: type,
      content: ''};
    setFormBlocks((prevBlocks) => [...prevBlocks, new_block]);
  };

  const handleUpdateFormBlock = (index, content) => {
    const new_block = {
      ...formBlocks[index],
      content: content
    };
    setFormBlocks((prevBlocks) => [
      ...prevBlocks.slice(0, index),
      new_block,
      ...prevBlocks.slice(index + 1)
    ]);
  };

  const handleRemoveFormBlock = (index) => () => {
    setFormBlocks((prevBlocks) => prevBlocks.filter((_, i) => i !== index));
  };

  const renderFormBlocks = () => {
    return formBlocks.map((block, index) => (
      <Draggable key={block.id} draggableId={block.id.toString()} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <Form.Group className={getBlockClassName(block.type)}>
              <Form.Label >{block.type === 1 ? "Header":"paragraph"}</Form.Label>
              <Form.Control id={block.id} name="content" as="textarea" rows={3} placeholder="Add new content here" onChange={(event) => handleUpdateFormBlock(index, event.target.value)}/>
              <Button className="my-btn" variant="secondary" onClick={handleRemoveFormBlock(index)}>
                <img src={deleteLogo} alt="delete" className='my-svg'/>
              </Button>
            </Form.Group>
          </div>
        )}
      </Draggable>
    ));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(formBlocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updateBlocks = items.map((block, index) => ({
      ...block,
      order_index: index
    }));

    if (pageContent.blocks.length === updateBlocks.length) {
      setPageContent((prevPageContent) => ({
        ...prevPageContent,
        blocks: updateBlocks
      }));
      console.log(pageContent)
    }
    setFormBlocks(updateBlocks);
  };

  const getBlockClassName = (type) => {
    switch (type) {
      case 1:
        return 'my-header-new';
      case 2:
        return 'my-paragraph-new';
      case 3:
        return 'my-image';
      default:
        return '';
    }
  };

  const handleSubmitForm = (event) => {
    event.preventDefault();

    const hasTitle = title.trim() !== '';
    const hasHeader = formBlocks.some((block) => block.type === 1 && block.content.trim() !== '');
    const hasParagraph = formBlocks.filter((block) => block.type === 2 && block.content.trim() !== '').length >= 1;
    let valid = true;

    if (!hasTitle) {
      setError_message('Title is required');
      setTimeout(() => {
        setError_message('');
      }, 1000);
      valid = false;
      return;
    }
    else if (!hasHeader) {
      setError_message('At least 1 header is required');
      setTimeout(() => {
        setError_message('');
      }, 1000);
      valid = false;
      return;
    }
    else if (!hasParagraph) {
      setError_message('At least 1 paragraph is required');
      setTimeout(() => {
        setError_message('');
      }, 1000);
      valid = false;
      return;
    }

    if (valid) {
      setError_message('');
      setSave_message('Content saved successfully');
      const newPageContent = {
        title: title,
        user: props.user,
        blocks: formBlocks,
        date: dayjs().format('YYYY-MM-DD'),
      };
      setValidated(true);
      setPageContent(newPageContent);

      setTimeout(() => {
        setSave_message('');
        setValidated(false);
      }, 3000);
    }
  }

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
          <Container fluid className=" d-flex justify-content-center ">
            <Button className="my-btn " variant="secondary" onClick={() => handleAddFormBlock(1)}>
              Add Header
            </Button>
            <Button className="my-btn" variant="secondary" onClick={() => handleAddFormBlock(2)}>
              Add paragraph
            </Button>
            <Button className="my-btn" variant="secondary" onClick={()  => handleAddFormBlock(3)}>
              Add Immagine
            </Button>
          </Container>
          <Form noValidate validated={validated} onSubmit={handleSubmitForm}>
            <Form.Group className='my-title-new'>
              <Form.Label>Titolo</Form.Label>
              <Form.Control id="title" name="title" type="text" placeholder="Title" onChange={(event) => setTitle(event.target.value)} required/>
            </Form.Group>
            <DragDropContext onDragEnd={handleDragEnd}>
              <StrictModeDroppable droppableId="formBlocks">
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps}>
                        {renderFormBlocks()}
                        {provided.placeholder}
                      </div>
                    )}
              </StrictModeDroppable>
            </DragDropContext>
            <Button className="my-btn" type="submit" variant="secondary">
                Save
              </Button>
            {error_message !== "" && (
                <Alert variant="danger">
                  {error_message}
                </Alert>
              )}
              {save_message !== "" && (
                <Alert variant="success">
                  {save_message}
                </Alert>
              )}
              
          </Form>
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
