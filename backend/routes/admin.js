// Admin Management Routes
// Handles admin and user management from separate tables

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { formatActivityLog } = require('../utils/activityLogFormatter');
// =============================================
// GET DASHBOARD STATS
// =============================================
router.get('/dashboard-stats', async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalProjects,
      activeProjects,
      pendingTasks,
      totalInvoices,
      unpaidInvoices,
      recentActivity,
    ] = await Promise.all([
      db.promise().query('SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL'),
      db
        .promise()
        .query('SELECT COUNT(*) as count FROM users WHERE is_active = true AND deleted_at IS NULL'),
      db.promise().query('SELECT COUNT(*) as count FROM user_projects WHERE deleted_at IS NULL'),
      db
        .promise()
        .query(
          'SELECT COUNT(*) as count FROM user_projects WHERE status NOT IN ("completed", "cancelled") AND deleted_at IS NULL',
        ),
      db.promise().query('SELECT COUNT(*) as count FROM notifications WHERE status = "unread"'),
      db.promise().query('SELECT COUNT(*) as count FROM project_invoices WHERE deleted_at IS NULL'),
      db
        .promise()
        .query(
          'SELECT COUNT(*) as count FROM project_invoices WHERE status = "unpaid" AND deleted_at IS NULL',
        ),
      db.promise().query(
        `SELECT aal.id, aal.action_type, aal.action_description, aal.created_at,
                  u.display_name, u.email as admin_email
           FROM admin_activity_logs aal
           LEFT JOIN users u ON aal.admin_user_id = u.id
           ORDER BY aal.created_at DESC
           LIMIT 10`,
      ),
    ]);

    const formatActivity = (rows) =>
      rows.map((row) => ({
        id: row.id,
        action: row.action_type,
        description: row.action_description,
        admin_name: row.display_name || 'System',
        admin_email: row.admin_email || null,
        timestamp: row.created_at,
      }));

    res.json({
      success: true,
      stats: {
        totalUsers: totalUsers[0].count,
        activeUsers: activeUsers[0].count,
        totalProjects: totalProjects[0].count,
        activeProjects: activeProjects[0].count,
        pendingTasks: pendingTasks[0].count,
        totalInvoices: totalInvoices[0].count,
        unpaidInvoices: unpaidInvoices[0].count,
      },
      recentActivity: formatActivity(recentActivity),
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message,
    });
  }
});

// =============================================
// GET ACTIVITY LOGS
// =============================================
router.get('/activity-logs', async (req, res) => {
  try {
    const [activityRows] = await db.promise().query(`
      SELECT
        aal.id,
        aal.action_type,
        aal.action_description,
        aal.affected_table,
        aal.affected_record_id,
        aal.created_at,
        aal.ip_address,
        u.first_name,
        u.last_name,
        u.display_name,
        u.email AS admin_email
      FROM admin_activity_logs aal
      LEFT JOIN users u ON aal.admin_user_id = u.id
      ORDER BY aal.created_at DESC
      LIMIT 200
    `);

    const activities = activityRows.map((row) => {
      const formatted = formatActivityLog(row);
      const actorName = [row.display_name, row.first_name, row.last_name].find(Boolean) || 'System';
      const activityLabel = formatted.type
        ? formatted.type.replace(/_/g, ' ').toLowerCase()
        : 'activity';

      return {
        id: formatted.id,
        activity: formatted.type,
        details: formatted.description,
        admin_name: actorName,
        admin_email: row.admin_email || null,
        ip_address: row.ip_address || 'N/A',
        timestamp: row.created_at,
        success: true,
        status: formatted.status,
        type: activityLabel,
        ...formatted,
      };
    });

    res.json(activities);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity logs',
      error: error.message,
    });
  }
});

// =============================================
// GET DASHBOARD DATA
// =============================================
router.get('/dashboard', async (req, res) => {
  try {
    // Get counts from necessary tables - PURGED DEVELOPERS
    const [adminCount] = await db
      .promise()
      .query(
        'SELECT COUNT(*) as count FROM admin_users WHERE is_active = 1 AND deleted_at IS NULL',
      );

    const [userCount] = await db
      .promise()
      .query('SELECT COUNT(*) as count FROM users WHERE is_active = 1 AND deleted_at IS NULL');

    const [verifiedCount] = await db.promise().query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE whatsapp_verified = 1 AND deleted_at IS NULL) +
        (SELECT COUNT(*) FROM admin_users WHERE whatsapp_verified = 1 AND deleted_at IS NULL) as count
    `);

    const [activeProjectsCount] = await db
      .promise()
      .query(
        "SELECT COUNT(*) as count FROM user_projects WHERE status IN ('in-progress', 'active') AND deleted_at IS NULL",
      );

    const [pendingApprovalsCount] = await db
      .promise()
      .query(
        "SELECT COUNT(*) as count FROM user_projects WHERE status IN ('planning', 'pending') AND deleted_at IS NULL",
      );

    const [liveUsersCount] = await db.promise().query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE last_active_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE) AND deleted_at IS NULL) +
        (SELECT COUNT(*) FROM admin_users WHERE last_active_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE) AND deleted_at IS NULL) +
        (SELECT COUNT(*) FROM developer_users WHERE last_active_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE) AND deleted_at IS NULL) as count
    `);

    // Get recent activity
    const [recentActivity] = await db.promise().query(`
      (SELECT 
        'admin_login' as type,
        display_name as user_name,
        last_login_at as timestamp,
        'Admin logged in' as description
       FROM admin_users 
       WHERE last_login_at IS NOT NULL
       ORDER BY last_login_at DESC 
       LIMIT 5)
      UNION ALL
      (SELECT 
        'user_login' as type,
        display_name as user_name,
        last_login_at as timestamp,
        'User logged in' as description
       FROM users 
       WHERE last_login_at IS NOT NULL
       ORDER BY last_login_at DESC
       LIMIT 5)
      ORDER BY timestamp DESC
      LIMIT 10
    `);

    const [relayActivity] = await db.promise().query(`
      SELECT
        action_type,
        action_description,
        created_at,
        affected_table,
        affected_record_id
      FROM admin_activity_logs
      WHERE action_type IN ('SMS_SENT', 'WHATSAPP_SENT', 'BULK_SMS_SENT', 'BULK_WHATSAPP_SENT')
      ORDER BY created_at DESC
      LIMIT 8
    `);

    const combinedActivity = [
      ...recentActivity.map((activity) => ({
        ...activity,
        action: activity.description || 'Activity',
        timestamp: activity.timestamp || new Date().toISOString(),
        source: 'system',
      })),
      ...relayActivity.map((activity) => ({
        id: `relay-${activity.created_at}`,
        action: `${activity.action_type.replace(/_/g, ' ')} · ${activity.action_description}`,
        timestamp: activity.created_at,
        source: 'relay',
        status: activity.action_description?.toLowerCase().includes('queued') ? 'queued' : 'sent',
      })),
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    res.json({
      success: true,
      dashboard: {
        userCounts: {
          admins: adminCount[0].count,
          users: userCount[0].count,
          verified: verifiedCount[0].count,
          live: liveUsersCount[0].count,
          total: adminCount[0].count + userCount[0].count,
          total_active_projects: activeProjectsCount[0].count,
        },
        pending_count: pendingApprovalsCount[0].count,
        recentActivity: combinedActivity,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message,
    });
  }
});

// =============================================
// GET BUDGET OVERVIEW (FIXED)
// =============================================
router.get('/budget-overview', async (req, res) => {
  try {
    const [pb] = await db
      .promise()
      .query(
        'SELECT COALESCE(SUM(actual_budget),0) as spent, COALESCE(SUM(estimated_budget),0) as planned FROM user_projects WHERE deleted_at IS NULL',
      );
    const [fn] = await db
      .promise()
      .query(
        "SELECT COALESCE(SUM(CASE WHEN entry_type IN ('income','invoice_payment') THEN amount ELSE 0 END),0) as revenue, COALESCE(SUM(CASE WHEN entry_type='expense' THEN amount ELSE 0 END),0) as expenses FROM accounting_entries WHERE deleted_at IS NULL AND payment_status='completed'",
      );
    const [ac] = await db
      .promise()
      .query(
        "SELECT COUNT(*) as count FROM user_projects WHERE status IN ('in-progress','active') AND deleted_at IS NULL",
      );
    const r = fn[0]?.revenue || 0;
    const e = fn[0]?.expenses || 0;
    const p = pb[0]?.planned || 0;
    res.json({
      success: true,
      data: {
        planned: p,
        spent: e,
        forecast: e > 0 ? e * 1.1 : 0,
        revenue: r,
        expenses: e,
        net_income: r - e,
        active_projects: ac[0]?.count || 0,
        remaining: Math.max(0, p - e),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Budget overview failed' });
  }
});

// =============================================
// GET PENDING APPROVALS
// =============================================
router.get('/pending-approvals', async (req, res) => {
  try {
    // Get pending approvals from the new user_projects table
    const [approvals] = await db.promise().query(`
      SELECT 
        'project' as type,
        project_name as name,
        created_at as date,
        priority,
        id
      FROM user_projects
      WHERE status = 'planning' AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: approvals.map((a) => ({
        id: a.id,
        type: a.type,
        name: a.name,
        priority: a.priority,
        date: a.date,
      })),
    });
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending approvals',
      error: error.message,
    });
  }
});

// =============================================
// GET PENDING INVOICES
// =============================================
router.get('/pending-invoices', async (req, res) => {
  try {
    // Get pending invoices from the invoices table
    const [invoices] = await db.promise().query(`
      SELECT 
        i.id,
        i.title as project,
        i.total_amount_kes as amount,
        i.created_at as date
      FROM invoices i
      WHERE i.status != 'paid' AND i.deleted_at IS NULL
      ORDER BY i.created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: invoices.map((inv) => ({
        id: inv.id,
        project: inv.project || 'Invoice',
        amount: inv.amount,
        date: inv.date,
      })),
    });
  } catch (error) {
    console.error('Error fetching pending invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending invoices',
      error: error.message,
    });
  }
});

// =============================================
// GET CLIENT FEEDBACK
// =============================================
router.get('/client-feedback', async (req, res) => {
  try {
    // Get client feedback with user details
    const [feedback] = await db.promise().query(`
      SELECT 
        uf.id,
        uf.feedback_type as type,
        uf.rating,
        uf.created_at as date,
        u.display_name as user_name,
        uf.title
      FROM user_feedback uf
      LEFT JOIN users u ON uf.user_id = u.id
      WHERE uf.deleted_at IS NULL
      ORDER BY uf.created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: feedback.map((f) => ({
        id: f.id,
        type: f.type || 'Client',
        rating: f.rating,
        date: f.date,
        user: f.user_name || 'Anonymous',
        title: f.title || 'Service Feedback',
      })),
    });
  } catch (error) {
    console.error('Error fetching client feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch client feedback',
      error: error.message,
    });
  }
});

// =============================================
// GET GENERAL LEDGER TELEMETRY
// =============================================
router.get('/ledger', async (req, res) => {
  try {
    const { client_id, project_id, team_member_id, start_date, end_date, type } = req.query;

    let query = `
      SELECT
        ae.*,
        p.project_name,
        u.display_name as client_name,
        cb.display_name as creator_name
      FROM accounting_entries ae
      LEFT JOIN user_projects p ON ae.project_id = p.id
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN users cb ON ae.created_by = cb.id
      WHERE ae.deleted_at IS NULL
    `;

    const params = [];

    if (client_id) {
      query += ' AND p.user_id = ?';
      params.push(client_id);
    }

    if (project_id) {
      query += ' AND ae.project_id = ?';
      params.push(project_id);
    }

    if (team_member_id) {
      query +=
        ' AND (ae.project_id IN (SELECT project_id FROM project_team_members WHERE user_id = ? AND removed_at IS NULL))';
      params.push(team_member_id);
    }

    if (start_date && end_date) {
      query += ' AND ae.transaction_date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    if (type && type !== 'all') {
      query += ' AND ae.entry_type = ?';
      params.push(type);
    }

    query += ' ORDER BY ae.transaction_date DESC, ae.created_at DESC LIMIT 500';

    const [entries] = await db.promise().query(query, params);

    // Metadata for filters
    const [clients] = await db
      .promise()
      .query('SELECT id, display_name as name FROM users WHERE deleted_at IS NULL');
    const [projects] = await db
      .promise()
      .query('SELECT id, project_name as name FROM user_projects WHERE deleted_at IS NULL');
    const [team] = await db
      .promise()
      .query(
        "SELECT id, display_name as name FROM users WHERE primary_role IN ('admin') AND deleted_at IS NULL",
      );

    res.json({
      success: true,
      entries,
      filters: {
        clients,
        projects,
        team,
      },
    });
  } catch (error) {
    console.error('Error fetching ledger:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =============================================
// GET RISK ALERTS
// =============================================
router.get('/risk-alerts', async (req, res) => {
  try {
    // Get real risk alerts based on budget overages
    const [budgetRisks] = await db.promise().query(`
      SELECT 
        'Budget overage' as title,
        CONCAT('Project \"', project_name, '\" exceeds 90% of allocated budget') as description,
        'high' as level,
        id
      FROM user_projects
      WHERE actual_budget > estimated_budget * 0.9 AND deleted_at IS NULL
    `);

    // Get real risks based on overdue tasks
    const [taskRisks] = await db.promise().query(`
      SELECT
        'Overdue Task' as title,
        CONCAT('Task \"', task_name, '\" is past due date') as description,
        'medium' as level,
        id
      FROM project_tasks
      WHERE due_date < NOW() AND status != 'completed' AND deleted_at IS NULL
    `);

    const allRisks = [...budgetRisks, ...taskRisks];

    res.json({
      success: true,
      data: allRisks.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        level: r.level,
      })),
    });
  } catch (error) {
    console.error('Error fetching risk alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch risk alerts',
      error: error.message,
    });
  }
});

// =============================================
// GET ASSIGNED TASKS - PURGED
// =============================================
router.get('/assigned-tasks', async (req, res) => {
  res.json({ success: true, data: [] });
});

// =============================================
// CRM TELEMETRY
// =============================================
router.get('/crm-telemetry', async (req, res) => {
  try {
    const [clients] = await db.promise().query(`
      SELECT
        u.id, u.display_name as name, u.email,
        COUNT(p.id) as projects,
        COALESCE(AVG(f.rating), 5.0) as satisfaction,
        'Active' as status
      FROM users u
      LEFT JOIN user_projects p ON u.id = p.user_id AND p.deleted_at IS NULL
      LEFT JOIN user_feedback f ON u.id = f.user_id AND f.deleted_at IS NULL
      WHERE u.deleted_at IS NULL
      GROUP BY u.id
      LIMIT 10
    `);

    const [opportunities] = await db.promise().query(`
      SELECT
        id, project_name as title, client_name as client,
        estimated_budget as value, 'Proposal' as stage,
        DATEDIFF(end_date, NOW()) as daysLeft
      FROM user_projects
      WHERE status = 'planning' AND deleted_at IS NULL
      LIMIT 5
    `);

    const [pipelineData] = await db.promise().query(`
      SELECT status, COUNT(*) as count
      FROM user_projects
      WHERE deleted_at IS NULL
      GROUP BY status
    `);

    const statusMap = {
      planning: { label: 'Planning', color: 'bg-blue-100 text-blue-700' },
      'in-progress': { label: 'Active', color: 'bg-green-100 text-green-700' },
      'on-hold': { label: 'On Hold', color: 'bg-amber-100 text-amber-700' },
      completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700' },
    };

    const pipeline = pipelineData.map((d) => ({
      stage: statusMap[d.status]?.label || d.status,
      count: d.count,
      color: statusMap[d.status]?.color || 'bg-slate-100 text-slate-700',
    }));

    res.json({
      success: true,
      clients,
      opportunities,
      pipeline,
    });
  } catch (error) {
    console.error('Error fetching CRM telemetry:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =============================================
// PROJECT REPORTS (POSTING AREA)
// =============================================
router.get('/projects/all', async (req, res) => {
  try {
    const [projects] = await db
      .promise()
      .query(
        'SELECT id, project_name FROM user_projects WHERE deleted_at IS NULL ORDER BY project_name ASC',
      );
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch projects' });
  }
});

router.post('/reports', async (req, res) => {
  try {
    const { project_id, title, summary, file_data, file_type, file_name, file_size, admin_id } =
      req.body;

    if (!project_id || !title || !file_data) {
      return res
        .status(400)
        .json({ success: false, message: 'Project, Title, and File are required' });
    }

    const buffer = Buffer.from(file_data.split(',')[1] || file_data, 'base64');

    const [result] = await db.promise().query(
      `
      INSERT INTO project_reports (
        project_id, title, summary, file_data, file_type, file_size,
        report_date, status, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), 'final', ?, NOW())
    `,
      [
        project_id,
        title,
        summary,
        buffer,
        file_type || 'application/pdf',
        file_size || 0,
        admin_id || 1,
      ],
    );

    res.status(201).json({
      success: true,
      message: 'Report published successfully to project node',
      reportId: result.insertId,
    });
  } catch (error) {
    console.error('Report Publication Error:', error);
    res.status(500).json({ success: false, message: 'Internal server failure during publication' });
  }
});

// =============================================
// ALERT RELAY (SYSTEM UPDATES WITH MEDIA)
// =============================================
router.post('/relay-alert', async (req, res) => {
  try {
    const {
      project_name,
      user_identity,
      title,
      message,
      media_data,
      media_type,
      media_name,
      priority,
    } = req.body;

    const [userRows] = await db
      .promise()
      .query('SELECT id FROM users WHERE email = ? OR display_name = ? LIMIT 1', [
        user_identity,
        user_identity,
      ]);

    if (userRows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Unique user identity not found in node' });
    }

    const userId = userRows[0].id;
    let buffer = null;
    if (media_data) {
      buffer = Buffer.from(media_data.split(',')[1] || media_data, 'base64');
    }

    const finalMessage = `[Project: ${project_name}] ${message}`;

    const [result] = await db.promise().query(
      `
      INSERT INTO notifications (
        user_id, notification_type, title, message, priority,
        attachment_data, attachment_type, attachment_name,
        created_at, status
      ) VALUES (?, 'system', ?, ?, ?, ?, ?, ?, NOW(), 'unread')
    `,
      [userId, title, finalMessage, priority || 'normal', buffer, media_type, media_name],
    );

    res.json({
      success: true,
      message: 'Strategic alert relayed successfully',
      id: result.insertId,
    });
  } catch (error) {
    console.error('Relay Error:', error);
    res.status(500).json({ success: false, message: 'Relay link failed' });
  }
});

// =============================================
// DELETE ROUTES
// =============================================
router.delete('/accounting/entries/:id', async (req, res) => {
  try {
    await db
      .promise()
      .query('UPDATE accounting_entries SET deleted_at = NOW() WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

router.delete('/invoices/:id', async (req, res) => {
  try {
    await db
      .promise()
      .query('UPDATE invoices SET deleted_at = NOW() WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

router.delete('/blog-articles/:id', async (req, res) => {
  try {
    await db
      .promise()
      .query('UPDATE blog_articles SET deleted_at = NOW() WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

module.exports = router;
