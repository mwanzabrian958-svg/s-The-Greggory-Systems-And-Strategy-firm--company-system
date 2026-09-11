const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { createNotification } = require('../utils/notificationHelper');
const { validate, projectSchema } = require('../validators');
const { success, error } = require('../utils/responseHelper');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT *
      FROM user_projects
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `);

    return success(res, { data: rows });
  } catch (error) {
    console.error('Error fetching user projects:', error);
    return error(res, 'Failed to fetch user projects');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db
      .promise()
      .query('SELECT * FROM user_projects WHERE id = ? AND deleted_at IS NULL', [id]);

    if (rows.length === 0) {
      return error(res, 'Project not found', 404);
    }

    return success(res, { data: rows[0] });
  } catch (error) {
    console.error('Error fetching user project:', error);
    return error(res, 'Failed to fetch user project');
  }
});

router.post('/', validate(projectSchema), async (req, res) => {
  try {
    const {
      user_id,
      project_name,
      project_description,
      project_type,
      status,
      priority,
      start_date,
      end_date,
      estimated_budget,
      actual_budget,
      client_id,
      client_name,
      client_email,
      client_phone,
      client_id_number,
      project_manager_id,
      team_members,
      deliverables,
      milestones,
      documents,
      progress_percentage,
      notes,
    } = req.body;

    const [result] = await db.promise().query(
      `INSERT INTO user_projects (
        user_id, project_name, project_description, project_type, status,
        priority, start_date, end_date, estimated_budget, actual_budget,
        client_id, client_name, client_email, client_phone, client_id_number,
        project_manager_id, team_members, deliverables, milestones, documents,
        progress_percentage, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        project_name,
        project_description || null,
        project_type || 'consulting',
        status || 'planning',
        priority || 'medium',
        start_date || null,
        end_date || null,
        estimated_budget || 0,
        actual_budget || 0,
        client_id || null,
        client_name || null,
        client_email || null,
        client_phone || null,
        client_id_number || null,
        project_manager_id || null,
        team_members ? JSON.stringify(team_members) : null,
        deliverables ? JSON.stringify(deliverables) : null,
        milestones ? JSON.stringify(milestones) : null,
        documents ? JSON.stringify(documents) : null,
        progress_percentage || 0,
        notes || null,
        req.body.created_by || user_id,
      ],
    );

    // REAL-LIFE NOTIF: Notify user of new project assignment
    await createNotification(
      user_id,
      'project_update',
      'Mission Deployment',
      `New project initialized: ${project_name}`,
      'high',
    );

    return success(res, { message: 'Project created successfully', id: result.insertId }, 201);
  } catch (error) {
    console.error('Error creating user project:', error);
    return error(res, 'Failed to create user project');
  }
});

router.put('/:id', validate(projectSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      project_name,
      project_description,
      project_type,
      status,
      priority,
      start_date,
      end_date,
      estimated_budget,
      actual_budget,
      client_id,
      client_name,
      client_email,
      client_phone,
      client_id_number,
      project_manager_id,
      team_members,
      deliverables,
      milestones,
      documents,
      progress_percentage,
      notes,
    } = req.body;

    const [result] = await db.promise().query(
      `UPDATE user_projects
       SET project_name = ?, project_description = ?, project_type = ?, status = ?,
           priority = ?, start_date = ?, end_date = ?, estimated_budget = ?,
           actual_budget = ?, client_id = ?, client_name = ?, client_email = ?,
           client_phone = ?, client_id_number = ?, project_manager_id = ?,
           team_members = ?, deliverables = ?, milestones = ?, documents = ?,
           progress_percentage = ?, notes = ?, updated_at = NOW(), updated_by = ?
       WHERE id = ? AND deleted_at IS NULL`,
      [
        project_name,
        project_description || null,
        project_type || 'consulting',
        status || 'planning',
        priority || 'medium',
        start_date || null,
        end_date || null,
        estimated_budget || 0,
        actual_budget || 0,
        client_id || null,
        client_name || null,
        client_email || null,
        client_phone || null,
        client_id_number || null,
        project_manager_id || null,
        team_members ? JSON.stringify(team_members) : null,
        deliverables ? JSON.stringify(deliverables) : null,
        milestones ? JSON.stringify(milestones) : null,
        documents ? JSON.stringify(documents) : null,
        progress_percentage || 0,
        notes || null,
        req.body.updated_by || 1,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      return error(res, 'Project not found', 404);
    }

    // REAL-LIFE NOTIF: Notify user of project parameters change
    // We fetch the user_id for this project first
    const [proj] = await db.promise().query('SELECT user_id FROM user_projects WHERE id = ?', [id]);
    if (proj.length > 0) {
      await createNotification(
        proj[0].user_id,
        'project_update',
        'Mission Parameters Shift',
        `Tactical parameters for ${project_name} have been synchronized.`,
        'normal',
      );
    }

    return success(res, { message: 'Project updated successfully' });
  } catch (error) {
    console.error('Error updating user project:', error);
    return error(res, 'Failed to update user project');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db
      .promise()
      .query(
        'UPDATE user_projects SET deleted_at = NOW(), deleted_by = ? WHERE id = ? AND deleted_at IS NULL',
        [req.body.deleted_by || 1, id],
      );

    if (result.affectedRows === 0) {
      return error(res, 'Project not found', 404);
    }

    return success(res, { message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting user project:', error);
    return error(res, 'Failed to delete user project');
  }
});

module.exports = router;
