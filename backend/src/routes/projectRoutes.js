const express = require('express');
const { z } = require('zod');
const db = require('../db');

const router = express.Router();

// CREATE PROJECT
router.post('/', (req, res) => {
    try {
        const schema = z.object({
            name: z.string().min(1),
            description: z.string().optional(),
        });

        const validated = schema.parse(req.body);

        db.run(
            `INSERT INTO projects (name, description) VALUES (?, ?)`,
            [validated.name, validated.description || null],
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

// GET PROJECTS (PAGINATION FIXED)
router.get('/', (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let offset = (page - 1) * limit;

    db.all(
        `SELECT * FROM projects ORDER BY id DESC LIMIT ? OFFSET ?`,
        [limit, offset],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });

            db.get(`SELECT COUNT(*) as total FROM projects`, (err2, count) => {
                if (err2) return res.status(500).json({ error: err2.message });

                res.json({
                    page,
                    limit,
                    total: count.total,
                    totalPages: Math.ceil(count.total / limit),
                    projects: rows
                });
            });
        }
    );
});

// GET SINGLE PROJECT
router.get('/:id', (req, res) => {
    db.get(
        `SELECT * FROM projects WHERE id = ?`,
        [req.params.id],
        (err, project) => {
            if (err) return res.status(500).json({ error: err.message });

            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            db.all(
                `SELECT * FROM tasks WHERE projectId = ?`,
                [req.params.id],
                (taskErr, tasks) => {
                    if (taskErr) return res.status(500).json({ error: taskErr.message });

                    project.tasks = tasks;
                    res.json(project);
                }
            );
        }
    );
});

// DELETE PROJECT
router.delete('/:id', (req, res) => {
    db.run(
        `DELETE FROM projects WHERE id = ?`,
        [req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            db.run(`DELETE FROM tasks WHERE projectId = ?`, [req.params.id]);

            res.json({ message: 'Project and its tasks deleted successfully' });
        }
    );
});

module.exports = router;