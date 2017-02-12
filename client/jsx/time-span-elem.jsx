
const React = require('react');

/* Controls buttons which select the time span shown on the plot.*/
class TimeSpanElem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selected: '1y'
        };

        this.buttons = ['1m', '3m', '6m', '1y'];

        this.onClick = this.onClick.bind(this);
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
            <div className='time-span-elem'>
                {buttons}
            </div>
        );

    }

}


TimeSpanElem.propTypes = {
    onClick: React.PropTypes.func
};

module.exports = TimeSpanElem;
