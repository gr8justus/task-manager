'use strict';

// Required modules
import express from 'express';
import './db/mongoose.js';
import { userRouter, taskRouter } from './component.js';

const app = express();
const port = process.env.PORT || 3000;

// Express setup
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => console.log('Server is running on port ' + port));