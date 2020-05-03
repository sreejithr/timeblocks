import moment from "moment";

export default class GoalUtils {
  static getTodaysBlockGoal(goal) {
    if (!goal) {
      return 0;
    }
    let parsedGoal = goal;
    if (goal.everyday) {
      parsedGoal = {
        ...parsedGoal,
        mon: goal.everyday,
        tue: goal.everyday,
        wed: goal.everyday,
        thu: goal.everyday,
        fri: goal.everyday,
        sat: goal.everyday,
        sun: goal.everyday
      };
    }
    if (goal.weekdays) {
      parsedGoal = {
        ...parsedGoal,
        mon: goal.everyday,
        tue: goal.everyday,
        wed: goal.everyday,
        thu: goal.everyday,
        fri: goal.everyday
      };
    }
    if (goal.weekends) {
      parsedGoal = {
        ...parsedGoal,
        sat: goal.everyday,
        sun: goal.everyday
      }
    }
    const parsedGoalBlocks = parseInt(parsedGoal[moment().format("ddd").toLowerCase()]);
    return isNaN(parsedGoalBlocks) ? 0 : parsedGoalBlocks;
  }
}
