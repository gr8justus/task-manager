'use strict';

// Required modules
import express from 'express';
import './db/mongoose.js';
import { userRouter, taskRouter } from './component.js';

const app = express();

// Express setup
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

export { app };