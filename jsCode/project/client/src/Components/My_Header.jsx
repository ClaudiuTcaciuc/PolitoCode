import { Button, Container, Form, Navbar, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import globeLogo from '../assets/globe-americas.svg';
import personLogo from '../assets/person-circle.svg';
import '../css/style.css';
import API from '../API';

function My_Header(props) {
    const navigate = useNavigate();
    const app_name = 'Content Management System'
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const name = props.loggedIn === true ? props.user.name : 'Login';

    const handleLogoutModal = () => {
        setShowLogoutModal(!showLogoutModal);
    }

    const doLogOut = async () => {
        setShowLogoutModal(false);
        await API.logOut();
        props.setUser(null);
        props.setLoggedIn(false);
        navigate('/');
    }

    return (
        <Navbar className='my-header' variant="dark">
            <Container fluid>
                <Navbar.Brand>
                    <Button className=" me-2" onClick={() => navigate('/')}>
                        <img src={globeLogo} className="App-logo my-svg" alt="logo" />{" "}
                        {app_name}
                    </Button>
                </Navbar.Brand>
                <Form className="d-flex align-items-center" >
                    <Form.Control
                        type="search"
                        placeholder="Search"
                        className="me-auto"
                        aria-label="Search query"
                    />
                </Form>
                {props.loggedIn ? (
                    <Navbar.Brand>
                        <Button className="me-5 text-white" onClick={() => handleLogoutModal()}>
                            <img src={personLogo} className="App-logo my-svg" alt="logo" />{" "}
                            {name + ' (Logout)'}
                        </Button>
                    </Navbar.Brand>
                ) : (
                    <Navbar.Brand>
                        <Button className=" me-5 text-white" onClick={() => navigate('/login')} >
                            <img src={personLogo} className="App-logo my-svg" alt="logo" />{" "}
                            {name}
                        </Button>
                    </Navbar.Brand>
                )}
            </Container>
            <Modal show={showLogoutModal} onHide={handleLogoutModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Logout Confirmation</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to logout?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleLogoutModal}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={doLogOut}>
                        Logout
                    </Button>
                </Modal.Footer>
            </Modal>
        </Navbar>
    );
}

export default My_Header;
