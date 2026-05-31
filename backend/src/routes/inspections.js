const express = require('express');
const Joi = require('joi');

const pool = require('../config/db');
const { validate } = require('../utils/validate');
const { authRequired } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();
router.use(authRequired);

const inspectionSchema = Joi.object({
  project_id: Joi.number().integer().positive().required(),
  inspection_datetime: Joi.date().iso().required(),
  weather: Joi.string().required(),
  weather_other: Joi.string().allow('', null),
  site_cleanliness: Joi.string()
    .valid('Very Clean', 'Clean', 'Acceptable', 'Needs Improvement', 'Poor')
    .required(),
  compliance_status: Joi.string()
    .valid('Fully Compliant', 'Partially Compliant', 'Non-Compliant', 'Under Review')
    .required(),
  compliance_remarks: Joi.string().allow('', null),
  overall_assessment: Joi.string()
    .valid('Excellent', 'Good', 'Acceptable', 'Needs Immediate Attention', 'Unsafe Condition')
    .required(),
  status: Joi.string().valid('Completed', 'Pending', 'Overdue').default('Completed'),
  activities: Joi.array().items(Joi.string()).default([]),
  manpower: Joi.array()
    .items(Joi.object({ category: Joi.string().required(), count: Joi.number().integer().min(0).required() }))
    .default([]),
  equipment: Joi.array()
    .items(
      Joi.object({
        condition: Joi.string()
          .valid('Excellent', 'Good', 'Functional', 'Needs Maintenance', 'Under Repair', 'Out of Service')
          .required(),
        remarks: Joi.string().allow('', null),
      })
    )
    .default([]),
  safety_general: Joi.array()
    .items(
      Joi.object({
        item: Joi.string().required(),
        status: Joi.string().valid('Compliant', 'Partially Compliant', 'Non-Compliant').required(),
        remarks: Joi.string().allow('', null),
      })
    )
    .default([]),
  safety_risk: Joi.array()
    .items(
      Joi.object({
        risk_type: Joi.string().required(),
        risk_level: Joi.string().valid('Low', 'Moderate', 'High', 'Critical').required(),
        measures: Joi.string().allow('', null),
      })
    )
    .default([]),
  environmental: Joi.array()
    .items(
      Joi.object({
        item: Joi.string().required(),
        status: Joi.string().valid('Satisfactory', 'Needs Improvement', 'Unsatisfactory').required(),
        remarks: Joi.string().allow('', null),
      })
    )
    .default([]),
});

// Multipart-friendly: payload is sent as JSON string in field "payload"
function parsePayload(req, _res, next) {
  if (req.is('multipart/form-data') && typeof req.body.payload === 'string') {
    try {
      req.body = JSON.parse(req.body.payload);
    } catch (e) {
      const err = new Error('Invalid JSON in "payload" field');
      err.status = 400;
      return next(err);
    }
  }
  next();
}

router.post(
  '/',
  upload.array('photos', 10),
  parsePayload,
  validate(inspectionSchema),
  async (req, res, next) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const data = req.body;

      const [ins] = await conn.query(
        `INSERT INTO inspections
          (project_id, inspector_id, inspection_datetime, weather, weather_other,
           site_cleanliness, compliance_status, compliance_remarks, overall_assessment, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.project_id,
          req.user.id,
          new Date(data.inspection_datetime),
          data.weather,
          data.weather_other || null,
          data.site_cleanliness,
          data.compliance_status,
          data.compliance_remarks || null,
          data.overall_assessment,
          data.status || 'Completed',
        ]
      );
      const inspectionId = ins.insertId;

      const bulk = async (sql, rows) => {
        if (!rows.length) return;
        await conn.query(sql, [rows]);
      };

      await bulk(
        'INSERT INTO activities (inspection_id, activity_name) VALUES ?',
        data.activities.map((a) => [inspectionId, a])
      );
      await bulk(
        'INSERT INTO manpower (inspection_id, category, count) VALUES ?',
        data.manpower.map((m) => [inspectionId, m.category, m.count])
      );
      await bulk(
        'INSERT INTO equipment (inspection_id, `condition`, remarks) VALUES ?',
        data.equipment.map((e) => [inspectionId, e.condition, e.remarks || null])
      );
      await bulk(
        'INSERT INTO safety_general (inspection_id, item, status, remarks) VALUES ?',
        data.safety_general.map((s) => [inspectionId, s.item, s.status, s.remarks || null])
      );
      await bulk(
        'INSERT INTO safety_risk (inspection_id, risk_type, risk_level, measures) VALUES ?',
        data.safety_risk.map((s) => [inspectionId, s.risk_type, s.risk_level, s.measures || null])
      );
      await bulk(
        'INSERT INTO environmental (inspection_id, item, status, remarks) VALUES ?',
        data.environmental.map((s) => [inspectionId, s.item, s.status, s.remarks || null])
      );

      const files = req.files || [];
      if (files.length) {
        await conn.query(
          'INSERT INTO photos (inspection_id, file_path) VALUES ?',
          [files.map((f) => [inspectionId, `/uploads/${f.filename}`])]
        );
      }

      // Decision logic — flag whether violation handling is required
      const needsViolation =
        data.compliance_status === 'Non-Compliant' ||
        data.safety_general.some((s) => s.status === 'Non-Compliant') ||
        data.safety_risk.some((s) => ['High', 'Critical'].includes(s.risk_level)) ||
        data.overall_assessment === 'Unsafe Condition';

      await conn.commit();
      res.status(201).json({ id: inspectionId, requires_violation: needsViolation });
    } catch (err) {
      await conn.rollback();
      next(err);
    } finally {
      conn.release();
    }
  }
);

router.get('/:projectId', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT i.*, u.name AS inspector_name
       FROM inspections i
       JOIN users u ON u.id = i.inspector_id
       WHERE i.project_id = ?
       ORDER BY i.inspection_datetime DESC`,
      [req.params.projectId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/detail/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const [main] = await pool.query(
      `SELECT i.*, u.name AS inspector_name, p.name AS project_name
       FROM inspections i
       JOIN users u ON u.id = i.inspector_id
       JOIN projects p ON p.id = i.project_id
       WHERE i.id = ? LIMIT 1`,
      [id]
    );
    if (!main[0]) return res.status(404).json({ error: 'Inspection not found' });

    const [[activities], [manpower], [equipment], [safetyGen], [safetyRisk], [environmental], [photos], [violations]] =
      await Promise.all([
        pool.query('SELECT * FROM activities WHERE inspection_id = ?', [id]),
        pool.query('SELECT * FROM manpower WHERE inspection_id = ?', [id]),
        pool.query('SELECT * FROM equipment WHERE inspection_id = ?', [id]),
        pool.query('SELECT * FROM safety_general WHERE inspection_id = ?', [id]),
        pool.query('SELECT * FROM safety_risk WHERE inspection_id = ?', [id]),
        pool.query('SELECT * FROM environmental WHERE inspection_id = ?', [id]),
        pool.query('SELECT * FROM photos WHERE inspection_id = ?', [id]),
        pool.query('SELECT * FROM violations WHERE inspection_id = ?', [id]),
      ]);

    res.json({
      ...main[0],
      activities,
      manpower,
      equipment,
      safety_general: safetyGen,
      safety_risk: safetyRisk,
      environmental,
      photos,
      violations,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
