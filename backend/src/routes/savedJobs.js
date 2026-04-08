import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { pool } from "../config/db.js";

const router = express.Router();

const mapSavedJob = (row) => ({
  id: row.id,
  candidateId: row.candidate_id,
  jobId: row.job_id,
  jobTitle: row.job_title,
  companyName: row.company_name,
  location: row.location,
  salary: row.salary,
  status: "saved",
  savedAt: row.saved_at,
});

router.post("/", requireAuth, async (req, res) => {
    try {
        const { jobId } = req.body;
        const saveJobs= await pool.query(
            `INSERT INTO saved_jobs (candidate_id, job_post_id, saved_at)
            VALUES ($1, $2, NOW())
            RETURNING *`,
            [req.user.id, jobId]
        );
        return res.json([saveJobs.rows[0]]);
    } catch (error) {
        console.error("Error saving job:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/", requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                sj.id AS id,
                sj.candidate_id,
                sj.saved_at,
                jp.id AS job_id,
                jp.title AS job_title,
                jp.location,
                jp.salary,
                r.company_name
            FROM saved_jobs sj
            JOIN job_posts jp ON sj.job_post_id = jp.id
            JOIN recruiters r ON jp.recruiter_id = r.id
            WHERE sj.candidate_id = $1
            ORDER BY sj.saved_at DESC`, 
            [req.user.id]
        );
        return res.json(result.rows.map(mapSavedJob));
    } catch (error) {
        console.error("Error fetching saved jobs:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.delete("/:id", requireAuth, async (req, res) => {
    if (req.user.role !== "candidate") {
        return res.status(403).json({ message: "Only candidate accounts can delete applications" });
    }

    const { id } = req.params;
    const client = await pool.connect();

    try{
        await client.query("BEGIN");
        
        const result = await client.query(
            "DELETE FROM saved_jobs WHERE id = $1 AND candidate_id = $2",
            [id, req.user.id]
        );

        if (result.rowCount === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Application not found" });
        }

        await client.query("COMMIT");

        return res.status(204).send();
    }
    catch(error) {
        await client.query("ROLLBACK");
        return res.status(500).json({ message: "Failed to delete application", detail: error.message });
    }
    finally{
        client.release();
    }
});

export default router;