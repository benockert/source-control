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
    const [error, setError] = useState();

    const today = new Date().toISOString().slice(0, 10);

    useEffect(() => {
        window.addEventListener("touchstart", tapHandler);

        // listener for tapping the screen twice
        var tapedTwice = false;
        function tapHandler(event) {
            if (!tapedTwice) {
                tapedTwice = true;
                setTimeout(function () { tapedTwice = false; }, 300);
                return false;
            }
            event.preventDefault();
            // redirect to admin sign-in
            window.location = "/admin"
        }
    }, []);

    useEffect(() => {
        // get today's access path
        get(child(ref(database), `accessCode`)).then((snapshot) => {
            if (snapshot.exists()) {
                setAccessPath(snapshot.val());
            } else {
                setError("Access currently unavailable")
            }
        }).catch((error) => {
            //write error to db
        });

    }, []);

    useEffect(() => {
        accessPath && screenName && window.addEventListener('unload', (event) => {
            event.preventDefault();

            // write event to log
            set(ref(database, `events/${today}/${new Date().toLocaleTimeString().padStart(11, '0')}`), `DISCONNECTED: ${screenName}`);

            // removing the screen when the window closes 
            const screenRef = ref(database, `screens/${accessPath}/${screenName}`)
            remove(screenRef);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [screenRegistered, accessPath, today]);

    useEffect(() => {
        source && set(ref(database, `events/${today}/${new Date().toLocaleTimeString().padStart(11, '0')}`), `UPDATE: ${screenName} --> ${source}`);
    }, [source, today, screenName]);

    useEffect(() => {
        // get current source and set it, open listener
        const connectedScreenRef = ref(database, `screens/${accessPath}/${screenName}`);
        onValue(connectedScreenRef, (snapshot) => {
            const data = snapshot.val();
            setSource(data);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [screenRegistered]);

    const setScreenNameAndWriteToFirebase = () => {
        // write event to log
        set(ref(database, `events/${today}/${new Date().toLocaleTimeString().padStart(11, '0')}`), `CONNECTED: ${screenName}`).then(
            set(ref(database, `screens/${accessPath}/${screenName}`), 'livestream')
        );

        // write screen name to firebase, with source set to 'livestream'
        // then set screen registered to true

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
            {accessPath ? (screenRegistered ?
                <div style={source === 'livestream' || source === 'youtube' ? { 'backgroundColor': '#000000' } : { 'backgroundColor': '#ffffff' }}>
                    {displaySource()}
                </div>
                :
                <div style={{ 'margin': '10px' }}>
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
                </div>
            )
                :
                <h4 style={{ 'color': 'red', 'margin': '10px' }}>{error}</h4>}
        </div >
    );
}
