import React from "react";

export default class Timer extends React.Component {
  intervalTimer = null;

  constructor(props) {
    super(props);
    const { hours, minutes, seconds } = props;
    this.state = {
      hours,
      minutes,
      seconds,
      running: false
    };
  }

  componentDidMount = () => {
    if (!this.intervalTimer) {
      this.intervalTimer = setInterval(this._onIntervalFire, 1000);
    }
  };

  componentWillUnmount = () => clearInterval(this.intervalTimer);

  static getDerivedStateFromProps = ({ hours, minutes, seconds, running, paused }) => {
    if (!running && !paused) {
      return {
        hours,
        minutes,
        seconds,
        running
      };
    }
    return { running };
  };

  pad(n, z) {
    z = z || '0';
    n = n + '';
    return n.length >= 2 ? n : new Array(2 - n.length + 1).join(z) + n;
  }

  render() {
    const { hours, minutes, seconds } = this.state;
    const commonStyles = {
      color: "#ccc"
    };
    return (
      <div style={{ marginTop: 20, marginBottom: 10 }}>
        <span style={this.props.small ? { fontSize: 20, ...commonStyles } : { fontSize: 40, ...commonStyles }}>
          {this.pad(hours)} : {this.pad(minutes)} : {this.pad(seconds)}
        </span>
      </div>
    );
  }

  _onIntervalFire = () => {
    const { hours, minutes, seconds, running } = this.state;
    const { onFinish, isCountUp, onTick } = this.props;
    if (!running) {
      return;
    }

    const result = isCountUp
      ? countUpOneSecond(hours, minutes, seconds)
      : countDownOneSecond(hours, minutes, seconds);
    if (!result) {
      this.setState({ running: false });
      onFinish && onFinish();
    }

    this.setState({
      hours: result.hours,
      minutes: result.minutes,
      seconds: result.seconds
    }, () => {
      const { hours, minutes, seconds } = this.state;
      onTick && onTick(hours, minutes, seconds);
    });
  }
};

function countDownOneSecond (hours, minutes, seconds) {
  if (seconds === 0) {
    if (minutes === 0) {
      if (hours === 0) {
        // Count down finished
        return null;
      }
      return {
        hours: hours - 1,
        minutes: 59,
        seconds: 59
      };
    }
    return {
      hours,
      minutes: minutes - 1,
      seconds: 59
    };
  }

  return {
    hours,
    minutes,
    seconds: seconds - 1
  };
}

function countUpOneSecond (hours, minutes, seconds) {
  if (seconds === 59) {
    if (minutes === 59) {
      if (hours === 59) {
        // Counter finished
        return null;
      }
      return {
        hours: hours + 1,
        minutes: 0,
        seconds: 0
      };
    }
    return {
      hours,
      minutes: minutes + 1,
      seconds: 0
    };
  }

  return {
    hours,
    minutes,
    seconds: seconds + 1
  };
}
