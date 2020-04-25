import React from "react";
import moment from "moment";

const generateTimeBlockKey = () => moment().format("DD/MM/YYYY");

function logTimeBlock (block) {
  if (!localStorage) {
    return null;
  }
  const key = generateTimeBlockKey();
  const existingBlocksStr = localStorage.getItem(key);
  const existingBlocks = existingBlocksStr ? JSON.parse(existingBlocksStr) : [];

  localStorage.setItem(
    key,
    JSON.stringify([block, ...existingBlocks])
  );
}

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

/**
 * States:
 * 1. Idle
 * 2. Running
 * @param {*} param0 
 */
class Timer extends React.Component {
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

  render() {
    const { hours, minutes, seconds } = this.state;
    return (
      <div>
        <p style={this.props.small ? { fontSize: 20 } : { fontSize: 32 }}>{hours} : {minutes} : {seconds}</p>
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

class TimeField extends React.Component {
  constructor(props) {
    super(props);
    const { start, end, hourDifference } = props;
    const startTime = start || moment();
    const endTime = end || moment(startTime).add(hourDifference || 6, "hours");
    this.state = {
      editMode: false,
      startTime,
      endTime
    };
    this.containerRef = React.createRef();
    this.inputRef = React.createRef();
  }

  componentDidMount = () => document.addEventListener("mouseup", this._toggleEditMode);

  componentWillUnmount = () => document.removeEventListener("mouseup", this._toggleEditMode);

  static getDerivedStateFromProps(props, state) {
    const { startTime, endTime } = props;
    return {
      startTime: startTime || state.startTime,
      endTime: endTime || state.endTime
    };
  }

  render() {
    const { startTime, endTime } = this.state;
    return (
      <div ref={this.containerRef} onClick={this._toggleEditMode} style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex" }}>
          {this._renderHour(startTime.format("hh"), true)} : {this._renderMinute(startTime.format("mm"), true)} {this._renderAmPm(startTime.format("a"))}
        </div>
        -
        <div style={{ display: "flex" }}>
          {this._renderHour(endTime.format("hh"))} : {this._renderMinute(endTime.format("mm"))} {this._renderAmPm(endTime.format("a"))}
        </div>
      </div>
    );
  }

  _renderHour(text, isStartTime=false) {
    const { editMode } = this.state;
    if (editMode) {
      return this._renderInput(text, e => this._onHourChange(e, isStartTime));
    } else {
      return <p style={{ margin: 0 }}>{text}</p>;
    }
  }

  _renderMinute(text, isStartTime=false) {
    const { editMode } = this.state;
    if (editMode) {
      return this._renderInput(text, e => this._onMinuteChange(e, isStartTime));
    } else {
      return <p style={{ margin: 0 }}>{text}</p>;
    }
  }

  _renderInput = (value, onChange) => <input ref={this.inputRef} type="text" style={{ width: 30 }} value={value} onChange={onChange} />;

  _renderAmPm() {
    return (
      <select>
        <option selected value="am">AM</option>
        <option value="pm">PM</option>
      </select>
    );
  }

  _toggleEditMode = e => {
    // Outside click
    if (this.containerRef && !this.containerRef.current.contains(e.target)) {
      return this.setState({ editMode: false });
    } else {
      this.setState({ editMode: true });
    }
  }

  _onHourChange = (e, isStartTime) => {
    const { onStartChange, onEndChange } = this.props;
    const { minute } = this.state;
    const hour = e.target.value;
    if (isStartTime) {
      onStartChange({ hour, minute });
    } else {
      onEndChange({ hour, minute });
    }
  }

  _onMinuteChange = (e, isStartTime) => {
    const { onStartChange, onEndChange } = this.props;
    const { hour } = this.state;
    const minute = e.target.value;
    if (isStartTime) {
      onStartChange({ hour, minute });
    } else {
      onEndChange({ hour, minute });
    }
  }
}

const TimeBlocks = ({ blocks }) => {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
      {blocks.map(block => (
        <div style={{ width: 15, height: 15, marginRight: 2, marginBottom: 2, backgroundColor: block.completed ? "green" : "gray", borderRadius: 2 }} />
      ))}
    </div>
  );
};

const BlockProgress = ({ progressPercent, marks }) => (
  <div style={{ position: "relative", width: "100%", height: 20, backgroundColor: "gray", borderRadius: 7, overflow: "hidden" }}>
    <div style={{ width: `${progressPercent}%`, backgroundColor: "green", height: "100%" }} />
    {marks && marks.map(mark => (
      <div style={{ position: "absolute", left: `${mark}%`, height: "100%", width: 2, top: 0, backgroundColor: "red" }} />  
    ))}
  </div>
);

export default class Home extends React.Component {
  state = {
    hours: 1,
    minutes: 0,
    seconds: 0,
    running: false,
    isDistracted: false,
    dHours: 0,
    dMinutes: 0,
    dSeconds: 0,
    distractions: [],
    workdayStartTime: null,
    workdayEndTime: null
  };

  render() {
    const { isDistracted, running, workdayStartTime, workdayEndTime, hours, minutes, seconds, distractions } = this.state;
    const blocks = [];
    let numBlocks = moment.duration(moment(workdayEndTime).diff(workdayStartTime)).asHours()
    while (numBlocks >= 0) {
      blocks.push({ completed: false });
      numBlocks--;
    }
    const IS_DISTRACTION_TIMER = false;
    return (
      <div style={{ display: "flex", flexDirection: "column", width: 300 }}>
        <p>Workday Duration</p>
        <TimeField
          startTime={workdayStartTime}
          endTime={workdayEndTime}
          onStartChange={this._onStartTimeChange}
          onEndChange={this._onEndTimeChange}
          hourDifference={6}
        />
        <TimeBlocks blocks={blocks} />
        <Timer
          hours={1}
          minutes={0}
          seconds={0}
          running={running}
          paused={isDistracted}
          onTick={(hours, minutes, seconds) => this.setState({ hours, minutes, seconds })}
          onModify={this._onTimerModify}
          onFinish={this._onTimerFinish}
        />
        <BlockProgress
          progressPercent={100 - (hours * 60 + minutes + (seconds/60.0))/60.0 * 100}
          marks={distractions.map(d => 100 - (d.hours * 60 + d.minutes + (d.seconds/60.0))/60.0 * 100 )}
        />
        <button onClick={this._toggleTimer}>
          {running || isDistracted ? "Cancel" : "Start"}
        </button>
        {isDistracted && (
            <Timer
              hours={0}
              minutes={0}
              seconds={0}
              isCountUp
              small
              onTick={(dHours, dMinutes, dSeconds) => this.setState({ dHours, dMinutes, dSeconds })}
              running={isDistracted}
              onFinish={this._onDistractionFinish}
            />
        )}
        {IS_DISTRACTION_TIMER ? (
            <button
              disabled={!running && !isDistracted}
              onClick={isDistracted ? this._onDistractionFinish : this._onDistractionStart}
            >
              {isDistracted ? "Stop Distraction" : "Distracted"}
            </button>
          ) : (
            <button
              disabled={!running && !isDistracted}
              onClick={this._onLogDistraction}
            >
              Log Distraction
            </button>
          )
        }
        {this._renderDistractions()}
      </div>
    );
  }

  _renderDistractions = () => (
    <div style={{ fontSize: 16 }}>
      <p style={{ fontSize: 22 }}>Distractions</p>
      {this.state.distractions.length === 0 && <p>No distractions</p>}
      {this.state.distractions.map(({ elapsedHours, elapsedMinutes, elapsedSeconds, createdAt }) => (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <p>At {moment(createdAt).format('hh:mm:ss')}</p>
          <p>{elapsedHours} : {elapsedMinutes} : {elapsedSeconds}</p>
        </div>
      ))}
    </div>
  );

  _onTimerModify = ({ hours, minutes, seconds }) => this.setState({ hours, minutes, seconds });

  _onTimerFinish = () => this._logTimeBlock();

  _toggleTimer = () => {
    const { running, isDistracted, distractions } = this.state;
    if (!isDistracted) {
      this.setState({ running: !running, distractions: !running ? [] : distractions });
      if (!running) {
        this._logTimeBlock();
      }
    } else {
      this.setState({ running: false, isDistracted: false });
    }
  }

  _onLogDistraction = () => this.setState({
    distractions: [
      {
        createdAt: moment().toISOString(),
        hours: this.state.hours,
        minutes: this.state.minutes,
        seconds: this.state.seconds,
        elapsedHours: 0,
        elapsedMinutes: 0,
        elapsedSeconds: 0
      },
      ...this.state.distractions
    ]
  });

  _onDistractionStart = () => this.setState({ running: false, isDistracted: true });

  _onDistractionFinish = () => {
    const { dHours, dMinutes, dSeconds } = this.state;
    this._logDistraction(dHours, dMinutes, dSeconds);
    this._resetDistraction();
    this.setState({ running: true });
  };

  _resetDistraction = () => this.setState({ dHours: 0, dMinutes: 0, dSeconds: 0, isDistracted: false });

  _logDistraction = (hours, minutes, seconds) => {
    const { distractions } = this.state;
    const newDistraction = {
      createdAt: moment().toISOString(),
      hours,
      minutes,
      seconds,
      elapsedHours: hours,
      elapsedMinutes: minutes,
      elapsedSeconds: seconds
    };
    this.setState({ distractions: [newDistraction, ...distractions] });
    this._logTimeBlock();
  };

  _logTimeBlock = () => {
    const { hours, minutes, seconds } = this.state;
    const block = {
      hours,
      minutes,
      seconds,
      createdAt: moment().toISOString(),
      distractions: this.state.distractions
    };
    logTimeBlock(block);
  };

  _onStartTimeChange = workdayStartTime => this.setState({ workdayStartTime });

  _onEndTimeChange = workdayEndTime => this.setState({ workdayEndTime });
}
