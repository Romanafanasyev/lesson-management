const express = require('express');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
const lessonRoutes = require('./routes/lessonRoutes');
const errorHandler = require("./middleware/errorHandler");

dotenv.config();

const app = express();

app.use(express.json());
app.use('/api/lessons', lessonRoutes);
app.use(errorHandler);

module.exports = { app, sequelize };
