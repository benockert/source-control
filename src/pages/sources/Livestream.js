import './sources.css';

export const Livestream = () => {

    return (
        <div className="container" style={{ 'marginLeft': 'auto', 'marginRight': 'auto', 'display': 'table' }}>
            <iframe className="responsive-iframe" title="livestream" id="ls_embed_1651782659" src="https://livestream.com/accounts/9010826/events/10386581/player?width=1920&amp;height=1080&amp;enableInfoAndActivity=true&amp;defaultDrawer=&amp;autoPlay=true&amp;mute=false" width="1920" height="1080" frameBorder="3" scrolling="no" autoPlay={true} allow="autoplay;" allowFullScreen={true}> </iframe>
        </div>
    );
}