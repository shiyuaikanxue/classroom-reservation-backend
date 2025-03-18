const schoolRoute = require("./schoolRoutes");
const studentRoute = require("./studentRoutes");
const activitiesRoute = require("./activityRoutes");
const classesRoute = require("./classRoutes");
const classroomRoute = require("./classroomRoutes");
const collegeRoute = require("./collegeRoutes");
const coursesRoute = require("./courseRoutes");
const favoritesRoute = require("./favoriteRoutes");
const majorRoute = require("./majorRoutes");
const notificationsRoute = require("./notificationRoutes");
const reservationRoute = require("./reservationRoutes");
const reviewsRoute = require("./reviewRoutes");
const schedulesRoute = require("./scheduleRoutes");
const teachersRoute = require("./teacherRoutes");
const usageRecordRoute = require("./usageRecordRoutes");
const appLoginRoutes = require("./appLoginRoutes");
const adminLoginRoutes = require("./adminLoginRoutes");
const adminRoute = require("./adminRoutes");
function registerRoutes(app) {
  app.use("/school", schoolRoute);
  app.use("/student", studentRoute);
  app.use("/activities", activitiesRoute);
  app.use("/classes", classesRoute);
  app.use("/classrooms", classroomRoute);
  app.use("/college", collegeRoute);
  app.use("/courses", coursesRoute);
  app.use("/favorites", favoritesRoute);
  app.use("/major", majorRoute);
  app.use("/notifications", notificationsRoute);
  app.use("/reservation", reservationRoute);
  app.use("/reviews", reviewsRoute);
  app.use("/schedules", schedulesRoute);
  app.use("/teachers", teachersRoute);
  app.use("/usageRecord", usageRecordRoute);
  app.use("/appLogin", appLoginRoutes);
  app.use("/adminLogin", adminLoginRoutes);
  app.use("/admin", adminRoute);
  // Add more routes as needed.
  console.log("Routes registered successfully.");
}

module.exports = registerRoutes;
