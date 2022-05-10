import { database } from '../App';
import { ref, set } from "firebase/database";

// pause playback
export async function spotify_pause(accessToken) {
    let req = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
    };
    let resp = await fetch('https://api.spotify.com/v1/me/player/pause', req);
    console.log("RESPONSE: ", resp);
    return resp;
}

// resume playback
export async function spotify_play(accessToken) {
    let req = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
    };

    let resp = await fetch('https://api.spotify.com/v1/me/player/play', req);
    return resp;
}


// refresh the access token, set the new one in firebase
export async function generate_new_access_token(refreshToken) {
    var params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);

    let req = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': 'Basic MjY0OTI4NGE4ZTA0NDMyNThhZDI2NzVjMjlhNWVkMTY6MTBjODQ2YzRlMjYzNDQ0ZGI4ZDQ3ZTlmYzA1MzcyNWQ=' },
        body: params
    }
    let resp = await fetch('https://accounts.spotify.com/api/token', req);
    let data = await resp.json();

    set(ref(database, 'spotify_creds/access_token'), data.access_token);
}
