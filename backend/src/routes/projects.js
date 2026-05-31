const express = require('express');
const Joi = require('joi');

const pool = require('../config/db');
const { validate } = require('../utils/validate');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

const projectSchema = Joi.object({
  year: Joi.number().integer().min(2000).max(2100).required(),
  ref_number: Joi.string().min(1).max(40).required(),
  name: Joi.string().min(2).max(200).required(),
  location_id: Joi.number().integer().positive().required(),
  funding_source: Joi.string().min(2).max(160).required(),
  approved_budget: Joi.number().min(0).required(),
  contract_amount: Joi.number().min(0).required(),
  variation_orders: Joi.number().min(0).default(0),
  revised_contract_amount: Joi.number().min(0).required(),
  contractor: Joi.string().min(2).max(160).required(),
  person_in_charge: Joi.string().min(2).max(120).required(),
  mode_of_procurement: Joi.string().valid(
    'Public Bidding','Small Value Procurement','Shopping','Negotiated Procurement',
    'Direct Contracting','Repeat Order','Limited Source Bidding'
  ).required(),
  project_status: Joi.string().valid('Ongoing','Completed','Suspended','Terminated','Pending').default('Ongoing'),
  duration: Joi.string().min(1).max(80).required(),
  start_date: Joi.date().iso().required(),
  target_completion_date: Joi.date().iso().min(Joi.ref('start_date')).required(),
  revised_expiry_date: Joi.date().iso().min(Joi.ref('start_date')).required(),
});

router.use(authRequired);

router.post('/', validate(projectSchema), async (req, res, next) => {
  try {
    const p = req.body;
    const [result] = await pool.query(
      `INSERT INTO projects
        (year, ref_number, name, location_id, funding_source,
         approved_budget, contract_amount, variation_orders, revised_contract_amount,
         contractor, person_in_charge, mode_of_procurement, project_status,
         duration, start_date, target_completion_date, revised_expiry_date, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.year, p.ref_number, p.name, p.location_id, p.funding_source,
        p.approved_budget, p.contract_amount, p.variation_orders, p.revised_contract_amount,
        p.contractor, p.person_in_charge, p.mode_of_procurement, p.project_status || 'Ongoing',
        p.duration, p.start_date, p.target_completion_date, p.revised_expiry_date,
        req.user.id,
      ]
    );
    res.status(201).json({ id: result.insertId, ...p });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, u.name AS created_by_name, l.name AS location_name
       FROM projects p
       JOIN users u     ON u.id = p.created_by
       JOIN locations l ON l.id = p.location_id
       ORDER BY p.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Location lookup (pre-selection list for the Project Details form)
router.get('/lookup/locations', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, name FROM locations ORDER BY name');
    res.json(rows);
  } catch (err) { next(err); }
});

// Inspector lookup (pre-seeded roster from the spreadsheet "Inspectors" sheet)
router.get('/lookup/inspectors', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name FROM users WHERE role='inspector' ORDER BY name"
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, u.name AS created_by_name, l.name AS location_name
       FROM projects p
       JOIN users u     ON u.id = p.created_by
       JOIN locations l ON l.id = p.location_id
       WHERE p.id = ? LIMIT 1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Project not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
