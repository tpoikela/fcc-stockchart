
const React = require('react');

class PriceTypeElem extends React.Component {

    render() {
        var onClick = this.props.onClick;
        return (
            <div className='price-type-elem'>
                <button onClick={onClick}>growth</button>
                <button onClick={onClick}>high</button>
                <button onClick={onClick}>low</button>
                <button onClick={onClick}>open</button>
                <button onClick={onClick}>close</button>
            </div>
        );
    }

}

PriceTypeElem.propTypes = {
    onClick: React.PropTypes.func
};

module.exports = PriceTypeElem;
