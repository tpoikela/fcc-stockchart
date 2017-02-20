

const React = require('react');

/* Renders the logos and links for github, fcc and twitter.*/
class AuthorFooter extends React.Component {

    render() {

        return (
            <div className='author-footer'>
                <hr/>
                <ul className='footer-links'>
                    <li className='footer-link-icon'>
                        <a href='https://www.github.com/tpoikela'>
                            <i className='fa fa-github fa-2x'/>
                        </a>
                    </li>

                    <li className='footer-link-icon'>
                        <a href='https://www.twitter.com/tuomaspoi'>
                            <i className='fa fa-twitter fa-2x'/>
                        </a>
                    </li>

                    <li className='footer-link-icon'>
                        <a href='https://www.freecodecamp.com/tpoikela'>
                            <i className='fa fa-free-code-camp fa-2x'/>
                        </a>
                    </li>
                </ul>
                <p>Tuomas Poikela, 2017</p>
            </div>
        );
    }

}

module.exports = AuthorFooter;
