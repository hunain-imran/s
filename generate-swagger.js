const swaggerAutogen = require('swagger-autogen')();
const outputFile = './swagger-output.json';
const endpointsFiles = ['./users.js'];


swaggerAutogen(outputFile, endpointsFiles).then(() => {
  require('./a.js'); 
});