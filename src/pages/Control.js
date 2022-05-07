import { useEffect, useState } from 'react';
import { Button, Dropdown, DropdownButton, ButtonGroup } from 'react-bootstrap';
import { ref, onValue, set } from "firebase/database";

import { database } from '../App';

export const Control = () => {
    const [screens, setScreens] = useState();
    const [selectedScreen, setSelectedScreen] = useState();
    const [selectedSource, setSelectedSource] = useState();

    useEffect(() => {
        // pull current screens from firebase and setup listener
        const connectedScreenRef = ref(database, `screens/`);
        onValue(connectedScreenRef, (snapshot) => {
            const data = snapshot.val();
            setScreens(data);
        });
    }, []);

    useEffect(() => {
        // update the selected source for this screen
        selectedSource && set(ref(database, `screens/${selectedScreen}`), selectedSource);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSource]);

    return (
        <div>
            <h3>Choose A Screen</h3>
            {screens &&
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
            }
            {selectedScreen &&
                <>
                    <h4>Select screen source:</h4>
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
