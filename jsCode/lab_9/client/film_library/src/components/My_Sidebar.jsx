import 'bootstrap/dist/css/bootstrap.min.css';
import { ListGroup } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom';

import '../css/style.css';


function SideBar_Filter() {
    const navigate = useNavigate();
    const handleFilterClick = (filter) => {
        navigate (filter === "all" ? "/" : `/${filter}`)
    };
    return (
        <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', overflow: 'scroll initial' }}>
            <div className='bg-light' style={{ flex: '0 0 300px' }}>
                <div style={{ padding: '10px' }}>
                    <ListGroup variant='flush' defaultActiveKey="#link1">
                        <LinkContainer to="/" activeClassName="active">
                            <ListGroup.Item className='custom-listgroup' action onClick={() => handleFilterClick("all")}> All </ListGroup.Item>
                        </LinkContainer>
                        <LinkContainer to="/favorites" activeClassName="active">
                            <ListGroup.Item className='custom-listgroup' action onClick={() => handleFilterClick("favorites")}> Favorite </ListGroup.Item>
                        </LinkContainer>
                        <LinkContainer to="/bestrated" activeClassName="active">
                            <ListGroup.Item className='custom-listgroup' action onClick={() => handleFilterClick("bestrated")}> Best Rated </ListGroup.Item>
                        </LinkContainer>
                        <LinkContainer to="/seenlastmonth" activeClassName="active">
                            <ListGroup.Item className='custom-listgroup' action onClick={() => handleFilterClick("seenlastmonth")}> Seen Last Month </ListGroup.Item>
                        </LinkContainer>
                        <LinkContainer to="/unseen" activeClassName="active">
                            <ListGroup.Item className='custom-listgroup' action onClick={() => handleFilterClick("unseen")}> Unseen </ListGroup.Item>
                        </LinkContainer>
                    </ListGroup>
                </div>
            </div>
        </div>
    );
}

export default SideBar_Filter;