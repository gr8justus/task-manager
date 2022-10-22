'use strict';

// Required modules
import express from 'express'
import { Task, auth } from '../component.js'

const taskRouter = express.Router();

// create / write into db
taskRouter.post('/tasks', auth, async (req, res) => {
    try {
        const task = new Task({
            ...req.body,
            owner: req.id
        });
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e.message)
    }
});

// read from db
taskRouter.get('/tasks', auth, async (req, res) => {
    try {
        const tasks = await Task.find({owner: req.id});
        res.send(tasks);
    } catch (e) {
        res.status(500).send()
    }
});

taskRouter.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOne({_id, owner: req.id});
        
        if (!task) {
            return res.status(404).send('Task with id: ' + _id + ' does not exist.')
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
});

// update db
taskRouter.patch('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

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
        const task = await Task.findOne({_id, owner: req.id});

        // task not found.
        if (!task) {
            res.status(404).send('error: No matching task with id: ' + _id + ' found for update!')
        }

        // Keys looped to be updated.
        updateKeys.forEach((update) => task[update] = req.body[update]);
        await task.save();

        // task overwritten
        res.send(task);
    } catch (e) {
        res.status(400).send(e.message);
    }
});

taskRouter.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const _id = req.params.id;
        const task = await Task.findOneAndDelete({_id, owner: req.id});

        if (!task) {
            res.status(404).send('No matching task with id: ' + _id + ' found for delete!');
        }

        res.send('Task successfully deleted!');
    } catch (e) {
        res.status(400).send(e.message);
    }
});

export { taskRouter };