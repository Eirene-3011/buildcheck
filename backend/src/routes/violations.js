const express = require('express');
const Joi = require('joi');

const pool = require('../config/db');
const { validate } = require('../utils/validate');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired);

const violationSchema = Joi.object({
  inspection_id: Joi.number().integer().positive().required(),
  description: Joi.string().min(3).required(),
  corrective_action: Joi.string().min(3).required(),
  contractor_remarks: Joi.string().allow('', null),
  acknowledged: Joi.boolean().default(false),
});

router.post('/', validate(violationSchema), async (req, res, next) => {
  try {
    const v = req.body;
    const [result] = await pool.query(
      `INSERT INTO violations
        (inspection_id, description, corrective_action, contractor_remarks, acknowledged, acknowledged_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        v.inspection_id,
        v.description,
        v.corrective_action,
        v.contractor_remarks || null,
        v.acknowledged ? 1 : 0,
        v.acknowledged ? new Date() : null,
      ]
    );
    res.status(201).json({ id: result.insertId, ...v });
  } catch (err) {
    next(err);
  }
});

router.get('/:inspectionId', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM violations WHERE inspection_id = ? ORDER BY created_at DESC',
      [req.params.inspectionId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/acknowledge', async (req, res, next) => {
  try {
    await pool.query(
      'UPDATE violations SET acknowledged = 1, acknowledged_at = NOW(), contractor_remarks = COALESCE(?, contractor_remarks) WHERE id = ?',
      [req.body.contractor_remarks || null, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
