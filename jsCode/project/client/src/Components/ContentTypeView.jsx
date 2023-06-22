import { useState } from 'react';
import { Container, Card, Button, Carousel, Alert } from 'react-bootstrap';
import API from '../API';
import '../css/style.css';
import deleteLogo from '../assets/trash-fill.svg';
import dndLogo from '../assets/arrow-down-up.svg';

function ContentTypeView(props) {
  const [editable_block, setEditableBlock] = useState(null);

  const block = props.block;
  const isDragging = props.isDragging;
  const pageContent = props.pageContent;
  const setDirty = props.setDirty;
  const dirty = props.dirty;
  const images = props.images;
  const id = props.page_id;
  const setErrorBlock = props.setErrorBlock;
  const setShowEmptyBlockAlert = props.setShowEmptyBlockAlert;

  const dnd_style = isDragging ? "my-card-container-edit-dnd"
    : block.content === null || block.content === '' ? "my-card-container-edit-empty" : "my-card-container-edit";
  const edit = editable_block === block.block_id;

  const handleDoubleClick = (event) => {
    setEditableBlock(block.block_id);
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(event.target);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const handleBlur = (event) => {
    // fix for content changing on the button text or title
    if (event.target.nodeName === "BUTTON")
      return;
    event.preventDefault();
    update_block_content(event, block.block_id);
    setEditableBlock(null)
  };

  const handleFocus = (event) => {
    if (event.target.innerText === "Double Click To Modify") {
      event.target.innerText = "";
    }
  };

  function renderEditableContent(block, edit, handleDoubleClick, handleBlur, handleFocus, handleAdd, isDragging) {
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
      setErrorBlock("You must have at least one header and one paragraph or image");
      setTimeout(() => {
        setErrorBlock("");
      }, 3000);
      return;
    }
    else {
      if (numParagraph + numImage - 1 <= 0) {
        setErrorBlock("You must have at least one header and one paragraph or image");
        setTimeout(() => {
          setErrorBlock("");
        }, 3000);
        return;
      }
    }
    handleDelete(block.block_id);
  };

  const handleUpdateFormBlockImage = (image, block_id) => {
    const new_path = image === "" ? "" : image.image_path;
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
    doUpdateBlock({ block_id, content: new_content });
  }

  const doUpdateBlock = async (block) => {
    await API.editContentBlock(block, id);
    setDirty(!dirty);
    setShowEmptyBlockAlert("");
  };

  const handleDelete = (blockId) => {
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
        {renderEditableContent(block, edit, handleDoubleClick, handleBlur, handleFocus, handleAdd, isDragging)}
      </Card.Body>
    </Card>
  );
}

export default ContentTypeView;