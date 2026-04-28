const express = require('express');
const { z } = require('zod');
const db = require('../db');

const router = express.Router();

// CREATE TASK
router.post('/projects/:projectId/tasks', (req, res) => {
    try {
        const schema = z.object({
            title: z.string().min(1),
            description: z.string().optional(),
            status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
            priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
            dueDate: z.string().optional(),
        });

        const validated = schema.parse(req.body);

        db.run(
            `INSERT INTO tasks (title, description, status, priority, dueDate, projectId)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                validated.title,
                validated.description || null,
                validated.status || 'TODO',
                validated.priority || 'MEDIUM',
                validated.dueDate || null,
                req.params.projectId
            ],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });

                res.status(201).json({
                    id: this.lastID,
                    ...validated
                });
            }
        );

    } catch (error) {
        res.status(400).json({ error: error.errors });
    }
});

// GET TASKS (FILTER + SORT FIXED)
router.get('/projects/:projectId/tasks', (req, res) => {
    let { status, sort } = req.query;

    let query = `SELECT * FROM tasks WHERE projectId = ?`;
    let params = [req.params.projectId];

    if (status) {
        query += ` AND LOWER(status) = LOWER(?)`;
        params.push(status);
    }

    if (sort === 'dueDate') {
        query += ` ORDER BY dueDate ASC`;
    } else {
        query += ` ORDER BY id DESC`;
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json(rows);
    });
});

// UPDATE TASK
router.put('/tasks/:id', (req, res) => {
    const { title, description, status, priority, dueDate } = req.body;

    db.run(
        `UPDATE tasks SET title=?, description=?, status=?, priority=?, dueDate=? WHERE id=?`,
        [title, description, status, priority, dueDate, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            res.json({ message: 'Task updated successfully' });
        }
    );
});

// DELETE TASK
router.delete('/tasks/:id', (req, res) => {
    db.run(
        `DELETE FROM tasks WHERE id=?`,
        [req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            res.json({ message: 'Task deleted successfully' });
        }
    );
});

module.exports = router;