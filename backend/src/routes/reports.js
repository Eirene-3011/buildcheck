const express = require('express');
const pool = require('../config/db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired);

router.get('/:projectId', async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { from, to, status } = req.query;

    const [proj] = await pool.query('SELECT * FROM projects WHERE id = ? LIMIT 1', [projectId]);
    if (!proj[0]) return res.status(404).json({ error: 'Project not found' });

    const filters = ['i.project_id = ?'];
    const params = [projectId];
    if (from) { filters.push('i.inspection_datetime >= ?'); params.push(from); }
    if (to)   { filters.push('i.inspection_datetime <= ?'); params.push(to); }
    if (status) { filters.push('i.status = ?'); params.push(status); }

    const [inspections] = await pool.query(
      `SELECT i.*, u.name AS inspector_name
       FROM inspections i
       JOIN users u ON u.id = i.inspector_id
       WHERE ${filters.join(' AND ')}
       ORDER BY i.inspection_datetime DESC`,
      params
    );

    const ids = inspections.map((r) => r.id);
    const empty = { activities: [], manpower: [], equipment: [], safety_general: [], safety_risk: [], environmental: [], photos: [], violations: [] };

    let related = empty;
    if (ids.length) {
      const [[acts], [mps], [eqs], [sgs], [srs], [envs], [phs], [vis]] = await Promise.all([
        pool.query('SELECT * FROM activities      WHERE inspection_id IN (?)', [ids]),
        pool.query('SELECT * FROM manpower        WHERE inspection_id IN (?)', [ids]),
        pool.query('SELECT * FROM equipment       WHERE inspection_id IN (?)', [ids]),
        pool.query('SELECT * FROM safety_general  WHERE inspection_id IN (?)', [ids]),
        pool.query('SELECT * FROM safety_risk     WHERE inspection_id IN (?)', [ids]),
        pool.query('SELECT * FROM environmental   WHERE inspection_id IN (?)', [ids]),
        pool.query('SELECT * FROM photos          WHERE inspection_id IN (?)', [ids]),
        pool.query('SELECT * FROM violations      WHERE inspection_id IN (?)', [ids]),
      ]);
      related = {
        activities: acts, manpower: mps, equipment: eqs,
        safety_general: sgs, safety_risk: srs, environmental: envs,
        photos: phs, violations: vis,
      };
    }

    const groupBy = (rows, key) => {
      const map = {};
      for (const r of rows) (map[r[key]] = map[r[key]] || []).push(r);
      return map;
    };

    const enriched = inspections.map((insp) => ({
      ...insp,
      activities:     (related.activities    .filter((r) => r.inspection_id === insp.id)),
      manpower:       (related.manpower      .filter((r) => r.inspection_id === insp.id)),
      equipment:      (related.equipment     .filter((r) => r.inspection_id === insp.id)),
      safety_general: (related.safety_general.filter((r) => r.inspection_id === insp.id)),
      safety_risk:    (related.safety_risk   .filter((r) => r.inspection_id === insp.id)),
      environmental:  (related.environmental .filter((r) => r.inspection_id === insp.id)),
      photos:         (related.photos        .filter((r) => r.inspection_id === insp.id)),
      violations:     (related.violations    .filter((r) => r.inspection_id === insp.id)),
    }));

    const summary = {
      total_inspections: inspections.length,
      by_status: groupBy(inspections, 'status'),
      weather_summary: groupBy(inspections, 'weather'),
      compliance_summary: groupBy(inspections, 'compliance_status'),
      total_violations: related.violations.length,
      acknowledged_violations: related.violations.filter((v) => v.acknowledged).length,
    };

    res.json({ project: proj[0], summary, inspections: enriched });
  } catch (err) {
    next(err);
  }
});

/* ------------------------------------------------------------------ */
/*  DELETE /:projectId — permanently delete a project and all its     */
/*  associated inspection records (cascade)                           */
/* ------------------------------------------------------------------ */
router.delete('/:projectId', async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { projectId } = req.params;

    // Verify project exists
    const [proj] = await conn.query('SELECT id FROM projects WHERE id = ? LIMIT 1', [projectId]);
    if (!proj[0]) return res.status(404).json({ error: 'Project not found' });

    await conn.beginTransaction();

    // Get all inspection IDs belonging to this project
    const [inspRows] = await conn.query('SELECT id FROM inspections WHERE project_id = ?', [projectId]);
    const inspIds = inspRows.map((r) => r.id);

    // Delete all child records for every inspection
    if (inspIds.length) {
      const tables = ['activities', 'manpower', 'equipment', 'safety_general', 'safety_risk', 'environmental', 'photos', 'violations'];
      for (const tbl of tables) {
        await conn.query(`DELETE FROM ${tbl} WHERE inspection_id IN (?)`, [inspIds]);
      }
      // Delete inspections themselves
      await conn.query('DELETE FROM inspections WHERE project_id = ?', [projectId]);
    }

    // Finally delete the project
    await conn.query('DELETE FROM projects WHERE id = ?', [projectId]);

    await conn.commit();
    res.json({ success: true, message: 'Project and all associated records permanently deleted.' });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

module.exports = router;