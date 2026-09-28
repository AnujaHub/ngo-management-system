CREATE TABLE project (
    project_id INT PRIMARY KEY,
    project_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    location VARCHAR(100),
    start_date DATE, 
    end_date DATE,
    budget DECIMAL(12,2),
    status VARCHAR(30)
);

CREATE TABLE donor (
    donor_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    donor_type VARCHAR(50),
    city VARCHAR(50),
    organization VARCHAR(100)
);

CREATE TABLE volunteer (
    volunteer_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    email VARCHAR(100),
    skill VARCHAR(100),
    project_id INT,
    availability VARCHAR(30),
    FOREIGN KEY (project_id) REFERENCES project(project_id)
);

CREATE TABLE beneficiary (
    beneficiary_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT,
    location VARCHAR(100),
    category VARCHAR(50),
    contact VARCHAR(15),
    project_id INT,
    FOREIGN KEY (project_id) REFERENCES project(project_id)
);

CREATE TABLE donation (
    donation_id INT PRIMARY KEY,
    donor_id INT NOT NULL,
    project_id INT,
    donation_date DATE,
    amount DECIMAL(12,2),
    payment_method VARCHAR(30),
    FOREIGN KEY (donor_id) REFERENCES donor(donor_id),
    FOREIGN KEY (project_id) REFERENCES project(project_id)
);