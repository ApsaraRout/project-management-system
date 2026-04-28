router.get('/analytics', (req, res) => {
    const totalProjects = projects.length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "DONE").length;
    const pendingTasks = tasks.filter(t => t.status !== "DONE").length;

    res.json({
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks
    });
});