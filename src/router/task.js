'use strict';

// Required modules
import express from 'express'
import { Task } from '../component.js'

const taskRouter = express.Router();

// create / write into db
taskRouter.post('/tasks', async (req, res) => {
    const task = new Task(req.body)
    try {
        const save = await task.save()
        res.status(201).send(save)
    } catch (e) {
        res.status(400).send(e.message)
    }
});

// read from db
taskRouter.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find({})
        res.send(tasks)
    } catch (e) {
        res.status(500).send()
    }
});

taskRouter.get('/tasks/:id', async (req, res) => {
    const id = req.params.id
    try {
        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).send('Task with id: ' + id + ' does not exist.')
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
});

// update db
taskRouter.patch('/tasks/:id', async (req, res) => {
    const id = req.params.id;

    // checks id length.
    if (id.length < 24) {
        return res.status(400).send({
            error: 'id is not valid!',
            message: 'id should not be less than 24 characters.'
        })
    }

    // checks if update keys conforms to model's before overwriting
    const validKeys = ['description', 'completed'];
    const updateKeys = Object.keys(req.body);
    const validateKeys = updateKeys.every((key) => validKeys.includes(key));

    // update keys does not conform to model's
    if (!validateKeys) {
        return res.status(400).send({
            error: 'Invalid field(s) for update',
            fields: validKeys
        })
    }

    try {
        const task = await Task.findById(id);

        // Keys looped to be updated.
        updateKeys.forEach((update) => task[update] = req.body[update]);
        await task.save();

        // task not found.
        if (!task) {
            res.status(404).send('error: No matching task with id: ' + id + ' found for update!')
        }

        // task overwritten
        res.send(task);
    } catch (e) {
        res.status(400).send(e.message);
    }
});

taskRouter.delete('/tasks/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const task = await Task.findByIdAndDelete(id);

        if (!task) {
            res.status(404).send('No matching user with id: ' + id + ' found for delete!')
        }

        res.send(task)
    } catch (e) {
        res.status(400).send(e.message)
    }
});

export { taskRouter }