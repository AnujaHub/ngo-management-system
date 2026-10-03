const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : value;
}

function toNumber(value) {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function getNextId(tableName, columnName) {
  const result = await pool.query(`SELECT COALESCE(MAX(${columnName}), 0) + 1 AS next_id FROM ${tableName};`);
  return Number(result.rows[0].next_id);
}

async function donorExists(donorId) {
  if (donorId === null || donorId === undefined || donorId === '') return true;
  const result = await pool.query('SELECT 1 FROM donor WHERE donor_id = $1', [donorId]);
  return result.rowCount > 0;
}

async function projectExists(projectId) {
  if (projectId === null || projectId === undefined || projectId === '') return true;
  const result = await pool.query('SELECT 1 FROM project WHERE project_id = $1', [projectId]);
  return result.rowCount > 0;
}

function validateDonor(data) {
  if (!data.name || !String(data.name).trim()) return 'Donor name is required.';
  if (data.donor_type && !['Individual', 'Organization', 'NGO'].includes(data.donor_type)) {
    return "Donor type must be one of 'Individual', 'Organization', or 'NGO'.";
  }
  return null;
}

function validateVolunteer(data) {
  if (!data.name || !String(data.name).trim()) return 'Volunteer name is required.';
  if (data.phone && !/^[0-9+\-()\s]{7,15}$/.test(String(data.phone).trim())) {
    return 'Phone number format is invalid.';
  }
  return null;
}

function validateProject(data) {
  if (!data.project_name || !String(data.project_name).trim()) return 'Project name is required.';
  if (data.budget !== undefined && data.budget !== null && data.budget !== '' && Number(data.budget) < 0) {
    return 'Budget cannot be negative.';
  }
  return null;
}

function validateBeneficiary(data) {
  if (!data.name || !String(data.name).trim()) return 'Beneficiary name is required.';
  if (data.age !== undefined && data.age !== null && data.age !== '' && Number(data.age) < 0) {
    return 'Age cannot be negative.';
  }
  return null;
}

function validateDonation(data) {
  if (data.donor_id === undefined || data.donor_id === null || data.donor_id === '') {
    return 'Donor ID is required.';
  }
  if (data.amount === undefined || data.amount === null || data.amount === '' || Number(data.amount) <= 0) {
    return 'Amount must be greater than 0.';
  }
  return null;
}

async function validateDonationForeignKeys(data) {
  const donorCheck = await donorExists(data.donor_id);
  if (!donorCheck) return 'Donor does not exist.';

  if (data.project_id !== undefined && data.project_id !== null && data.project_id !== '') {
    const projectCheck = await projectExists(data.project_id);
    if (!projectCheck) return 'Project does not exist.';
  }

  return null;
}

function buildSearchQuery(baseQuery, params, filters) {
  const where = [];
  const values = [...params];

  filters.forEach((filter) => {
    const val = filter.value;
    if (val === undefined || val === null || val === '') return;

    if (filter.type === 'like') {
      where.push(`${filter.column} ILIKE $${values.length + 1}`);
      values.push(`%${String(val).trim()}%`);
    } else if (filter.type === 'equals') {
      where.push(`${filter.column} = $${values.length + 1}`);
      values.push(val);
    }
  });

  if (where.length > 0) {
    return { query: `${baseQuery} WHERE ${where.join(' AND ')}`, values };
  }

  return { query: baseQuery, values };
}

async function getTableColumns(tableName) {
  const result = await pool.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1;`,
    [tableName]
  );
  return new Set(result.rows.map((row) => row.column_name));
}

app.get('/api/health', (req, res) => {
  res.json({ message: 'NGO Management System backend is running' });
});

app.get('/api/dashboard', async (req, res) => {
  try {
    const queries = await Promise.all([
      pool.query('SELECT COUNT(*) AS total FROM donor;'),
      pool.query('SELECT COUNT(*) AS total FROM volunteer;'),
      pool.query('SELECT COUNT(*) AS total FROM project;'),
      pool.query('SELECT COUNT(*) AS total FROM beneficiary;'),
      pool.query('SELECT COUNT(*) AS total FROM donation;'),
      pool.query('SELECT COALESCE(SUM(amount), 0) AS total FROM donation;'),
    ]);

    res.json({
      donors: Number(queries[0].rows[0].total),
      volunteers: Number(queries[1].rows[0].total),
      projects: Number(queries[2].rows[0].total),
      beneficiaries: Number(queries[3].rows[0].total),
      donations: Number(queries[4].rows[0].total),
      totalDonation: Number(queries[5].rows[0].total),
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard summary.' });
  }
});

app.get('/api/analytics', async (req, res) => {
  try {
    const [projectColumns, donationColumns] = await Promise.all([
      getTableColumns('project'),
      getTableColumns('donation'),
    ]);

    const hasStatus = projectColumns.has('status');
    const hasProjectDates = projectColumns.has('start_date') && projectColumns.has('end_date');
    const hasPaymentMethod = donationColumns.has('payment_method');

    const projectStatusQuery = hasStatus
      ? `SELECT COALESCE(status, 'Unknown') AS status, COUNT(*) AS project_count
         FROM project GROUP BY status ORDER BY project_count DESC;`
      : `SELECT 'Active' AS status, COUNT(*) AS project_count FROM project;`;

    const activeProjectsQuery = `
      SELECT project_id, project_name, category, location, budget,
             ${hasProjectDates ? 'start_date, end_date,' : 'NULL AS start_date, NULL AS end_date,'}
             ${hasStatus ? "COALESCE(status, 'Unknown')" : "'Active'"} AS status
      FROM project
      ${hasStatus ? "WHERE status = 'Active'" : ''}
      ORDER BY project_id DESC;
    `;

    const recentDonationsQuery = `
      SELECT d.donation_id, donor.name AS donor_name, project.project_name,
             d.donation_date, d.amount,
             ${hasPaymentMethod ? 'd.payment_method' : 'NULL AS payment_method'}
      FROM donation d
      LEFT JOIN donor ON donor.donor_id = d.donor_id
      LEFT JOIN project ON project.project_id = d.project_id
      ORDER BY d.donation_date DESC NULLS LAST, d.donation_id DESC
      LIMIT 8;
    `;

    const [donationsByProject, projectStatus, projectsByCategory, volunteersBySkill, recentDonations, activeProjects] = await Promise.all([
      pool.query(`
        SELECT COALESCE(p.project_name, 'Unassigned') AS project_name,
               COALESCE(SUM(d.amount), 0) AS total_donation
        FROM donation d
        LEFT JOIN project p ON p.project_id = d.project_id
        GROUP BY p.project_id, p.project_name
        ORDER BY total_donation DESC;
      `),
      pool.query(projectStatusQuery),
      pool.query(`
        SELECT COALESCE(category, 'Uncategorized') AS category, COUNT(*) AS project_count
        FROM project
        GROUP BY category
        ORDER BY project_count DESC;
      `),
      pool.query(`
        SELECT COALESCE(skill, 'Other') AS skill, COUNT(*) AS volunteer_count
        FROM volunteer
        GROUP BY skill
        ORDER BY volunteer_count DESC;
      `),
      pool.query(recentDonationsQuery),
      pool.query(activeProjectsQuery),
    ]);

    res.json({
      donationsByProject: donationsByProject.rows,
      projectStatus: projectStatus.rows,
      projectsByCategory: projectsByCategory.rows,
      volunteersBySkill: volunteersBySkill.rows,
      recentDonations: recentDonations.rows,
      activeProjects: activeProjects.rows,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to load analytics.' });
  }
});

app.get('/api/reports', async (req, res) => {
  try {
    const [donationSummary, projectSummary, volunteerSummary, beneficiarySummary, projectDonationReport] = await Promise.all([
      pool.query(`
        SELECT
          COALESCE(SUM(amount), 0) AS total_amount,
          COALESCE(AVG(amount), 0) AS average_amount,
          COUNT(*) AS number_of_donations,
          COUNT(DISTINCT donor_id) AS number_of_donors
        FROM donation;
      `),
      pool.query(`
        SELECT category, COUNT(*) AS projects_by_category
        FROM project
        GROUP BY category
        ORDER BY projects_by_category DESC;
      `),
      pool.query(`
        SELECT skill, COUNT(*) AS volunteer_count
        FROM volunteer
        GROUP BY skill
        ORDER BY volunteer_count DESC;
      `),
      pool.query(`
        SELECT category, COUNT(*) AS beneficiary_count
        FROM beneficiary
        GROUP BY category
        ORDER BY beneficiary_count DESC;
      `),
      pool.query(`
        SELECT p.project_name,
               COALESCE(SUM(d.amount), 0) AS total_donation
        FROM project p
        LEFT JOIN donation d ON d.project_id = p.project_id
        GROUP BY p.project_id, p.project_name
        ORDER BY total_donation DESC;
      `),
    ]);

    res.json({
      donationSummary: donationSummary.rows[0],
      projectSummary: projectSummary.rows,
      volunteerSummary: volunteerSummary.rows,
      beneficiarySummary: beneficiarySummary.rows,
      projectDonationReport: projectDonationReport.rows,
    });
  } catch (error) {
    console.error('Reports error:', error);
    res.status(500).json({ error: 'Failed to load reports.' });
  }
});

app.get('/api/reports/donations', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        d.donation_id,
        donor.name AS donor_name,
        project.project_name,
        d.donation_date,
        d.amount
      FROM donation d
      LEFT JOIN donor ON donor.donor_id = d.donor_id
      LEFT JOIN project ON project.project_id = d.project_id
      ORDER BY d.donation_date DESC, d.donation_id DESC
      LIMIT 10;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Donation report error:', error);
    res.status(500).json({ error: 'Failed to load donation report.' });
  }
});

app.get('/api/donors', async (req, res) => {
  const queryData = buildSearchQuery('SELECT * FROM donor', [], [
    { column: 'name', type: 'like', value: req.query.search },
    { column: 'donor_type', type: 'equals', value: req.query.type },
  ]);

  try {
    const result = await pool.query(`${queryData.query} ORDER BY donor_id;`, queryData.values);
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch donors error:', error);
    res.status(500).json({ error: 'Failed to fetch donors.' });
  }
});

app.post('/api/donors', async (req, res) => {
  const data = {
    name: cleanString(req.body.name),
    email: cleanString(req.body.email),
    donor_type: cleanString(req.body.donor_type),
    city: cleanString(req.body.city),
    organization: cleanString(req.body.organization),
  };

  const validationError = validateDonor(data);
  if (validationError) return res.status(400).json({ error: validationError });

  try {
    const donorId = await getNextId('donor', 'donor_id');
    const result = await pool.query(
      'INSERT INTO donor (donor_id, name, email, donor_type, city, organization) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;',
      [donorId, data.name, data.email || null, data.donor_type || 'Individual', data.city || null, data.organization || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create donor error:', error);
    res.status(500).json({ error: 'Failed to create donor.' });
  }
});

app.put('/api/donors/:id', async (req, res) => {
  const data = {
    name: cleanString(req.body.name),
    email: cleanString(req.body.email),
    donor_type: cleanString(req.body.donor_type),
    city: cleanString(req.body.city),
    organization: cleanString(req.body.organization),
  };

  const validationError = validateDonor(data);
  if (validationError) return res.status(400).json({ error: validationError });

  try {
    const result = await pool.query(
      'UPDATE donor SET name = $1, email = $2, donor_type = $3, city = $4, organization = $5 WHERE donor_id = $6 RETURNING *;',
      [data.name, data.email || null, data.donor_type || 'Individual', data.city || null, data.organization || null, req.params.id]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: 'Donor not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update donor error:', error);
    res.status(500).json({ error: 'Failed to update donor.' });
  }
});

app.delete('/api/donors/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM donor WHERE donor_id = $1 RETURNING *;', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Donor not found.' });
    res.json({ message: 'Donor deleted successfully.' });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({ error: 'This donor cannot be deleted because donation records still reference it.' });
    }
    console.error('Delete donor error:', error);
    res.status(500).json({ error: 'Failed to delete donor.' });
  }
});

app.get('/api/volunteers', async (req, res) => {
  const queryData = buildSearchQuery('SELECT * FROM volunteer', [], [
    { column: 'name', type: 'like', value: req.query.search },
    { column: 'skill', type: 'equals', value: req.query.skill },
  ]);

  try {
    const result = await pool.query(`${queryData.query} ORDER BY volunteer_id;`, queryData.values);
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch volunteers error:', error);
    res.status(500).json({ error: 'Failed to fetch volunteers.' });
  }
});

app.post('/api/volunteers', async (req, res) => {
  const data = {
    name: cleanString(req.body.name),
    phone: cleanString(req.body.phone),
    email: cleanString(req.body.email),
    skill: cleanString(req.body.skill),
    project_id: req.body.project_id,
    availability: cleanString(req.body.availability),
  };

  const validationError = validateVolunteer(data);
  if (validationError) return res.status(400).json({ error: validationError });

  try {
    const volunteerId = await getNextId('volunteer', 'volunteer_id');
    const result = await pool.query(
      'INSERT INTO volunteer (volunteer_id, name, phone, email, skill, project_id, availability) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;',
      [volunteerId, data.name, data.phone || null, data.email || null, data.skill || null, toNumber(data.project_id), data.availability || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create volunteer error:', error);
    res.status(500).json({ error: 'Failed to create volunteer.' });
  }
});

app.put('/api/volunteers/:id', async (req, res) => {
  const data = {
    name: cleanString(req.body.name),
    phone: cleanString(req.body.phone),
    email: cleanString(req.body.email),
    skill: cleanString(req.body.skill),
    project_id: req.body.project_id,
    availability: cleanString(req.body.availability),
  };

  const validationError = validateVolunteer(data);
  if (validationError) return res.status(400).json({ error: validationError });

  try {
    const result = await pool.query(
      'UPDATE volunteer SET name = $1, phone = $2, email = $3, skill = $4, project_id = $5, availability = $6 WHERE volunteer_id = $7 RETURNING *;',
      [data.name, data.phone || null, data.email || null, data.skill || null, toNumber(data.project_id), data.availability || null, req.params.id]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: 'Volunteer not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update volunteer error:', error);
    res.status(500).json({ error: 'Failed to update volunteer.' });
  }
});

app.delete('/api/volunteers/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM volunteer WHERE volunteer_id = $1 RETURNING *;', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Volunteer not found.' });
    res.json({ message: 'Volunteer deleted successfully.' });
  } catch (error) {
    console.error('Delete volunteer error:', error);
    res.status(500).json({ error: 'Failed to delete volunteer.' });
  }
});

app.get('/api/projects', async (req, res) => {
  const queryData = buildSearchQuery('SELECT * FROM project', [], [
    { column: 'project_name', type: 'like', value: req.query.search },
    { column: 'category', type: 'equals', value: req.query.category },
    { column: 'location', type: 'equals', value: req.query.location },
  ]);

  try {
    const result = await pool.query(`${queryData.query} ORDER BY project_id;`, queryData.values);
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects.' });
  }
});

app.post('/api/projects', async (req, res) => {
  const data = {
    project_name: cleanString(req.body.project_name),
    category: cleanString(req.body.category),
    location: cleanString(req.body.location),
    start_date: cleanString(req.body.start_date),
    end_date: cleanString(req.body.end_date),
    budget: req.body.budget,
    status: cleanString(req.body.status),
  };

  const validationError = validateProject(data);
  if (validationError) return res.status(400).json({ error: validationError });

  try {
    const projectId = await getNextId('project', 'project_id');
    const result = await pool.query(
      'INSERT INTO project (project_id, project_name, category, location, start_date, end_date, budget, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;',
      [projectId, data.project_name, data.category || null, data.location || null, data.start_date || null, data.end_date || null, toNumber(data.budget), data.status || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project.' });
  }
});

app.put('/api/projects/:id', async (req, res) => {
  const data = {
    project_name: cleanString(req.body.project_name),
    category: cleanString(req.body.category),
    location: cleanString(req.body.location),
    start_date: cleanString(req.body.start_date),
    end_date: cleanString(req.body.end_date),
    budget: req.body.budget,
    status: cleanString(req.body.status),
  };

  const validationError = validateProject(data);
  if (validationError) return res.status(400).json({ error: validationError });

  try {
    const result = await pool.query(
      'UPDATE project SET project_name = $1, category = $2, location = $3, start_date = $4, end_date = $5, budget = $6, status = $7 WHERE project_id = $8 RETURNING *;',
      [data.project_name, data.category || null, data.location || null, data.start_date || null, data.end_date || null, toNumber(data.budget), data.status || null, req.params.id]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: 'Project not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project.' });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM project WHERE project_id = $1 RETURNING *;', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Project not found.' });
    res.json({ message: 'Project deleted successfully.' });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({ error: 'This project cannot be deleted because related donation records reference it.' });
    }
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project.' });
  }
});

app.get('/api/beneficiaries', async (req, res) => {
  const queryData = buildSearchQuery('SELECT * FROM beneficiary', [], [
    { column: 'name', type: 'like', value: req.query.search },
    { column: 'location', type: 'equals', value: req.query.location },
    { column: 'category', type: 'equals', value: req.query.category },
  ]);

  try {
    const result = await pool.query(`${queryData.query} ORDER BY beneficiary_id;`, queryData.values);
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch beneficiaries error:', error);
    res.status(500).json({ error: 'Failed to fetch beneficiaries.' });
  }
});

app.post('/api/beneficiaries', async (req, res) => {
  const data = {
    name: cleanString(req.body.name),
    age: req.body.age,
    location: cleanString(req.body.location),
    category: cleanString(req.body.category),
    contact: cleanString(req.body.contact),
    project_id: req.body.project_id,
  };

  const validationError = validateBeneficiary(data);
  if (validationError) return res.status(400).json({ error: validationError });

  try {
    const beneficiaryId = await getNextId('beneficiary', 'beneficiary_id');
    const result = await pool.query(
      'INSERT INTO beneficiary (beneficiary_id, name, age, location, category, contact, project_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;',
      [beneficiaryId, data.name, toNumber(data.age), data.location || null, data.category || null, data.contact || null, toNumber(data.project_id)]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create beneficiary error:', error);
    res.status(500).json({ error: 'Failed to create beneficiary.' });
  }
});

app.put('/api/beneficiaries/:id', async (req, res) => {
  const data = {
    name: cleanString(req.body.name),
    age: req.body.age,
    location: cleanString(req.body.location),
    category: cleanString(req.body.category),
    contact: cleanString(req.body.contact),
    project_id: req.body.project_id,
  };

  const validationError = validateBeneficiary(data);
  if (validationError) return res.status(400).json({ error: validationError });

  try {
    const result = await pool.query(
      'UPDATE beneficiary SET name = $1, age = $2, location = $3, category = $4, contact = $5, project_id = $6 WHERE beneficiary_id = $7 RETURNING *;',
      [data.name, toNumber(data.age), data.location || null, data.category || null, data.contact || null, toNumber(data.project_id), req.params.id]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: 'Beneficiary not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update beneficiary error:', error);
    res.status(500).json({ error: 'Failed to update beneficiary.' });
  }
});

app.delete('/api/beneficiaries/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM beneficiary WHERE beneficiary_id = $1 RETURNING *;', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Beneficiary not found.' });
    res.json({ message: 'Beneficiary deleted successfully.' });
  } catch (error) {
    console.error('Delete beneficiary error:', error);
    res.status(500).json({ error: 'Failed to delete beneficiary.' });
  }
});

app.get('/api/donations', async (req, res) => {
  const queryData = buildSearchQuery('SELECT * FROM donation', [], [
    { column: 'CAST(donation_id AS TEXT)', type: 'like', value: req.query.search },
    { column: 'donor_id', type: 'equals', value: req.query.donorId },
    { column: 'project_id', type: 'equals', value: req.query.projectId },
  ]);

  try {
    const result = await pool.query(`${queryData.query} ORDER BY donation_date DESC, donation_id DESC;`, queryData.values);
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch donations error:', error);
    res.status(500).json({ error: 'Failed to fetch donations.' });
  }
});

app.post('/api/donations', async (req, res) => {
  const data = {
    donor_id: req.body.donor_id,
    project_id: req.body.project_id,
    donation_date: cleanString(req.body.donation_date),
    amount: req.body.amount,
    payment_method: cleanString(req.body.payment_method),
  };

  const validationError = validateDonation(data);
  if (validationError) return res.status(400).json({ error: validationError });

  const foreignCheckError = await validateDonationForeignKeys(data);
  if (foreignCheckError) return res.status(400).json({ error: foreignCheckError });

  try {
    const donationId = await getNextId('donation', 'donation_id');
    const result = await pool.query(
      'INSERT INTO donation (donation_id, donor_id, project_id, donation_date, amount, payment_method) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;',
      [donationId, Number(data.donor_id), data.project_id === '' ? null : Number(data.project_id), data.donation_date || null, Number(data.amount), data.payment_method || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({ error: 'Failed to create donation.' });
  }
});

app.put('/api/donations/:id', async (req, res) => {
  const data = {
    donor_id: req.body.donor_id,
    project_id: req.body.project_id,
    donation_date: cleanString(req.body.donation_date),
    amount: req.body.amount,
    payment_method: cleanString(req.body.payment_method),
  };

  const validationError = validateDonation(data);
  if (validationError) return res.status(400).json({ error: validationError });

  const foreignCheckError = await validateDonationForeignKeys(data);
  if (foreignCheckError) return res.status(400).json({ error: foreignCheckError });

  try {
    const result = await pool.query(
      'UPDATE donation SET donor_id = $1, project_id = $2, donation_date = $3, amount = $4, payment_method = $5 WHERE donation_id = $6 RETURNING *;',
      [Number(data.donor_id), data.project_id === '' ? null : Number(data.project_id), data.donation_date || null, Number(data.amount), data.payment_method || null, req.params.id]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: 'Donation not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update donation error:', error);
    res.status(500).json({ error: 'Failed to update donation.' });
  }
});

app.delete('/api/donations/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM donation WHERE donation_id = $1 RETURNING *;', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Donation not found.' });
    res.json({ message: 'Donation deleted successfully.' });
  } catch (error) {
    console.error('Delete donation error:', error);
    res.status(500).json({ error: 'Failed to delete donation.' });
  }
});

app.use((error, req, res, next) => {
  console.error('Unexpected server error:', error.message);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
