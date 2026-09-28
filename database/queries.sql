-- NGO Management System SQL Query Collection
-- 30 queries covering donor, volunteer, project, beneficiary, and donation analysis

-- 1. Show all donors
SELECT * FROM donor ORDER BY donor_id;

-- 2. Show donors by type
SELECT donor_type, COUNT(*) AS donor_count
FROM donor
GROUP BY donor_type
ORDER BY donor_count DESC;

-- 3. Show donors from Mumbai
SELECT *
FROM donor
WHERE city = 'Mumbai'
ORDER BY donor_id;

-- 4. Count donors by city
SELECT city, COUNT(*) AS donor_count
FROM donor
GROUP BY city
ORDER BY donor_count DESC;

-- 5. Find donors who gave more than 50000 total
SELECT d.name, SUM(da.amount) AS total_donation
FROM donor d
JOIN donation da ON da.donor_id = d.donor_id
GROUP BY d.donor_id, d.name
HAVING SUM(da.amount) > 50000
ORDER BY total_donation DESC;

-- 6. List donor donation totals by project
SELECT d.name, p.project_name, SUM(da.amount) AS total_given
FROM donor d
JOIN donation da ON da.donor_id = d.donor_id
JOIN project p ON p.project_id = da.project_id
GROUP BY d.donor_id, d.name, p.project_id, p.project_name
ORDER BY total_given DESC;

-- 7. Recent donations with donor names
SELECT da.donation_id, d.name AS donor_name, p.project_name, da.donation_date, da.amount
FROM donation da
JOIN donor d ON d.donor_id = da.donor_id
LEFT JOIN project p ON p.project_id = da.project_id
ORDER BY da.donation_date DESC;

-- 8. Donors with organization records
SELECT *
FROM donor
WHERE organization IS NOT NULL
ORDER BY donor_id;

-- 9. Average donation amount per donor
SELECT d.name, ROUND(AVG(da.amount), 2) AS average_donation
FROM donor d
LEFT JOIN donation da ON da.donor_id = d.donor_id
GROUP BY d.donor_id, d.name
ORDER BY average_donation DESC;

-- 10. Donor count by organization
SELECT organization, COUNT(*) AS donor_count
FROM donor
WHERE organization IS NOT NULL
GROUP BY organization
ORDER BY donor_count DESC;

-- 11. List all volunteers
SELECT * FROM volunteer ORDER BY volunteer_id;

-- 12. Count volunteers by skill
SELECT skill, COUNT(*) AS volunteer_count
FROM volunteer
GROUP BY skill
ORDER BY volunteer_count DESC;

-- 13. Volunteers available full-time
SELECT *
FROM volunteer
WHERE availability = 'Full-time'
ORDER BY volunteer_id;

-- 14. Volunteers with teaching skill
SELECT *
FROM volunteer
WHERE skill = 'Teaching'
ORDER BY volunteer_id;

-- 15. Volunteer phone list by skill
SELECT skill, STRING_AGG(name || ' (' || phone || ')', ', ') AS volunteer_details
FROM volunteer
GROUP BY skill
ORDER BY skill;

-- 16. Project budget summary by category
SELECT category, COUNT(*) AS project_count, ROUND(SUM(budget), 2) AS total_budget
FROM project
GROUP BY category
ORDER BY total_budget DESC;

-- 17. Top 5 projects by budget
SELECT project_name, category, location, budget
FROM project
ORDER BY budget DESC
LIMIT 5;

-- 18. Show projects in Mumbai
SELECT *
FROM project
WHERE location = 'Mumbai'
ORDER BY project_id;

-- 19. Total donation received per project
SELECT p.project_name, COUNT(da.donation_id) AS donation_count, ROUND(SUM(da.amount), 2) AS total_received
FROM project p
LEFT JOIN donation da ON da.project_id = p.project_id
GROUP BY p.project_id, p.project_name
ORDER BY total_received DESC;

-- 20. Projects with above-average budget
SELECT project_name, category, budget
FROM project
WHERE budget > (SELECT AVG(budget) FROM project)
ORDER BY budget DESC;

-- 21. List all beneficiaries
SELECT * FROM beneficiary ORDER BY beneficiary_id;

-- 22. Beneficiaries by category
SELECT category, COUNT(*) AS beneficiary_count
FROM beneficiary
GROUP BY category
ORDER BY beneficiary_count DESC;

-- 23. Beneficiaries from Mumbai
SELECT *
FROM beneficiary
WHERE location = 'Mumbai'
ORDER BY beneficiary_id;

-- 24. Average age of beneficiaries by category
SELECT category, ROUND(AVG(age), 2) AS average_age
FROM beneficiary
GROUP BY category
ORDER BY average_age DESC;

-- 25. Child beneficiaries
SELECT *
FROM beneficiary
WHERE category = 'Child'
ORDER BY beneficiary_id;

-- 26. Count beneficiaries by location
SELECT location, COUNT(*) AS beneficiary_count
FROM beneficiary
GROUP BY location
ORDER BY beneficiary_count DESC;

-- 27. Total donation amount across all projects
SELECT ROUND(SUM(amount), 2) AS total_amount
FROM donation;

-- 28. Average donation amount overall
SELECT ROUND(AVG(amount), 2) AS average_donation
FROM donation;

-- 29. Donation count by donor
SELECT d.name, COUNT(da.donation_id) AS donation_count, ROUND(SUM(da.amount), 2) AS total_given
FROM donor d
LEFT JOIN donation da ON da.donor_id = d.donor_id
GROUP BY d.donor_id, d.name
ORDER BY total_given DESC;

-- 30. Combined donor-project summary
SELECT d.name AS donor_name,
       p.project_name,
       COUNT(da.donation_id) AS donation_count,
       ROUND(SUM(da.amount), 2) AS total_amount
FROM donor d
LEFT JOIN donation da ON da.donor_id = d.donor_id
LEFT JOIN project p ON p.project_id = da.project_id
GROUP BY d.donor_id, d.name, p.project_id, p.project_name
ORDER BY total_amount DESC;
