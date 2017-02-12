
const React = require('react');

class PriceTypeElem extends React.Component {

    constructor(props) {
        super(props);
        this.buttons = ['growth', 'high', 'low', 'open', 'close'];
        this.onClick = this.onClick.bind(this);
        this.state = {
            selected: 'high'
        };
    }

    onClick(e) {
        this.props.onClick(e);
        var text = e.target.textContent;
        this.setState({selected: text});
    }

    render() {
        var onClick = this.onClick;

        var buttons = this.buttons.map( (item) => {
            var className = 'btn-primary';
            if (this.state.selected === item) {
                className = 'btn-success';
            }
            return (
                <button className={className} onClick={onClick}>{item}</button>
            );
        });

        return (
            <div className='price-type-elem'>
                {buttons}
            </div>
        );
    }

}

PriceTypeElem.propTypes = {
    onClick: React.PropTypes.func
};

module.exports = PriceTypeElem;
