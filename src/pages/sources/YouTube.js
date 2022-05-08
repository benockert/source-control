import './sources.css';

export const YouTube = () => {

    return (
        <div className="container" style={{ 'marginLeft': 'auto', 'marginRight': 'auto', 'display': 'table' }}>
            <iframe className="responsive-iframe" width="1080" height="720" src="https://www.youtube-nocookie.com/embed/jEmG8qg9aHs?controls=0&amp;autoplay=1&amp;mute=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
    );
}