# SQL Query Explanation

This file explains the purpose of each query in `queries.sql` for a DBMS viva or demonstration.

## Donor queries

1. Show all donors
   - Selects all records from the donor table in ascending donor_id order.
   - Useful for viewing the complete donor list.

2. Show donors by type
   - Groups donor records by donor_type and counts how many donors belong to each type.
   - Demonstrates `GROUP BY` and `COUNT()`.

3. Show donors from Mumbai
   - Filters donor records by the city value `Mumbai`.
   - Demonstrates the `WHERE` clause.

4. Count donors by city
   - Groups donor records by city and counts the total number of donors per city.
   - Shows aggregation with `COUNT()` and grouping.

5. Find donors who gave more than 50000 total
   - Joins donor and donation tables using donor_id.
   - Adds all donation values for each donor and filters those above 50000.
   - Demonstrates `JOIN`, `SUM()`, and `HAVING`.

6. List donor donation totals by project
   - Connects donor, donation, and project tables.
   - Shows how much each donor has contributed to each project.
   - Demonstrates a multi-table join with aggregated totals.

7. Recent donations with donor names
   - Joins donation with donor and project to display the donor and project names.
   - Orders results by donation date descending.
   - Useful for recent activity reporting.

8. Donors with organization records
   - Lists donors whose organization field is not empty.
   - Demonstrates filter logic with `IS NOT NULL`.

9. Average donation amount per donor
   - Uses `LEFT JOIN` so even donors without donations are included.
   - Calculates average donation value using `AVG()`.

10. Donor count by organization
   - Filters only donors that have an organization value.
   - Groups by organization and counts donors in each organization.

## Volunteer queries

11. List all volunteers
   - Retrieves every volunteer record.

12. Count volunteers by skill
   - Groups volunteer records by skill and counts each group.
   - Shows `GROUP BY` with `COUNT()`.

13. Volunteers available full-time
   - Filters volunteers where availability is `Full-time`.

14. Volunteers with teaching skill
   - Displays only volunteers whose skill is `Teaching`.

15. Volunteer phone list by skill
   - Uses `STRING_AGG()` to combine names and phone numbers in a single string per skill.
   - Demonstrates a practical aggregated string output.

## Project queries

16. Project budget summary by category
   - Groups projects by category and calculates project count and total budget.
   - Shows `COUNT()` and `SUM()` together.

17. Top 5 projects by budget
   - Sorts projects by budget descending and limits output to five results.
   - Demonstrates `ORDER BY` and `LIMIT`.

18. Show projects in Mumbai
   - Filter query for projects in the city `Mumbai`.

19. Total donation received per project
   - Left joins project and donation tables.
   - Shows how much each project has received in total donations.
   - Uses `COUNT()` and `SUM()` with grouping.

20. Projects with above-average budget
   - Compares each project budget against the average project budget.
   - Demonstrates a subquery using `SELECT AVG(budget) FROM project`.

## Beneficiary queries

21. List all beneficiaries
   - Displays all records from the beneficiary table.

22. Beneficiaries by category
   - Groups beneficiaries by category and counts their number.

23. Beneficiaries from Mumbai
   - Filters beneficiaries located in Mumbai.

24. Average age of beneficiaries by category
   - Groups by category and calculates the average age for each group.
   - Demonstrates `AVG()` and grouping.

25. Child beneficiaries
   - Selects all beneficiaries whose category is `Child`.

26. Count beneficiaries by location
   - Groups by location to show the number of beneficiaries in each area.

## Combined and aggregate queries

27. Total donation amount across all projects
   - Sums the amount column from donation.
   - Shows overall donation total.

28. Average donation amount overall
   - Calculates the mean donation value using `AVG()`.

29. Donation count by donor
   - Joins donor and donation, then groups by donor.
   - Displays each donor's total number and total money donated.

30. Combined donor-project summary
   - Joins donor, donation, and project data.
   - Shows each donor's contribution by project.
   - Useful as a final reporting query for dashboard-like insights.

## Why these queries are useful

These queries show core DBMS skills expected in a college project:

- `SELECT` and filtering
- `JOIN` operations
- `GROUP BY` and aggregate functions
- `COUNT()`, `SUM()`, `AVG()`, `MIN()`, `MAX()`
- `ORDER BY` and `LIMIT`
- Subqueries and practical reporting logic
