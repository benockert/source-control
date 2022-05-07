import { useEffect, useState } from 'react';
import { Livestream } from './sources/Livestream';
import { PhotoMosaic } from './sources/PhotoMosaic';
import { Wonderwall } from './sources/Wonderwall';
import { FormControl, Button, Row, Col } from 'react-bootstrap';
import { ref, onValue, set, remove, get, child } from "firebase/database";

import { database } from '../App';

export const View = () => {
    const [screenRegistered, setScreenRegistered] = useState(false);
    const [screenName, setScreenName] = useState();
    const [source, setSource] = useState(); // one of 'livestream', 'wonderwall', 'photomosaic'
    const [accessPath, setAccessPath] = useState();

    useEffect(() => {
        // get today's access path
        get(child(ref(database), `accessCode`)).then((snapshot) => {
            if (snapshot.exists()) {
                console.log(snapshot.val());
                setAccessPath(snapshot.val());
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });

    }, []);

    useEffect(() => {
        accessPath && screenName && window.addEventListener('unload', (event) => {
            event.preventDefault();

            console.log("Setting listener");

            // removing the screen when the window closes 
            const screenRef = ref(database, `screens/${accessPath}/${screenName}`)
            remove(screenRef);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [screenRegistered, accessPath]);

    useEffect(() => {
        // get current source and set it, open listener
        const connectedScreenRef = ref(database, `screens/${accessPath}/${screenName}`);
        onValue(connectedScreenRef, (snapshot) => {
            const data = snapshot.val();
            console.log(`UPDATED SOURCE for ${screenName}:`, data)
            setSource(data);
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [screenRegistered]);

    const setScreenNameAndWriteToFirebase = () => {
        // write screen name to firebase, with source set to 'livestream'
        // then set screen registered to true
        set(ref(database, `screens/${accessPath}/${screenName}`), 'livestream');
        setScreenRegistered(true)
    }

    const displaySource = () => {
        switch (source) {
            case 'wonderwall':
                return <Wonderwall />
            case 'photomosaic':
                return <PhotoMosaic />
            default:
            case 'livetream':
                return <Livestream />
        }
    }

    return (
        <div>
            {accessPath && (screenRegistered ?
                <div style={source === 'livestream' ? { 'background-color': '#000000' } : { 'background-color': '#ffffff' }}>
                    {displaySource()}
                </div>
                :
                <>
                    <h2>NU Commencement - Video Source Control</h2>
                    <Row>
                        <Col xs={9}>
                            <FormControl
                                placeholder="Enter screen name/location..."
                                aria-label="screen-name"
                                aria-describedby="basic-addon1"
                                onChange={(e) => setScreenName(e.target.value)}
                            />
                        </Col>
                        <Col>
                            <Button variant="primary" disabled={screenName ? null : true} onClick={() => setScreenNameAndWriteToFirebase()}>Register Screen</Button>
                        </Col>
                    </Row>
                </>
            )}
        </div >
    );
}
