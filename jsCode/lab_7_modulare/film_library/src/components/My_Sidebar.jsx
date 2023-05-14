import 'bootstrap/dist/css/bootstrap.min.css';
import { ListGroup } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import '../css/style.css';


function SideBar_Filter(props) {
    return (
        <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', overflow: 'scroll initial' }}>
            <div className='bg-light' style={{ flex: '0 0 300px' }}>
                <div style={{ padding: '10px' }}>
                    <ListGroup variant='flush' defaultActiveKey="#link1">
                        <LinkContainer to="/" activeClassName="active">
                            <ListGroup.Item className='custom-listgroup' action onClick={() => props.update_filter("All")}> All </ListGroup.Item>
                        </LinkContainer>
                        <LinkContainer to="/Favorite" activeClassName="active">
                            <ListGroup.Item className='custom-listgroup' action onClick={() => props.update_filter("Favorite")}> Favorite </ListGroup.Item>
                        </LinkContainer>
                        <LinkContainer to="/bestRated" activeClassName="active">
                            <ListGroup.Item className='custom-listgroup' action onClick={() => props.update_filter("bestRated")}> Best Rated </ListGroup.Item>
                        </LinkContainer>
                        <LinkContainer to="/seenLastMonth" activeClassName="active">
                            <ListGroup.Item className='custom-listgroup' action onClick={() => props.update_filter("seenLastMonth")}> Seen Last Month </ListGroup.Item>
                        </LinkContainer>
                        <LinkContainer to="/Unseen" activeClassName="active">
                            <ListGroup.Item className='custom-listgroup' action onClick={() => props.update_filter("Unseen")}> Unseen </ListGroup.Item>
                        </LinkContainer>
                    </ListGroup>
                </div>
            </div>
        </div>
    );
}

export default SideBar_Filter;