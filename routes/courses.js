'use strict';

const express = require('express');
// Array of users and courses:
const { Courses, Users } = require('./models').Course;
// Router instance:
const router = express.Router();
// Middlewares:
const asyncHandler = require('../middleware/async-handler');

//Courses routes:
// Get all Courses route:
router.get('/courses', asyncHandler(async (req, res) => {
    const courses = await Courses.findAll({
        include: [{
            model: Users,
        }]
    });
    res.json(courses);
    res.status(200).end();
}))

// Get route to a certain course:
router.get('/courses/:id', asyncHandler(async (req, res) => {
    const courses = await Courses.findByPk(req.params.id);
    res.json(courses);
    res.status(200).end();
}))

// Post route to add a course:
router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {
    let course;
    try {
        course = await Courses.create(req.body);
        res.status(201).location(`/courses/${course.id}`).end();
    } catch (error) {
        if(error.name === "SequelizeValidationError") {
            const errors = error.errors.map(error => error.message);
            res.status(400).json({errors});
        } else {
            throw error;
        } 
    }
}));

// Put route to update a course:
router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
    let course;
    try {
        const currentUser = req.currentUser;
        course = await Courses.findByPk(req.params.id);

        if (course.userId === currentUser.id) {
            await course.update(req.body);
            res.status(204).end();
        } else {
            res.status(403).json({message: "Not authorized operation."}).end();
        }
    } catch(error) {
        if(error.name === "SequelizeValidationError") {
            console.log(error);
            res.json({
                message: "The course could not be updated."
            });
            res.status(400).end()
        } else {
            console.log(error);
            throw error;
        }
    }
}));

// Delete route to delete a course:
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
    const currentUser = req.currentUser;
    const course = await Courses.findByPk(req.params.id);

    if (course.userId === currentUser.id) {
        await course.destroy();
        res.status(204).end();
    } else {
        res.status(403).json({ message: "Not authorized operation."}).end();
    }
}));

module.exports = router;