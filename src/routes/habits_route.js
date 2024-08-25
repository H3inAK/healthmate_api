const express = require("express");

const Habit = require("../models/habit_model");
const HttpStatusCodes = require("../utils/http_status_codes");

const habitsRouter = express.Router();

habitsRouter.get("/", async (req, res) => {
    try {
        const habits = await Habit.find().sort({ createdAt: -1 }).select('-__v');
        res.status(HttpStatusCodes.OK).json({
            status: 'success',
            results: habits.length,
            data: {
                habits
            }
        });
    } catch (err) {
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            status: 'fail',
            message: err.message
        });
    }
});

habitsRouter.post("/", async (req, res) => {
    const habitsData = req.body.habits;

    if (!Array.isArray(habitsData) || habitsData.length === 0) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
            status: 'fail',
            message: 'Habits data should be a non-empty array'
        });
    }

    try {
        const createdHabits = await Habit.insertMany(habitsData);
        res.status(HttpStatusCodes.CREATED).json({
            status: 'success',
            results: createdHabits.length,
            data: {
                habits: createdHabits
            }
        });
    } catch (err) {
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            status: 'fail',
            message: err.message
        });
    }
});

habitsRouter.put("/", async (req, res) => {
    const newHabitsData = req.body.habits;

    if (!Array.isArray(newHabitsData) || newHabitsData.length === 0) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
            status: 'fail',
            message: 'Habits data should be a non-empty array'
        });
    }

    try {
        // Start a session for transaction
        const session = await Habit.startSession();
        session.startTransaction();

        // Delete all existing habits
        await Habit.deleteMany({}, { session });

        // Insert new habits
        const createdHabits = await Habit.insertMany(newHabitsData, { session });

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        res.status(HttpStatusCodes.OK).json({
            status: 'success',
            results: createdHabits.length,
            data: {
                habits: createdHabits
            }
        });
    } catch (err) {
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            status: 'fail',
            message: err.message
        });
    }
});


module.exports = habitsRouter;
