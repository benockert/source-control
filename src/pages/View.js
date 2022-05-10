import { useEffect, useState } from 'react';
import { Livestream } from './sources/Livestream';
import { PhotoMosaic } from './sources/PhotoMosaic';
import { Wonderwall } from './sources/Wonderwall';
import { Banner } from './sources/Banner';
import { FormControl, Button, Row, Col } from 'react-bootstrap';
import { ref, onValue, set, remove, get, child } from "firebase/database";
import { spotify_play, spotify_pause, generate_new_access_token, spotify_change_volume } from '../utils/api';

import { database } from '../App';

export const View = () => {
    const [screenRegistered, setScreenRegistered] = useState(false);
    const [screenName, setScreenName] = useState();
    const [source, setSource] = useState(); // one of 'livestream', 'wonderwall', 'photomosaic'
    const [accessPath, setAccessPath] = useState();
    const [error, setError] = useState();
    const [volume, setVolume] = useState();
    const [accessToken, setAccessToken] = useState();

    const today = new Date().toLocaleDateString().replaceAll('/', '-');

    // double tap listener for mobile app access to the admin page
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

    // get spotify information from database
    useEffect(() => {
        const accessTokenRef = ref(database, `spotify_creds`);
        onValue(accessTokenRef, (snapshot) => {
            if (snapshot.exists()) {
                setAccessToken(snapshot.val().access_token);
                setVolume(snapshot.val().volume)
            } else {
                console.log("No data available for spotify tokens");
            }
        })
    }, [])

    // handle changes to volume from the controller
    useEffect(() => {
        // TODO: hardcoded BAD!!!!
        console.log("volumne changed")
        volume && screenName === 'Snell Quad' && spotify_change_volume(accessToken, volume);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [volume]);

    // get the access code path for readig and writing to/from the proper firebase path
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

    // add listener for the window closing (send feedback to controller that the session has been disconnected)
    useEffect(() => {
        accessPath && screenName && window.addEventListener('unload', (event) => {
            event.preventDefault();

            // write event to log
            set(ref(database, `events/${today}/${new Date().getTime()}`), { 'text': `DISCONNECTED: ${screenName}`, 'time': new Date().toLocaleTimeString() });

            // removing the screen when the window closes 
            const screenRef = ref(database, `screens/${accessPath}/${screenName}`)
            remove(screenRef);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [screenRegistered, accessPath, today]);

    // handle changes to screen source (send feedback to database and play/pause playback)
    useEffect(() => {
        source && set(ref(database, `events/${today}/${new Date().getTime()}`), { 'text': `UPDATE: ${screenName} --> ${source}`, 'time': new Date().toLocaleTimeString() });

        // TODO: hardcoded BAD!!!!
        if (screenName === 'Snell Quad') {
            if (source === 'livestream') {
                // mute
                accessToken && spotify_change_volume(accessToken, 0).then((resp) => {
                    if (resp.status === 204) {
                        set(ref(database, `events/${today}/${new Date().getTime()}`), { 'text': `SPOTIFY SUCCESS: ${screenName} --> music paused`, 'time': new Date().toLocaleTimeString() });
                    } else if (resp.status === 401) {
                        generate_new_access_token('AQApkGLerL5kfcbkuEMPOT3WMySsTw-LhI5fBVqbHvbh_O_MvXAOoEpwrRS-OiQCRCn6k9y_cDOSFLXcnpcRXWPI8m46tvla4E4loWB_PGiHXoTpn1WhFjlPpggZY5-Vwus');
                    } else {
                        set(ref(database, `events/${today}/${new Date().getTime()}`), { 'text': `SPOTIFY ERROR: ${screenName} --> ${resp.status}`, 'time': new Date().toLocaleTimeString() });
                    }
                });
            } else {
                // unmute 
                accessToken && spotify_change_volume(accessToken, volume).then((resp) => {
                    if (resp.status === 204) {
                        set(ref(database, `events/${today}/${new Date().getTime()}`), { 'text': `SPOTIFY SUCCESS: ${screenName} --> music playing`, 'time': new Date().toLocaleTimeString() });
                    } else if (resp.status === 401) {
                        generate_new_access_token('AQApkGLerL5kfcbkuEMPOT3WMySsTw-LhI5fBVqbHvbh_O_MvXAOoEpwrRS-OiQCRCn6k9y_cDOSFLXcnpcRXWPI8m46tvla4E4loWB_PGiHXoTpn1WhFjlPpggZY5-Vwus');
                    } else {
                        set(ref(database, `events/${today}/${new Date().getTime()}`), { 'text': `SPOTIFY ERROR: ${screenName} --> ${resp.status}`, 'time': new Date().toLocaleTimeString() });
                    }
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [source, today, screenName]);

    // handle initial connection to firebase and set starting source
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
        set(ref(database, `events/${today}/${new Date().getTime()}`), { 'text': `CONNECTED: ${screenName}`, 'time': new Date().toLocaleTimeString() }).then(
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
            case 'banner':
                return <Banner />
            default:
            case 'livetream':
                return <Livestream />
        }
    }

    return (
        <div>
            {accessPath ? (screenRegistered ?
                <div style={source === 'livestream' || source === 'banner' ? { 'backgroundColor': '#000000' } : { 'backgroundColor': '#ffffff' }}>
                    {displaySource()}
                </div>
                :
                <div style={{ 'margin': '10px' }}>
                    <h2 style={{ 'fontSize': '30px' }} className="display-4"><img style={{ 'height': '50px', 'marginRight': '10px' }} src="/logo.png" alt=""></img>Commencement 2022 - Content Source Control</h2>
                    <h4>Register screen:</h4>
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
                            <Button variant="primary" disabled={screenName ? null : true} onClick={() => setScreenNameAndWriteToFirebase()}>Register</Button>
                        </Col>
                    </Row>
                </div>
            )
                :
                <h4 style={{ 'color': 'red', 'margin': '10px' }}>{error}</h4>}
        </div >
    );
}
