const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Classroom Reservation API",
      version: "1.0.0",
      description: "API for managing classroom reservations",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
  },
  apis: ["./routes/*.js"], // 指定路由文件路径
};

const specs = swaggerJsDoc(options);
fs.writeFileSync("swagger.json", JSON.stringify(specs, null, 2));
console.log("Swagger JSON 文件已生成: swagger.json");
module.exports = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
};
