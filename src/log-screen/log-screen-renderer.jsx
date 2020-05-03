import React from "react";
import moment from "moment";
import { View, Text, Dimensions } from "react-native";
import TimeBlocks from "../components/time-blocks";

export class LogScreenRenderer extends React.Component {
  render() {
    const { days, goal } = this.props;
    return (
      <View style={{
        display: "flex",
        flexDirection: "column",
        height: Dimensions.get("window").height - 60,
        overflow: "scroll",
        width: "100%",
        alignItems: "center",
        backgroundColor: "black",
        paddingBottom: 60
      }}>
        {days.map(day => (
          <View style={{ height: 70, borderBottom: "1px solid rgb(38,38,38)", paddingTop: 10, width: "100%", display: "flex", alignItems: "center" }}>
            <View style={{ maxWidth: 267 }}>
              <Text style={{ color: "white"}}>{moment(day.date).format("D MMMM YYYY")}</Text>
              <TimeBlocks earnedBlocks={day.blocks.filter(block => block.completed)} goal={goal} />
            </View>
          </View>
        ))}
      </View>
    );
  }
}
