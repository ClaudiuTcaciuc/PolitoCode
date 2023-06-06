// import react / bootstrap libraries
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
// import logo
import plusLogo from '../assets/plus-circle-fill.svg';
// import css
import '../css/style.css';

function My_Footer(props) {
    return (
        <Container fluid>
            {props.loggedIn && (
                <div className='fixed-bottom-right'>
                    <Button variant="primary">
                        <img src={plusLogo} className="App-logo my-svg" alt="logo" />
                    </Button>
                </div>
            )}
        </Container>
    );
}
export default My_Footer;