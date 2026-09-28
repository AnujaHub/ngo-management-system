
-- -------------------------
-- DONORS
-- -------------------------
INSERT INTO donor (
    donor_id,
    name,
    email,
    donor_type,
    city,
    organization
) VALUES
    (1, 'Rahul Sharma', 'rahul@example.com', 'Individual', 'Mumbai', 'None'),
    (2, 'Priya Mehta', 'priya@example.com', 'Individual', 'Pune', 'None'),
    (3, 'Amit Patel', 'amit@example.com', 'Individual', 'Nashik', 'None'),
    (4, 'Neha Joshi', 'neha@example.com', 'Individual', 'Mumbai', 'None'),
    (5, 'Tata Trust', 'tata@example.com', 'Organization', 'Mumbai', 'Tata Trust'),
    (6, 'Infosys Foundation', 'infosys@example.com', 'Organization', 'Bengaluru', 'Infosys'),
    (7, 'Green Earth NGO', 'greenearth@example.com', 'NGO', 'Thane', 'Green Earth NGO'),
    (8, 'Rohan Desai', 'rohan@example.com', 'Individual', 'Pune', 'None'),
    (9, 'Sneha Kulkarni', 'sneha@example.com', 'Individual', 'Mumbai', 'None'),
    (10, 'Helping Hands Foundation', 'helpinghands@example.com', 'Organization', 'Delhi', 'Helping Hands Foundation');

-- -------------------------
-- PROJECTS
-- -------------------------
INSERT INTO project (
    project_id,
    project_name,
    category,
    location,
    start_date,
    end_date,
    budget,
    status
) VALUES
    (1, 'Education for All', 'Education', 'Mumbai', '2026-01-10', '2026-12-31', 500000.00, 'Active'),
    (2, 'Food Distribution Drive', 'Food', 'Pune', '2026-02-01', '2026-08-31', 300000.00, 'Completed'),
    (3, 'Free Medical Camp', 'Healthcare', 'Nashik', '2026-03-15', '2026-10-15', 250000.00, 'Active'),
    (4, 'Women Skill Development', 'Women Empowerment', 'Mumbai', '2026-04-01', '2026-12-31', 400000.00, 'Active'),
    (5, 'Clean Village Initiative', 'Environment', 'Thane', '2026-01-20', '2026-06-30', 200000.00, 'Completed'),
    (6, 'Child Nutrition Program', 'Healthcare', 'Nagpur', '2026-02-15', '2026-11-30', 350000.00, 'Active'),
    (7, 'Digital Literacy Drive', 'Education', 'Aurangabad', '2026-03-01', '2026-09-30', 275000.00, 'Active'),
    (8, 'Elderly Care Program', 'Social Welfare', 'Mumbai', '2026-01-15', '2026-12-15', 450000.00, 'Active'),
    (9, 'Flood Relief Support', 'Disaster Relief', 'Kolhapur', '2026-06-01', '2026-10-31', 600000.00, 'Active'),
    (10, 'Tree Plantation Drive', 'Environment', 'Pune', '2026-05-01', '2026-08-31', 150000.00, 'Completed');

-- -------------------------
-- VOLUNTEERS
-- -------------------------
INSERT INTO volunteer (
    volunteer_id,
    name,
    phone,
    email,
    skill,
    availability,
    project_id
) VALUES
    (1, 'Aarav Shah', '9811111111', 'aarav@example.com', 'Teaching', 'Weekends', 1),
    (2, 'Ananya Rao', '9822222222', 'ananya@example.com', 'Medical Support', 'Full-time', 3),
    (3, 'Karan Singh', '9833333333', 'karan@example.com', 'Fundraising', 'Weekends', 2),
    (4, 'Isha Mehta', '9844444444', 'isha@example.com', 'Teaching', 'Weekdays', 1),
    (5, 'Vivek Patil', '9855555555', 'vivek@example.com', 'IT Support', 'Weekends', 7),
    (6, 'Riya Nair', '9866666666', 'riya@example.com', 'Event Management', 'Weekdays', 4),
    (7, 'Aditya Joshi', '9877777777', 'aditya@example.com', 'Food Distribution', 'Weekends', 2),
    (8, 'Pooja Sharma', '9888888888', 'pooja@example.com', 'Counselling', 'Full-time', 8),
    (9, 'Manav Desai', '9899999999', 'manav@example.com', 'Logistics', 'Weekends', 9),
    (10, 'Simran Kapoor', '9800000000', 'simran@example.com', 'Teaching', 'Weekdays', 7);

-- -------------------------
-- BENEFICIARIES
-- -------------------------
INSERT INTO beneficiary (
    beneficiary_id,
    name,
    age,
    location,
    category,
    contact,
    project_id
) VALUES
    (1, 'Suresh Kumar', 45, 'Mumbai', 'Low Income', '9876000011', 1),
    (2, 'Meena Devi', 38, 'Pune', 'Low Income', '9876000012', 2),
    (3, 'Ravi Patil', 12, 'Nashik', 'Child', '9876000013', 3),
    (4, 'Kavita Sharma', 32, 'Mumbai', 'Women', '9876000014', 4),
    (5, 'Amit Jadhav', 65, 'Thane', 'Senior Citizen', '9876000015', 5),
    (6, 'Sunita Rao', 50, 'Nagpur', 'Low Income', '9876000016', 6),
    (7, 'Rahul More', 14, 'Aurangabad', 'Child', '9876000017', 7),
    (8, 'Lata Joshi', 70, 'Mumbai', 'Senior Citizen', '9876000018', 8),
    (9, 'Vijay Shinde', 29, 'Kolhapur', 'Disaster Affected', '9876000019', 9),
    (10, 'Pallavi Desai', 27, 'Pune', 'Women', '9876000020', 10);

-- -------------------------
-- DONATIONS
-- -------------------------
INSERT INTO donation (
    donation_id,
    donor_id,
    project_id,
    donation_date,
    amount,
    payment_method
) VALUES
    (1, 1, 1, '2026-01-15', 50000.00, 'UPI'),
    (2, 2, 2, '2026-02-10', 25000.00, 'UPI'),
    (3, 3, 3, '2026-03-20', 40000.00, 'Bank Transfer'),
    (4, 4, 4, '2026-04-10', 30000.00, 'UPI'),
    (5, 5, 1, '2026-01-20', 150000.00, 'Bank Transfer'),
    (6, 6, 7, '2026-07-05', 100000.00, 'Bank Transfer'),
    (7, 7, 5, '2026-05-10', 20000.00, 'Cheque'),
    (8, 8, 6, '2026-06-15', 45000.00, 'UPI'),
    (9, 9, 8, '2026-02-01', 35000.00, 'Cheque'),
    (10, 10, 9, '2026-07-15', 200000.00, 'Bank Transfer');
