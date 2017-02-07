
const React = require('react');

class TimeSpanElem extends React.Component {


    render() {
        var onClick = this.props.onClick;

        return (
            <div className='time-span-elem'>
                <button onClick={onClick}>1m</button>
                <button onClick={onClick}>3m</button>
                <button onClick={onClick}>6m</button>
                <button onClick={onClick}>1y</button>
            </div>
        );

    }

}


TimeSpanElem.propTypes = {
    onClick: React.PropTypes.func
};

module.exports = TimeSpanElem;
