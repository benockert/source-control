import { useEffect, useState } from 'react';
import { Button, Dropdown, DropdownButton, ButtonGroup, Row, Col, FormControl } from 'react-bootstrap';
import { ref, onValue, set } from "firebase/database";

import { database } from '../App';

import './Control.css';

export const Control = () => {
    const [screens, setScreens] = useState();
    const [selectedScreen, setSelectedScreen] = useState();
    const [selectedSource, setSelectedSource] = useState();
    const [accessCodeEntered, setAccessCodeEntered] = useState();
    const [accessCode, setAccessCode] = useState();

    useEffect(() => {
        // pull current screens from firebase and setup listener
        const connectedScreenRef = ref(database, `screens/${accessCode}`);
        accessCodeEntered && onValue(connectedScreenRef, (snapshot) => {
            const data = snapshot.val();
            setScreens(data);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accessCodeEntered]);

    useEffect(() => {
        // update the selected source for this screen
        selectedSource && set(ref(database, `screens/${accessCode}/${selectedScreen}`), selectedSource);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSource]);

    return (
        <div style={{ 'margin': '10px' }}>
            {!accessCodeEntered &&
                <>
                    <h3>Sign in:</h3>
                    <Row>
                        <Col xs={9}>
                            <FormControl
                                placeholder="Enter access code..."
                                aria-label="access-code"
                                aria-describedby="basic-addon1"
                                onChange={(e) => setAccessCode(e.target.value)}
                            />
                        </Col>
                        <Col>
                            <Button variant="primary" disabled={accessCode ? null : true} onClick={() => setAccessCodeEntered(true)}>Authenticate</Button>
                        </Col>
                    </Row>
                </>
            }
            {screens &&
                <>
                    <h3>Choose screen:</h3>
                    <DropdownButton
                        as={ButtonGroup}
                        key='screen-selection'
                        variant='primary'
                        title={selectedScreen || 'Select'}
                    >
                        {
                            Object.keys(screens).map(function (key) {
                                return <Dropdown.Item key={`dropdown-select-screen-${key}`} onClick={() => setSelectedScreen(key)} active={selectedScreen === key ? true : null}>{key}</Dropdown.Item>
                            })
                        }
                    </DropdownButton>
                </>
            }
            {
                selectedScreen &&
                <>
                    <h3 style={{ 'margin-top': '20px' }}>Select screen source:</h3>
                    <ButtonGroup >
                        <Button variant={screens[selectedScreen] === 'livestream' ? 'primary' : 'secondary'} onClick={() => setSelectedSource('livestream')}>Livestream</Button>
                        <Button variant={screens[selectedScreen] === 'photomosaic' ? 'primary' : 'secondary'} onClick={() => setSelectedSource('photomosaic')}>Photo Mosaic</Button>
                        <Button variant={screens[selectedScreen] === 'wonderwall' ? 'primary' : 'secondary'} onClick={() => setSelectedSource('wonderwall')}>Wonder Wall</Button>
                    </ButtonGroup>
                </>
            }
        </div >
    );
}
