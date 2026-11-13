CREATE DATABASE NEWCORP_DB;
GO
USE NEWCORP_DB;


-- To store user personal and contact information.
CREATE TABLE USER_ (
    User_ID INT IDENTITY(1,1),
    First_Name VARCHAR(50),
    Last_Name VARCHAR(50),
    Email_Address VARCHAR(50),
    Mobile_Number VARCHAR(20),
    Street_Name VARCHAR(100),
    Street_Number VARCHAR(10),
    City VARCHAR(50),
    Country VARCHAR(50),
    Postal_Zone VARCHAR(20),

    CONSTRAINT pk_user PRIMARY KEY (User_ID),
    CONSTRAINT uc_user_email UNIQUE (Email_Address)
);



-- To store information about team
CREATE TABLE TEAM (
    Team_ID INT IDENTITY(1,1),
    Team_Name VARCHAR(50),
    Created_Date DATE,
    CONSTRAINT pk_team PRIMARY KEY (Team_ID),
    CONSTRAINT uc_team_name UNIQUE (Team_Name)
);




-- Stores the membership of the users in the team
CREATE TABLE TEAM_MEMBERSHIP (
    User_ID INT,
    Team_ID INT,
    CONSTRAINT pk_team_membership  PRIMARY KEY (User_ID, Team_ID),
    
    CONSTRAINT fk_team_membership_user FOREIGN KEY (User_ID) REFERENCES [USER_](User_ID),
    CONSTRAINT fk_team_membership_team FOREIGN KEY (Team_ID) REFERENCES TEAM(Team_ID)
);


-- This table stores information about projects launched by NewCorp teams.
CREATE TABLE PROJECT (
    Project_ID INT IDENTITY(1,1),
    Posted_Date DATE,
    Description VARCHAR(500),
    Closing_Date DATE,
    Target_Amount DECIMAL(12,2),
    Team_ID INT,

    CONSTRAINT pk_project PRIMARY KEY (Project_ID),
    CONSTRAINT fk_project_team FOREIGN KEY (Team_ID) REFERENCES TEAM(Team_ID)
);


-- To store the donations made by users to projects.
CREATE TABLE DONATION (
    User_ID INT,
    Donation_Number INT,
    Project_ID INT,
    Donation_Date DATE,
    Donation_Amount DECIMAL(12,2),

    CONSTRAINT pk_donation PRIMARY KEY (User_ID, Donation_Number),
    CONSTRAINT fk_donation_user FOREIGN KEY (User_ID) REFERENCES USER_ (User_ID),
    CONSTRAINT fk_donation_project FOREIGN KEY (Project_ID) REFERENCES PROJECT(Project_ID)
);




-- To store additional information about projects that are considered commercial, 
-- especially the profit margin.

CREATE TABLE COMMERCIAL_PROJECT (
    Project_ID INT,
    Profit_Margin DECIMAL(5,2),

    CONSTRAINT pk_commercial_project PRIMARY KEY (Project_ID),
    CONSTRAINT fk_commercial_project FOREIGN KEY (Project_ID) REFERENCES PROJECT(Project_ID)
);



-- To store additional information about projects that are considered charity, 
-- especially the beneficiaries.

CREATE TABLE CHARITY_PROJECT (
    Project_ID INT,
    Beneficiaries VARCHAR(500),

    CONSTRAINT pk_charity_project PRIMARY KEY (Project_ID),
    CONSTRAINT fk_charity_project FOREIGN KEY (Project_ID) REFERENCES PROJECT(Project_ID)
);

--POPULATION
-- To Populate USER_
INSERT INTO USER_
(First_Name, Last_Name, Email_Address, Mobile_Number,
 Street_Name, Street_Number, City, Country, Postal_Zone, Password_Hash)
VALUES
('John', 'Gray', 'test01@example.com', '876-101-1234',
 'Black street', '10', 'Kingston', 'Jamaica', '00000', 'scrypt:32768:8:1$SZ2wprTTl4BvvJxb$3a63e9a0e4d4397bab90a96958d75f4b173a86d646ab6af41bd6a2ea786b52e9ef974897147565d1bdd743e4b68ec0c7953e9b7c7caf1535b083d61649b9064a'), --password johngray

('Melisa', 'Green', 'test02@example.com', '876-999-9009',
 'Waterloo', '15', 'Kingston', 'Jamaica', '10001', 'scrypt:32768:8:1$SbB2H57oS4gudkK2$e88b48560517dd2897c4d13126b79c94670020dbfd5b8241ad814e678152b9fee17d1ff775bb144a2eadcc71991904d5a6de9e9fd94e8df7f81245212147f335'); --password melisagreen




--POPULATION (Dummy Accounts to support pre existing Teams and Donations)
-- To Populate USER_
INSERT INTO USER_
(First_Name, Last_Name, Email_Address, Mobile_Number,
 Street_Name, Street_Number, City, Country, Postal_Zone)
VALUES
('John', 'Brown', 'john.brown@email.com', '8765551001',
 'Hope Road', '15', 'Kingston', 'Jamaica', 'JMKN01'),

('Lisa', 'Johnson', 'lisa.johnson@email.com', '8765551002',
 'Manning Avenue', '22', 'Kingston', 'Jamaica', 'JMKN02'),

('David', 'Williams', 'david.williams@email.com', '8765551003',
 'Main Street', '8', 'Spanish Town', 'Jamaica', 'JMST01'),

('Sarah', 'Campbell', 'sarah.campbell@email.com', '8765551004',
 'Church Street', '31', 'Montego Bay', 'Jamaica', 'JMMB01'),

('Michael', 'Thompson', 'michael.thompson@email.com', '8765551005',
 'Constant Spring Road', '45', 'Kingston', 'Jamaica', 'JMKN03');


 
 -- To Populate TEAM
INSERT INTO TEAM
(Team_Name, Created_Date)
VALUES
('Community Development', '2026-01-10'),
('Technology Innovators', '2026-02-15'),
('Education Support', '2026-03-01');



-- To Populate TEAM_MEMBERSHIP
INSERT INTO TEAM_MEMBERSHIP
(User_ID, Team_ID)
VALUES
(1, 1),
(2, 1),
(2, 2),
(3, 2),
(3, 3),
(4, 3),
(5, 1);


*/
-- To Populate PROJECT
INSERT INTO PROJECT
(Posted_Date, Description, Closing_Date, Target_Amount, Team_ID)
VALUES
('2026-04-01', 'Community Centre Renovation',
 '2026-06-30', 500000.00, 1), --To demonstrate a closed project

('2026-04-15', 'Cybersecurity Training Programme',
 '2026-12-12', 750000.00, 2), -- To demonstrate an ongoing project

('2026-05-01', 'School Technology Initiative',
 '2027-02-17', 1000000.00, 3), --Ongoing --Pending to demonstrate a funded project

('2026-05-15', 'Community Food Support Programme',
 '2027-09-30', 300000.00, 1); --To demonstrate the 1:M relationship between teams and Projects
 
 
 -- To Populate DONATION
INSERT INTO DONATION
(User_ID, Donation_Number, Project_ID, Donation_Date, Donation_Amount)
VALUES
(1, 1, 1, '2026-04-10', 50000.00),
(2, 1, 1, '2026-04-12', 75000.00),
(2, 2, 2, '2026-04-20', 100000.00),
(3, 1, 2, '2026-04-25', 50000.00),
(5, 1, 4, '2026-05-20', 25000.00),
(7, 1, 3, '2026-11-12', 1000000.00), --to complete the funding on project 3
(3, 2, 4, '2026-05-25', 50000.00); 



/*-- To Populate COMMERCIAL_PROJECT
INSERT INTO COMMERCIAL_PROJECT
(Project_ID, Profit_Margin)
VALUES
(2, 25.00);*/ --this is done automatically



-- To Populate CHARITY_PROJECT
INSERT INTO CHARITY_PROJECT
(Project_ID, Beneficiaries)
VALUES
(1, 'Residents of the local community'),

(3, 'Students and teachers in participating schools'),

(4, 'Low-income families and vulnerable members of the community');



--=================================================================================================
/*VIEWS
-----------------------------------------------------------------------------------
View 1
Name:           View_Project_Funding_Summary
Base Tables: PROJECT and DONATION
Purpose:   	This allows the manager to see and monitor the financial progress of the project by showing the target, showing the total amount donated and the amount still needed to reach the target amount. In the website it can be used as a report called project funding summary.
------------------------------------------------------------------------------------*/
GO
CREATE VIEW View_Project_Funding_Summary
AS
SELECT
P.Project_ID, P.Description, P.Target_Amount,     	COALESCE(SUM(D.Donation_Amount), 0)
AS Total_Raised,
	P.Target_Amount - COALESCE(SUM(D.Donation_Amount), 0)
AS Amount_Remaining
FROM PROJECT P
LEFT JOIN DONATION D
	ON P.Project_ID = D.Project_ID
GROUP BY
	P.Project_ID,
	P.Description,
	P.Target_Amount;

/*--------------------------------------------------------------------------------------
View 2
Name   	    :  View_Project_Donation_Summary
Base Tables :  PROJECT and DONATION
Purpose        :  This view is for for seeing the number of donations received by each project and the total finacial value of those donations. On the website this can be viewed as a donation summary by the manager.
SQL     	    :   
---------------------------------------------------------------------------------------*/
GO
CREATE VIEW View_Project_Donation_Summary
AS
SELECT
	P.Project_ID,
	P.Description,
	COUNT(D.Donation_Number) AS Number_Of_Donations,
	COALESCE(SUM(D.Donation_Amount), 0) AS Total_Donated
FROM PROJECT P
LEFT JOIN DONATION D
	ON P.Project_ID = D.Project_ID
GROUP BY
	P.Project_ID,
	P.Description;


/*------------------------------------------------------------------------------------------
View 3
   	Name   	    :  View_Team_Membership
   	Base Tables :  USER, TEAM_MEMBERSHIP and TEAM
   	Purpose       :  This view allows us to see the users beloing to each project team along with their information such as email addresses and mobile numbers. This is important because based on the scenario a team member is not limited to one team, so it will be used to keep track of team members.
 
   	SQL     	    :   
--------------------------------------------------------------------------------------------*/	
GO
CREATE VIEW View_Team_Membership
AS
SELECT
	T.Team_ID, T.Team_Name,
	U.User_ID, U.First_Name, U.Last_Name,
	U.Email_Address, U.Mobile_Number
FROM USER_ U
INNER JOIN TEAM_MEMBERSHIP TM
	ON U.User_ID = TM.User_ID
INNER JOIN TEAM T
	ON TM.Team_ID = T.Team_ID;

/*---------------------------------------------------------------------------------------------
View 4
   	Name   	    :  View_Project_Team
   	Base Tables :  TEAM and PROJECT
   	Purpose       :  This view allows you to see which team is managing each project, along with other useful information such as the project’s posted date, closing date and target amount. This is useful to a manager because as stated in the scenario, a team can work on multiple projects.
   	SQL     	    :   
------------------------------------------------------------------------------------------------*/
GO
CREATE VIEW View_Project_Team
AS
SELECT
	T.Team_ID, T.Team_Name,
	P.Project_ID, P.Description,
	P.Posted_Date, P.Closing_Date,
	P.Target_Amount
FROM TEAM T
INNER JOIN PROJECT P
	ON T.Team_ID = P.Team_ID;
 
/*----------------------------------------------------------------------------------------------
View 5
   	Name   	    :  View_Donation_Details
   	Base Tables :  USER, DONATION and PROJECT
   	Purpose       :  This allows the manager to view donation activity and history, it includes the users who donated, the project receiving the donation, donation number, the date and amount. In the website it can be used to generate and view donation history.
   	SQL     	   :   
------------------------------------------------------------------------------------------------*/
GO
CREATE VIEW View_Donation_Details
AS
SELECT
	U.User_ID, U.First_Name, U.Last_Name,
	P.Project_ID, P.Description,
	D.Donation_Number, D.Donation_Date,
	D.Donation_Amount
FROM USER_ U
INNER JOIN DONATION D
	ON U.User_ID = D.User_ID
INNER JOIN PROJECT P
	ON D.Project_ID = P.Project_ID;
	GO
-------------------------------------------------------------------------------------------------


/*----------------------------------------------------------------------------------------------
VIEW 6 
   	Name   	    :  View_Team_Summary
   	Base Tables :  TEAM, TEAM_MEMBERSHIP
   	Purpose     :  This allows the manager to calculate the number of members per team.
   	SQL     	:   
------------------------------------------------------------------------------------------------*/
GO

CREATE VIEW dbo.View_Team_Summary
AS
SELECT
    T.Team_ID,
    T.Team_Name,
    T.Created_Date,
    COUNT(TM.User_ID) AS Number_Of_Members
FROM dbo.TEAM AS T
LEFT JOIN dbo.TEAM_MEMBERSHIP AS TM
    ON T.Team_ID = TM.Team_ID
GROUP BY
    T.Team_ID,
    T.Team_Name,
    T.Created_Date;
GO

--=================================================================================================





--DEMO 2 
/*==============================================================================
Procedure 1
Base Tables: TEAM, PROJECT, DONATION
Purpose: Evaluates the funding performance of each team.
==============================================================================*/
CREATE PROCEDURE dbo.sp_TeamPerformance
AS
BEGIN
    SELECT
        T.Team_ID,
        T.Team_Name,
        COUNT(P.Project_ID) AS Total_Projects,
        COALESCE(SUM(P.Target_Amount), 0) AS Total_Target_Amount,
        COALESCE(SUM(P.Amount_Raised), 0) AS Total_Donations,
        CASE
            WHEN COALESCE(SUM(P.Target_Amount), 0) = 0
                THEN 0
            ELSE CAST(
                COALESCE(SUM(P.Amount_Raised), 0) * 100.0 /
                SUM(P.Target_Amount)
                AS DECIMAL(10,2)
            )
        END AS Funding_Percentage
    FROM TEAM T
    LEFT JOIN (
        SELECT
            PR.Project_ID,
            PR.Team_ID,
            PR.Target_Amount,
            COALESCE(SUM(D.Donation_Amount), 0) AS Amount_Raised
        FROM PROJECT PR
        LEFT JOIN DONATION D
            ON PR.Project_ID = D.Project_ID
        GROUP BY
            PR.Project_ID,
            PR.Team_ID,
            PR.Target_Amount
    ) P ON T.Team_ID = P.Team_ID
    GROUP BY T.Team_ID, T.Team_Name;
END;
GO

EXEC dbo.sp_TeamPerformance;


/*=====================================================================
Procedure 2
Base Tables: PROJECT, DONATION
 Purpose: Identifies projects approaching their closing dates.
=====================================================================*/
GO
CREATE PROCEDURE dbo.sp_ProjectsClosingSoon
    @Days INT
AS
BEGIN
    SELECT
        P.Project_ID,
        P.Description,
        P.Closing_Date,
        DATEDIFF(DAY, CAST(GETDATE() AS DATE), P.Closing_Date) AS Days_Remaining,
        P.Target_Amount,
        COALESCE(SUM(D.Donation_Amount), 0) AS Amount_Raised,
        P.Target_Amount - COALESCE(SUM(D.Donation_Amount), 0) AS Amount_Remaining,
        CASE
            WHEN COALESCE(SUM(D.Donation_Amount), 0) >= P.Target_Amount
                THEN 'Target Achieved'
            ELSE 'Target Not Achieved'
        END AS Funding_Status
    FROM PROJECT P
    LEFT JOIN DONATION D
        ON P.Project_ID = D.Project_ID
    WHERE P.Closing_Date >= CAST(GETDATE() AS DATE)
      AND P.Closing_Date <= DATEADD(
          DAY, @Days, CAST(GETDATE() AS DATE)
      )
    GROUP BY
        P.Project_ID,
        P.Description,
        P.Closing_Date,
        P.Target_Amount
    ORDER BY P.Closing_Date;
END;
GO


EXEC dbo.sp_ProjectsClosingSoon @Days = 90;

/*=======================================================================================
Procedure 3
Base Tables : PROJECT, DONATION
Purpose :To track a projects financial progress, including the target amount, 
amount raised, and remaining balance.
========================================================================================*/

GO

CREATE PROCEDURE sp_DonationInfo 
@Project_ID INT 
AS 
BEGIN 
SELECT P.Project_ID, P.Description, P.Target_Amount, 
COALESCE(
	(SELECT SUM(D.Donation_Amount) 
	FROM DONATION D 
	WHERE D.Project_ID = P.Project_ID), 0 ) 
	AS Amount_Raised, 
	P.Target_Amount - 
	COALESCE( 
	(SELECT SUM(D.Donation_Amount) 
	FROM DONATION D 
	WHERE D.Project_ID = P.Project_ID), 0 ) 
	AS Amount_Remaining 
FROM PROJECT P 
WHERE P.Project_ID = @Project_ID; 
END; 
GO

EXEC dbo.sp_DonationInfo
    @Project_ID = 3;

	-- ============================================================
-- Stored Procedure 4: sp_UserDonationHistory
-- Purpose: Displays all donations made by a specific user,
--          including the project, donation date and amount.
-- ================================================================
GO
CREATE OR ALTER PROCEDURE dbo.sp_UserDonationHistory
    @User_ID INT              -- User ID used to identify the user
AS
BEGIN
    -- Retrieve the user's personal information,
    -- project information and donation details
    SELECT
        U.User_ID,
        U.First_Name,
        U.Last_Name,
        P.Project_ID,
        P.Description,
        D.Donation_Number,
        D.Donation_Date,
        D.Donation_Amount

    -- Start with the USER_ table
    FROM USER_ U

    -- Connect the user to their donations
    INNER JOIN DONATION D
        ON U.User_ID = D.User_ID

    -- Connect each donation to the project
    INNER JOIN PROJECT P
        ON D.Project_ID = P.Project_ID

    -- Only display donations belonging to the specified user
    WHERE U.User_ID = @User_ID

    -- Display the most recent donations first
    ORDER BY D.Donation_Date DESC;
END;

GO

EXEC dbo.sp_UserDonationHistory 1;



-- ============================================================
-- Stored Procedure 5: sp_TeamMembers
-- Purpose: Displays all users who belong to a specific team,
--          including their contact information.
-- ============================================================
GO
CREATE OR ALTER PROCEDURE dbo.sp_TeamMembers
    @Team_ID INT              -- Team ID used to identify the team
AS
BEGIN
    -- Retrieve team and member information
    SELECT
        T.Team_ID,
        T.Team_Name,
        U.User_ID,
        U.First_Name,
        U.Last_Name,
        U.Email_Address,
        U.Mobile_Number

    -- Start with the TEAM table
    FROM TEAM T

    -- Connect the team to its members
    INNER JOIN TEAM_MEMBERSHIP TM
        ON T.Team_ID = TM.Team_ID

    -- Connect each team member to their user information
    INNER JOIN USER_ U
        ON TM.User_ID = U.User_ID

    -- Only display members of the specified team
    WHERE T.Team_ID = @Team_ID

    -- Sort members alphabetically by last name
    ORDER BY U.Last_Name, U.First_Name;
END;

GO

EXEC dbo.sp_TeamMembers 1;





-- ============================================================
-- Function 1: GetDonationCount
-- Purpose: Calculates and returns the number of donations
--          received by a specific project.
-- ============================================================
GO
CREATE FUNCTION dbo.GetDonationCount
(
    @Project_ID INT             -- Project ID used to identify the project
)
RETURNS INT
AS
BEGIN
    -- Variable used to store the number of donations
    DECLARE @DonationCount INT;

    -- Count the donations associated with the specified project
    SELECT @DonationCount = COUNT(Donation_Number)
    FROM DONATION
    WHERE Project_ID = @Project_ID;

    -- Return 0 if the project has no donations
    RETURN ISNULL(@DonationCount, 0);
END;

GO

SELECT dbo.GetDonationCount(1) AS Number_Of_Donations;


--======================================================================
/*Function 2

Name			  : dbo.GetTotalDonations

Base Tables/VIEWS : DONATION

Purpose			  : To calculate total donations for a project

TYPE ( IN/OUT/IN-OUT) : IN-OUT
========================================================================*/

GO
CREATE FUNCTION dbo.GetTotalDonations
(
    @Project_ID INT
)
RETURNS DECIMAL(12,2)
AS
BEGIN
    DECLARE @Total DECIMAL(12,2);

    SELECT @Total = SUM(Donation_Amount)
    FROM DONATION
    WHERE Project_ID = @Project_ID;

    RETURN ISNULL(@Total, 0);
END;
GO

SELECT dbo.GetTotalDonations(1) AS Total_Donations;
--====================================================================
/*Transaction 1

Base Tables/VIEWS : PROJECT, COMMERCIAL_PROJECT

Purpose			  : Create a project and its commercial information
=======================================================================*/

BEGIN TRANSACTION;

BEGIN TRY

    INSERT INTO PROJECT
        (Posted_Date, Description, Closing_Date, Target_Amount, Team_ID)
    VALUES
        ('2026-10-06',
         'New commercial technology project',
         '2026-12-31',
         50000.00,
         1);

    DECLARE @Project_ID2 INT = SCOPE_IDENTITY();

    INSERT INTO COMMERCIAL_PROJECT
        (Project_ID, Profit_Margin)
    VALUES
        (@Project_ID2, 20.00);

    COMMIT TRANSACTION;

END TRY

BEGIN CATCH

    ROLLBACK TRANSACTION;

    PRINT 'Transaction failed: ' + ERROR_MESSAGE();

END CATCH;

--=====================================================================
/*Transaction 2

Base Tables/VIEWS : DONATION

Purpose			  : Create a project and its commercial information
--====================================================================*/

BEGIN TRANSACTION;

BEGIN TRY

    INSERT INTO DONATION
        (User_ID, Donation_Number, Project_ID, Donation_Date, Donation_Amount)
    VALUES
        (1, 1, 1, '2026-10-06', 1000.00);

    DECLARE @TotalDonations DECIMAL(12,2);

    SET @TotalDonations = dbo.GetTotalDonations(1);

    PRINT 'Total donations for Project 1: '
          + CAST(@TotalDonations AS VARCHAR(20));

    COMMIT TRANSACTION;

END TRY

BEGIN CATCH

    ROLLBACK TRANSACTION;

    PRINT 'Donation failed: ' + ERROR_MESSAGE();

END CATCH;








--DEMO 3





-- Trigger 1
-- Prevents total donations for a project from exceeding its funding target.
-- Base Tables: DONATION, PROJECT

GO
CREATE OR ALTER TRIGGER dbo.trg_PreventProjectOverfunding
ON dbo.DONATION
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Check the total donations for every affected project.
    IF EXISTS (
        SELECT I.Project_ID
        FROM inserted I
        INNER JOIN dbo.PROJECT P
            ON I.Project_ID = P.Project_ID
        GROUP BY I.Project_ID, P.Target_Amount
        HAVING (
            SELECT SUM(D.Donation_Amount)
            FROM dbo.DONATION D
            WHERE D.Project_ID = I.Project_ID
        ) > P.Target_Amount
    )
    BEGIN
        -- Reject the transaction if the funding target is exceeded.
        ROLLBACK TRANSACTION;

        THROW 50003,
              'Donation rejected: Project funding target exceeded.',
              1;
    END;
END;
GO

/*-- Test: Attempt to exceed the project's funding target.
INSERT INTO dbo.DONATION
    (User_ID, Donation_Number, Project_ID,
     Donation_Date, Donation_Amount)
VALUES
    (1, 999, 1, GETDATE(), 500000.00);*/




-- Trigger 2
-- Purpose: Reject donations after a project's closing date.
-- Base Tables: DONATION, PROJECT
GO
CREATE OR ALTER TRIGGER dbo.trg_PreventDonationAfterClosing
ON dbo.DONATION
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Check whether a donation targets a project that has closed.
    IF EXISTS (
        SELECT 1
        FROM inserted AS I
        INNER JOIN dbo.PROJECT AS P
            ON I.Project_ID = P.Project_ID
        WHERE P.Closing_Date < CAST(GETDATE() AS DATE)
    )
    BEGIN
        -- Cancel the transaction if the project has closed.
        ROLLBACK TRANSACTION;

        THROW 50002,
              'Donations cannot be made to closed projects.',
              1;
    END;
END;

GO

/*-- Test 2: Attempt to donate to a closed project.
INSERT INTO dbo.DONATION
    (User_ID, Donation_Number, Project_ID,
     Donation_Date, Donation_Amount)
VALUES
    (1, 998, 1, GETDATE(), 100.00)*/




/*-- Display triggers created on the DONATION table.
SELECT
    name AS Trigger_Name,
    is_disabled AS Is_Disabled
FROM sys.triggers
WHERE parent_id = OBJECT_ID('dbo.DONATION');*/
--------------------------------------------------------------------------------------
/*	Trigger 3
	Base Tables:
	Purpose: 
*/
CREATE TABLE Project_Log (
    Log_ID INT IDENTITY(1,1) PRIMARY KEY,
    Project_ID INT,
    Team_Member_ID INT,
    Project_Date DATE,
    Description VARCHAR(500),
    Date_Logged DATETIME DEFAULT GETDATE()
);

GO

CREATE TRIGGER trg_NewProjectLog
ON PROJECT
AFTER INSERT
AS
BEGIN
    INSERT INTO Project_Log
    (
        Project_ID,
        Team_Member_ID,
        Project_Date,
        Description
    )
    SELECT
        i.Project_ID,
        tm.User_ID,
        i.Posted_Date,
        i.Description
    FROM inserted i
    INNER JOIN TEAM_MEMBERSHIP tm
        ON i.Team_ID = tm.Team_ID;
END;
GO
--============================================================


/*	Trigger 4
	Base Tables : Project, Donation
	Purpose: To prevent the target amount from being lowered 
	below the amount of money already raised.
*/

CREATE TABLE AUDIT_LOG (
    Audit_ID INT IDENTITY(1,1) PRIMARY KEY,
    Audit_Action VARCHAR(20),
    Audit_Table VARCHAR(50),
    Record_ID INT,
    Action_Date DATETIME DEFAULT GETDATE()
);
GO
CREATE TRIGGER trg_Target_Amount
ON PROJECT AFTER UPDATE
AS
BEGIN
    IF UPDATE(Target_Amount)
    BEGIN
        IF EXISTS (
            SELECT 1
            FROM inserted i
            WHERE i.Target_Amount < (
                SELECT COALESCE(SUM(D.Donation_Amount), 0)
                FROM DONATION D
                WHERE D.Project_ID = i.Project_ID ))
        BEGIN
            INSERT INTO AUDIT_LOG (Audit_Action, Audit_Table, Record_ID)
            SELECT 'FAILED UPDATE', 'PROJECT', i.Project_ID
            FROM inserted i
            WHERE i.Target_Amount < (
                SELECT COALESCE(SUM(D.Donation_Amount), 0)
                FROM DONATION D
                WHERE D.Project_ID = i.Project_ID);
            ROLLBACK TRANSACTION;
            THROW 50004, 'Target amount cannot be lower than the amount already raised.', 1;
        END;
		END;
END;
GO

/*UPDATE PROJECT
SET Target_Amount = 50000
WHERE Project_ID = 1;*/


/*	Trigger 5
	Table: Project, Donation
	Purpose: To ensure the closing date is not set 
	before the date of an existing donation.
*/
GO
CREATE TRIGGER trg_Closing_Date
ON PROJECT AFTER UPDATE
AS
BEGIN
    IF UPDATE(Closing_Date)
    BEGIN
        IF EXISTS (
            SELECT 1
            FROM inserted i
            WHERE i.Closing_Date < (
                SELECT MAX(D.Donation_Date)
                FROM DONATION D
                WHERE D.Project_ID = i.Project_ID))
        BEGIN
            INSERT INTO AUDIT_LOG (Audit_Action, Audit_Table, Record_ID)
            SELECT 'FAILED UPDATE', 'PROJECT', i.Project_ID
            FROM inserted i
            WHERE i.Closing_Date < (
                SELECT MAX(D.Donation_Date)
                FROM DONATION D
                WHERE D.Project_ID = i.Project_ID );
            ROLLBACK TRANSACTION;
            THROW 50004, 'Closing date cannot be before an existing donation date.', 1;
        END;
		END;
END;
GO
/*
/*UPDATE PROJECT
SET Closing_Date = '2020-10-20'
WHERE Project_ID = 1;*/

--================================================================================================================================
/*	Security Feature 1 - Roles and Logins
	Purpose: To implement role based access controls*/

-- To create 3 roles
CREATE ROLE Admin;
CREATE ROLE TeamMember;
CREATE ROLE [User];

-- Grants admins full database control 
GRANT CONTROL ON SCHEMA::dbo TO Admin;

--TeamMember access permissions (view, insert and update on all team projects)

-- Allow team members to view projects
GRANT SELECT ON dbo.PROJECT TO TeamMember;
GRANT SELECT ON dbo.COMMERCIAL_PROJECT TO TeamMember;
GRANT SELECT ON dbo.CHARITY_PROJECT TO TeamMember;

-- Allow team members to create projects
GRANT INSERT ON dbo.PROJECT TO TeamMember;
GRANT INSERT ON dbo.COMMERCIAL_PROJECT TO TeamMember;
GRANT INSERT ON dbo.CHARITY_PROJECT TO TeamMember;

-- Allow team members to update projects
GRANT UPDATE ON dbo.PROJECT TO TeamMember;
GRANT UPDATE ON dbo.COMMERCIAL_PROJECT TO TeamMember;
GRANT UPDATE ON dbo.CHARITY_PROJECT TO TeamMember;


-- Grants permission for users to insert new user records
GRANT INSERT ON dbo.USER_ TO [User];

/*Select *
From TEAM_MEMBERSHIP;

select * 
from DONATION;

select * 
from user_;

INSERT INTO USER_
(First_Name, Last_Name, Email_Address, Mobile_Number,
 Street_Name, Street_Number, City, Country, Postal_Zone)
VALUES
('James', 'Ralph', 'james.ralph@email.com', '8765615601',
 'Patrick City', '23', 'Kingston', 'Jamaica', 'JMKN01')
 */
GO
USE master;
GO

CREATE LOGIN AdminAccount
WITH PASSWORD = 'AdminPass123!';

CREATE LOGIN TeamMemberAccount
WITH PASSWORD = 'TeamPass123!';

CREATE LOGIN RegularUserAccount
WITH PASSWORD = 'UserPass123!';
GO

USE NEWCORP_DB;
GO

CREATE USER AdminAccount
FOR LOGIN AdminAccount;

CREATE USER TeamMemberAccount
FOR LOGIN TeamMemberAccount;

CREATE USER RegularUserAccount
FOR LOGIN RegularUserAccount;
GO

ALTER ROLE Admin ADD MEMBER AdminAccount;
ALTER ROLE TeamMember ADD MEMBER TeamMemberAccount;
ALTER ROLE [User] ADD MEMBER RegularUserAccount;

SELECT
    DP1.name AS Role_Name,
    DP2.name AS User_Name
FROM sys.database_role_members AS DRM
JOIN sys.database_principals AS DP1
    ON DRM.role_principal_id = DP1.principal_id
JOIN sys.database_principals AS DP2
    ON DRM.member_principal_id = DP2.principal_id
WHERE DP1.name IN ('Admin', 'TeamMember', 'User');

--====================================================================================
/*	Security Feature 2 - Backup
	Purpose: To backup the full database to drive*/
--====================================================================================

BACKUP DATABASE NEWCORP_DB
TO DISK = 'C:\SQLBackups\NEWCORP_DB.bak' --Location depends on device
WITH INIT;

--====================================================================================
/* Security feature 3 - Application Security*/

-- Stored procedure which allows the removal of a team member from a team using their full name and id
--====================================================================================

GO
CREATE PROCEDURE RemoveTeamMember
    @User_ID INT,
    @Full_Name VARCHAR(101),
    @Team_ID INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Verify that the user ID and full name match
    IF NOT EXISTS (
        SELECT 1
        FROM USER_
        WHERE User_ID = @User_ID
          AND CONCAT(First_Name, ' ', Last_Name) = @Full_Name
    )
    BEGIN
        THROW 50001, 'User ID and full name do not match.', 1;
    END;

    -- Check that the user belongs to the specified team
    IF NOT EXISTS (
        SELECT 1
        FROM TEAM_MEMBERSHIP
        WHERE User_ID = @User_ID
          AND Team_ID = @Team_ID
    )
    BEGIN
        THROW 50002, 'User is not a member of this team.', 1;
    END;

    -- Remove the user from the team
    DELETE FROM TEAM_MEMBERSHIP
    WHERE User_ID = @User_ID
      AND Team_ID = @Team_ID;

    PRINT 'Team member successfully removed.';
END;
GO

--Allows team members access to this procedure rather than access to delete records in the table
GRANT EXECUTE ON dbo.RemoveTeamMember TO TeamMember;
GO

EXEC dbo.RemoveTeamMember
    @User_ID = 1,
    @Full_Name = 'John Brown',
    @Team_ID = 1;

	select * from 
	TEAM_MEMBERSHIP;
	select * from
	USER_;

	*/
--=================================================================================================
-- NEWCORP DATABASE ENHANCEMENTS
-- Added after the original assignment SQL so the original work remains intact.
-- These additions support the proposed website workflow: user accounts, team leadership,
-- project review, project creation/editing, membership management, donations and moderation.
--
-- IMPORTANT DESIGN NOTES:
-- 1. APP_ROLE is for WEBSITE account permissions (RegisteredUser / Moderator).
--    TeamMember is derived from TEAM_MEMBERSHIP because a user can belong to several teams
--    while also donating as an ordinary registered user.
-- 2. The existing SQL Server roles Admin, TeamMember and [User] are DATABASE roles and are
--    intentionally kept separate from APP_ROLE.
-- 3. The backend must hash passwords before calling sp_RegisterUser. Never store raw passwords.
-- 4. Website authorization must still be enforced in the backend. Do not trust a User_ID
--    supplied by the browser; use the authenticated session's user ID.
-- 5. Existing seeded users receive the RegisteredUser role but have no password hash.
--    They must complete a password setup/reset flow before they can log in to the website.
--=================================================================================================
GO

---------------------------------------------------------------------------------------------------
-- A. Website account roles and account fields (SECURITY FEATURE 1)
---------------------------------------------------------------------------------------------------
CREATE TABLE dbo.APP_ROLE
(
    Role_ID INT IDENTITY(1,1) NOT NULL,
    Role_Name VARCHAR(30) NOT NULL,
    Role_Description VARCHAR(200) NULL,
    CONSTRAINT PK_APP_ROLE PRIMARY KEY (Role_ID),
    CONSTRAINT UQ_APP_ROLE_Role_Name UNIQUE (Role_Name)
);
GO

INSERT INTO dbo.APP_ROLE (Role_Name, Role_Description)
VALUES
    ('RegisteredUser', 'Standard NewCorp website account'),
    ('Moderator', 'Website moderator who reviews projects and manages accounts');
GO

ALTER TABLE dbo.USER_
ADD
    Password_Hash NVARCHAR(255) NULL,
    Is_Active BIT NOT NULL CONSTRAINT DF_USER_Is_Active DEFAULT (1),
    Role_ID INT NULL;
GO

-- Existing demonstration accounts are assigned the ordinary website role.
UPDATE U
SET U.Role_ID = R.Role_ID
FROM dbo.USER_ AS U
CROSS JOIN dbo.APP_ROLE AS R
WHERE R.Role_Name = 'RegisteredUser';
GO

ALTER TABLE dbo.USER_
ALTER COLUMN Role_ID INT NOT NULL;
GO

ALTER TABLE dbo.USER_
ADD CONSTRAINT FK_USER_APP_ROLE
FOREIGN KEY (Role_ID) REFERENCES dbo.APP_ROLE(Role_ID);
GO

---------------------------------------------------------------------------------------------------
-- B. Team leadership
-- A leader must also be a member of the same team. The composite foreign key enforces this.
-- Existing teams are left without a leader until one is assigned through sp_SetTeamLeader.
---------------------------------------------------------------------------------------------------
ALTER TABLE dbo.TEAM
ADD Leader_User_ID INT NULL;
GO

ALTER TABLE dbo.TEAM
ADD CONSTRAINT FK_TEAM_LeaderMembership
FOREIGN KEY (Leader_User_ID, Team_ID)
REFERENCES dbo.TEAM_MEMBERSHIP (User_ID, Team_ID);
GO

---------------------------------------------------------------------------------------------------
-- C. Project moderation / publication status
-- Existing sample projects are marked Approved so they remain visible in public listings.
-- Projects created through the new website procedures start as Pending for moderator review.
---------------------------------------------------------------------------------------------------
ALTER TABLE dbo.PROJECT
ADD
    Approval_Status VARCHAR(20) NOT NULL
        CONSTRAINT DF_PROJECT_Approval_Status DEFAULT ('Pending'),
    Approved_By INT NULL,
    Approval_Date DATETIME2(0) NULL,
    Rejection_Reason NVARCHAR(500) NULL;
GO

UPDATE dbo.PROJECT
SET Approval_Status = 'Approved';
GO

ALTER TABLE dbo.PROJECT
ADD CONSTRAINT CK_PROJECT_Approval_Status
CHECK (Approval_Status IN ('Pending', 'Approved', 'Rejected'));
GO

ALTER TABLE dbo.PROJECT
ADD CONSTRAINT FK_PROJECT_Approved_By
FOREIGN KEY (Approved_By) REFERENCES dbo.USER_(User_ID);
GO

---------------------------------------------------------------------------------------------------
-- D. Additional integrity constraints
-- These validate basic values regardless of whether data is inserted through the website
-- or directly in SQL Server. Existing sample data satisfies these checks.
---------------------------------------------------------------------------------------------------
ALTER TABLE dbo.PROJECT
ADD CONSTRAINT CK_PROJECT_Target_Amount_Positive
CHECK (Target_Amount > 0);
GO

ALTER TABLE dbo.PROJECT
ADD CONSTRAINT CK_PROJECT_Closing_After_Posted
CHECK (Closing_Date >= Posted_Date);
GO

ALTER TABLE dbo.DONATION
ADD CONSTRAINT CK_DONATION_Amount_Positive
CHECK (Donation_Amount > 0);
GO

ALTER TABLE dbo.DONATION
ADD CONSTRAINT CK_DONATION_Number_Positive
CHECK (Donation_Number > 0);
GO

ALTER TABLE dbo.COMMERCIAL_PROJECT
ADD CONSTRAINT CK_COMMERCIAL_PROJECT_Profit_Margin
CHECK (Profit_Margin >= 0 AND Profit_Margin <= 100);
GO

-- Extend the existing audit table so website actions can identify the acting account.
ALTER TABLE dbo.AUDIT_LOG
ADD
    Actor_User_ID INT NULL,
    Audit_Details NVARCHAR(500) NULL;
GO

ALTER TABLE dbo.AUDIT_LOG
ADD CONSTRAINT FK_AUDIT_LOG_Actor
FOREIGN KEY (Actor_User_ID) REFERENCES dbo.USER_(User_ID);
GO

SELECT * 
FROM AUDIT_LOG

---------------------------------------------------------------------------------------------------
-- E. Registration and profile management
-- The Python backend must hash the password and pass only the resulting hash to this procedure. (SECURITY FEATURE 2)
---------------------------------------------------------------------------------------------------
GO
CREATE OR ALTER PROCEDURE dbo.sp_RegisterUser
    @First_Name VARCHAR(50),
    @Last_Name VARCHAR(50),
    @Email_Address VARCHAR(50),
    @Password_Hash NVARCHAR(255),
    @Mobile_Number VARCHAR(20) = NULL,
    @Street_Name VARCHAR(100) = NULL,
    @Street_Number VARCHAR(10) = NULL,
    @City VARCHAR(50) = NULL,
    @Country VARCHAR(50) = NULL,
    @Postal_Zone VARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NULLIF(LTRIM(RTRIM(@First_Name)), '') IS NULL
       OR NULLIF(LTRIM(RTRIM(@Last_Name)), '') IS NULL
       OR NULLIF(LTRIM(RTRIM(@Email_Address)), '') IS NULL
       OR NULLIF(LTRIM(RTRIM(@Password_Hash)), '') IS NULL
    BEGIN
        THROW 51001, 'First name, last name, email and password hash are required.', 1;
    END;

    IF EXISTS (SELECT 1 FROM dbo.USER_ WHERE Email_Address = @Email_Address)
    BEGIN
        THROW 51002, 'An account with this email address already exists.', 1;
    END;

    DECLARE @RegisteredUserRole_ID INT;
    SELECT @RegisteredUserRole_ID = Role_ID
    FROM dbo.APP_ROLE
    WHERE Role_Name = 'RegisteredUser';

    INSERT INTO dbo.USER_
    (
        First_Name, Last_Name, Email_Address, Password_Hash,
        Mobile_Number, Street_Name, Street_Number,
        City, Country, Postal_Zone, Role_ID, Is_Active
    )
    VALUES
    (
        @First_Name, @Last_Name, @Email_Address, @Password_Hash,
        @Mobile_Number, @Street_Name, @Street_Number,
        @City, @Country, @Postal_Zone, @RegisteredUserRole_ID, 1
    );

    SELECT CAST(SCOPE_IDENTITY() AS INT) AS New_User_ID;
END;
GO

-- A user may edit their own profile; a moderator may edit another user's profile.
CREATE OR ALTER PROCEDURE dbo.sp_UpdateUserProfile
    @Actor_User_ID INT,
    @Target_User_ID INT,
    @First_Name VARCHAR(50),
    @Last_Name VARCHAR(50),
    @Email_Address VARCHAR(50),
    @Mobile_Number VARCHAR(20) = NULL,
    @Street_Name VARCHAR(100) = NULL,
    @Street_Number VARCHAR(10) = NULL,
    @City VARCHAR(50) = NULL,
    @Country VARCHAR(50) = NULL,
    @Postal_Zone VARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.USER_ AS A
        LEFT JOIN dbo.APP_ROLE AS R ON A.Role_ID = R.Role_ID
        WHERE A.User_ID = @Actor_User_ID
          AND A.Is_Active = 1
          AND (A.User_ID = @Target_User_ID OR R.Role_Name = 'Moderator')
    )
    BEGIN
        THROW 51003, 'You are not authorized to update this account.', 1;
    END;

    IF EXISTS
    (
        SELECT 1 FROM dbo.USER_
        WHERE Email_Address = @Email_Address
          AND User_ID <> @Target_User_ID
    )
    BEGIN
        THROW 51004, 'That email address is already in use.', 1;
    END;

    UPDATE dbo.USER_
    SET First_Name = @First_Name,
        Last_Name = @Last_Name,
        Email_Address = @Email_Address,
        Mobile_Number = @Mobile_Number,
        Street_Name = @Street_Name,
        Street_Number = @Street_Number,
        City = @City,
        Country = @Country,
        Postal_Zone = @Postal_Zone
    WHERE User_ID = @Target_User_ID;

    SELECT @@ROWCOUNT AS Rows_Updated;
END;
GO

---------------------------------------------------------------------------------------------------
-- F. Team creation, joining, leaving and leadership
-- Team membership is many-to-many. A user can join multiple teams.
---------------------------------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.sp_CreateTeam
    @Creator_User_ID INT,
    @Team_Name VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF NOT EXISTS
    (
        SELECT 1 FROM dbo.USER_
        WHERE User_ID = @Creator_User_ID AND Is_Active = 1
    )
        THROW 51010, 'An active user account is required to create a team.', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        INSERT INTO dbo.TEAM (Team_Name, Created_Date)
        VALUES (@Team_Name, CAST(GETDATE() AS DATE));

        DECLARE @New_Team_ID INT = CAST(SCOPE_IDENTITY() AS INT);

        INSERT INTO dbo.TEAM_MEMBERSHIP (User_ID, Team_ID)
        VALUES (@Creator_User_ID, @New_Team_ID);

        UPDATE dbo.TEAM
        SET Leader_User_ID = @Creator_User_ID
        WHERE Team_ID = @New_Team_ID;

        COMMIT TRANSACTION;
        SELECT @New_Team_ID AS New_Team_ID;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_JoinTeam
    @User_ID INT,
    @Team_ID INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.USER_ WHERE User_ID = @User_ID AND Is_Active = 1)
        THROW 51011, 'An active user account is required to join a team.', 1;

    IF NOT EXISTS (SELECT 1 FROM dbo.TEAM WHERE Team_ID = @Team_ID)
        THROW 51012, 'The selected team does not exist.', 1;

    IF EXISTS
    (
        SELECT 1 FROM dbo.TEAM_MEMBERSHIP
        WHERE User_ID = @User_ID AND Team_ID = @Team_ID
    )
        THROW 51013, 'This user is already a member of the selected team.', 1;

    INSERT INTO dbo.TEAM_MEMBERSHIP (User_ID, Team_ID)
    VALUES (@User_ID, @Team_ID);
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_LeaveTeam
    @User_ID INT,
    @Team_ID INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS
    (
        SELECT 1 FROM dbo.TEAM_MEMBERSHIP
        WHERE User_ID = @User_ID AND Team_ID = @Team_ID
    )
        THROW 51014, 'The user is not a member of this team.', 1;

    IF EXISTS
    (
        SELECT 1 FROM dbo.TEAM
        WHERE Team_ID = @Team_ID AND Leader_User_ID = @User_ID
    )
        THROW 51015, 'The team leader must appoint another leader before leaving the team.', 1;

    DELETE FROM dbo.TEAM_MEMBERSHIP
    WHERE User_ID = @User_ID AND Team_ID = @Team_ID;
END;
GO

-- Only the current team leader or a moderator can appoint a new leader.
CREATE OR ALTER PROCEDURE dbo.sp_SetTeamLeader
    @Actor_User_ID INT,
    @Team_ID INT,
    @New_Leader_User_ID INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.TEAM AS T
        LEFT JOIN dbo.USER_ AS A ON A.User_ID = @Actor_User_ID
        LEFT JOIN dbo.APP_ROLE AS R ON R.Role_ID = A.Role_ID
        WHERE T.Team_ID = @Team_ID
          AND (T.Leader_User_ID = @Actor_User_ID OR R.Role_Name = 'Moderator')
          AND A.Is_Active = 1
    )
        THROW 51016, 'Only the current team leader or a moderator can change team leadership.', 1;

    IF NOT EXISTS
    (
        SELECT 1 FROM dbo.TEAM_MEMBERSHIP
        WHERE User_ID = @New_Leader_User_ID AND Team_ID = @Team_ID
    )
        THROW 51017, 'The new team leader must already belong to the team.', 1;

    UPDATE dbo.TEAM
    SET Leader_User_ID = @New_Leader_User_ID
    WHERE Team_ID = @Team_ID;
END;
GO

-- A team leader or moderator may remove a member. The leader cannot be removed using this action.
CREATE OR ALTER PROCEDURE dbo.sp_LeaderRemoveTeamMember
    @Actor_User_ID INT,
    @Target_User_ID INT,
    @Team_ID INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.TEAM AS T
        JOIN dbo.USER_ AS A ON A.User_ID = @Actor_User_ID
        LEFT JOIN dbo.APP_ROLE AS R ON R.Role_ID = A.Role_ID
        WHERE T.Team_ID = @Team_ID
          AND A.Is_Active = 1
          AND (T.Leader_User_ID = @Actor_User_ID OR R.Role_Name = 'Moderator')
    )
        THROW 51018, 'Only the team leader or a moderator can remove a team member.', 1;

    IF EXISTS
    (
        SELECT 1 FROM dbo.TEAM
        WHERE Team_ID = @Team_ID AND Leader_User_ID = @Target_User_ID
    )
        THROW 51019, 'The team leader must be changed before this member can be removed.', 1;

    DELETE FROM dbo.TEAM_MEMBERSHIP
    WHERE User_ID = @Target_User_ID AND Team_ID = @Team_ID;

    IF @@ROWCOUNT = 0
        THROW 51020, 'The specified user is not a member of this team.', 1;
END;
GO

---------------------------------------------------------------------------------------------------
-- G. Project creation and editing
-- New projects are submitted as Pending and become publicly visible after moderator approval. (SECURITY FEATURE 3)
---------------------------------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.sp_CreateCharityProject
    @Actor_User_ID INT,
    @Team_ID INT,
    @Description VARCHAR(500),
    @Closing_Date DATE,
    @Target_Amount DECIMAL(12,2),
    @Beneficiaries VARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF NOT EXISTS
    (
        SELECT 1 FROM dbo.TEAM_MEMBERSHIP
        WHERE User_ID = @Actor_User_ID AND Team_ID = @Team_ID
    )
        THROW 51030, 'Only a member of the selected team can create its projects.', 1;

    IF @Description IS NULL OR LTRIM(RTRIM(@Description)) = ''
       OR @Beneficiaries IS NULL OR LTRIM(RTRIM(@Beneficiaries)) = ''
       OR @Target_Amount IS NULL OR @Target_Amount <= 0
       OR @Closing_Date IS NULL OR @Closing_Date < CAST(GETDATE() AS DATE)
        THROW 51031, 'A description, beneficiaries, positive target and future closing date are required.', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        INSERT INTO dbo.PROJECT
            (Posted_Date, Description, Closing_Date, Target_Amount, Team_ID, Approval_Status)
        VALUES
            (CAST(GETDATE() AS DATE), @Description, @Closing_Date,
             @Target_Amount, @Team_ID, 'Pending');

        DECLARE @New_Project_ID INT = CAST(SCOPE_IDENTITY() AS INT);

        INSERT INTO dbo.CHARITY_PROJECT (Project_ID, Beneficiaries)
        VALUES (@New_Project_ID, @Beneficiaries);

        INSERT INTO dbo.AUDIT_LOG
            (Audit_Action, Audit_Table, Record_ID, Actor_User_ID, Audit_Details)
        VALUES
            ('PROJECT_CREATED', 'PROJECT', @New_Project_ID, @Actor_User_ID,
             'Charity project submitted for moderator approval.');

        COMMIT TRANSACTION;
        SELECT @New_Project_ID AS New_Project_ID, 'Pending' AS Approval_Status;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_CreateCommercialProject
    @Actor_User_ID INT,
    @Team_ID INT,
    @Description VARCHAR(500),
    @Closing_Date DATE,
    @Target_Amount DECIMAL(12,2),
    @Profit_Margin DECIMAL(5,2)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF NOT EXISTS
    (
        SELECT 1 FROM dbo.TEAM_MEMBERSHIP
        WHERE User_ID = @Actor_User_ID AND Team_ID = @Team_ID
    )
        THROW 51032, 'Only a member of the selected team can create its projects.', 1;

    IF @Description IS NULL OR LTRIM(RTRIM(@Description)) = ''
       OR @Target_Amount IS NULL OR @Target_Amount <= 0
       OR @Closing_Date IS NULL OR @Closing_Date < CAST(GETDATE() AS DATE)
       OR @Profit_Margin IS NULL OR @Profit_Margin < 0 OR @Profit_Margin > 100
        THROW 51033, 'Check the description, target amount, closing date and profit margin.', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        INSERT INTO dbo.PROJECT
            (Posted_Date, Description, Closing_Date, Target_Amount, Team_ID, Approval_Status)
        VALUES
            (CAST(GETDATE() AS DATE), @Description, @Closing_Date,
             @Target_Amount, @Team_ID, 'Pending');

        DECLARE @New_Project_ID INT = CAST(SCOPE_IDENTITY() AS INT);

        INSERT INTO dbo.COMMERCIAL_PROJECT (Project_ID, Profit_Margin)
        VALUES (@New_Project_ID, @Profit_Margin);

        INSERT INTO dbo.AUDIT_LOG
            (Audit_Action, Audit_Table, Record_ID, Actor_User_ID, Audit_Details)
        VALUES
            ('PROJECT_CREATED', 'PROJECT', @New_Project_ID, @Actor_User_ID,
             'Commercial project submitted for moderator approval.');

        COMMIT TRANSACTION;
        SELECT @New_Project_ID AS New_Project_ID, 'Pending' AS Approval_Status;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

-- Project editing is restricted to members of the team that owns the project.
-- The existing target-amount and closing-date triggers remain active as additional safeguards.
CREATE OR ALTER PROCEDURE dbo.sp_UpdateTeamProject
    @Actor_User_ID INT,
    @Project_ID INT,
    @Description VARCHAR(500),
    @Closing_Date DATE,
    @Target_Amount DECIMAL(12,2)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.PROJECT AS P
        JOIN dbo.TEAM_MEMBERSHIP AS TM
          ON TM.Team_ID = P.Team_ID
        WHERE P.Project_ID = @Project_ID
          AND TM.User_ID = @Actor_User_ID
    )
        THROW 51034, 'Only a member of the projects team can edit it.', 1;

    UPDATE dbo.PROJECT
    SET Description = @Description,
        Closing_Date = @Closing_Date,
        Target_Amount = @Target_Amount
    WHERE Project_ID = @Project_ID;

    INSERT INTO dbo.AUDIT_LOG
        (Audit_Action, Audit_Table, Record_ID, Actor_User_ID, Audit_Details)
    VALUES
        ('PROJECT_UPDATED', 'PROJECT', @Project_ID, @Actor_User_ID,
         'Project details updated by a member of its team.');
END;
GO

---------------------------------------------------------------------------------------------------
-- H. Donation processing
-- Donation_Number is generated per user, allowing a user to donate repeatedly.
-- Locks protect the per-user number allocation and project funding check during concurrent requests.
---------------------------------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.sp_MakeDonation
    @User_ID INT,
    @Project_ID INT,
    @Donation_Amount DECIMAL(12,2)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF @Donation_Amount IS NULL OR @Donation_Amount <= 0
        THROW 51040, 'Donation amount must be greater than zero.', 1;

    DECLARE @Target_Amount DECIMAL(12,2);
    DECLARE @Closing_Date DATE;
    DECLARE @Approval_Status VARCHAR(20);
    DECLARE @Amount_Already_Raised DECIMAL(12,2);
    DECLARE @Next_Donation_Number INT;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF NOT EXISTS
        (
            SELECT 1 FROM dbo.USER_
            WHERE User_ID = @User_ID AND Is_Active = 1
        )
            THROW 51041, 'An active user account is required to donate.', 1;

        -- Lock the project row so simultaneous donations cannot both pass an outdated total check.
        SELECT
            @Target_Amount = Target_Amount,
            @Closing_Date = Closing_Date,
            @Approval_Status = Approval_Status
        FROM dbo.PROJECT WITH (UPDLOCK, HOLDLOCK)
        WHERE Project_ID = @Project_ID;

        IF @Target_Amount IS NULL
            THROW 51042, 'The selected project does not exist.', 1;

        IF @Approval_Status <> 'Approved'
            THROW 51043, 'Donations are accepted only for approved projects.', 1;

        IF @Closing_Date < CAST(GETDATE() AS DATE)
            THROW 51044, 'The project has passed its closing date.', 1;

        SELECT @Amount_Already_Raised = COALESCE(SUM(Donation_Amount), 0)
        FROM dbo.DONATION
        WHERE Project_ID = @Project_ID;

        IF @Amount_Already_Raised + @Donation_Amount > @Target_Amount
            THROW 51045, 'The donation would cause the project to exceed its funding target.', 1;

        -- The DONATION primary key is (User_ID, Donation_Number); this allocates the next
        -- number for this user while holding the relevant key-range lock.
        SELECT @Next_Donation_Number = COALESCE(MAX(Donation_Number), 0) + 1
        FROM dbo.DONATION WITH (UPDLOCK, HOLDLOCK)
        WHERE User_ID = @User_ID;

        INSERT INTO dbo.DONATION
            (User_ID, Donation_Number, Project_ID, Donation_Date, Donation_Amount)
        VALUES
            (@User_ID, @Next_Donation_Number, @Project_ID, CAST(GETDATE() AS DATE), @Donation_Amount);

        INSERT INTO dbo.AUDIT_LOG
            (Audit_Action, Audit_Table, Record_ID, Actor_User_ID, Audit_Details)
        VALUES
            ('DONATION_ADDED', 'DONATION', @Next_Donation_Number, @User_ID,
             CONCAT('Donation recorded for Project_ID ', @Project_ID,
                    '; amount: ', CONVERT(VARCHAR(30), @Donation_Amount)));

        COMMIT TRANSACTION;

        SELECT @User_ID AS User_ID,
               @Next_Donation_Number AS Donation_Number,
               @Project_ID AS Project_ID,
               @Donation_Amount AS Donation_Amount;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

---------------------------------------------------------------------------------------------------
-- I. Moderator actions: approve/reject projects and activate/deactivate accounts
-- The backend must also verify that the signed-in account is a moderator.
---------------------------------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.sp_ModerateProject
    @Moderator_User_ID INT,
    @Project_ID INT,
    @Decision VARCHAR(10),
    @Rejection_Reason NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.USER_ AS U
        JOIN dbo.APP_ROLE AS R ON R.Role_ID = U.Role_ID
        WHERE U.User_ID = @Moderator_User_ID
          AND U.Is_Active = 1
          AND R.Role_Name = 'Moderator'
    )
        THROW 51050, 'Moderator privileges are required for this action.', 1;

    SET @Decision = UPPER(@Decision);

    IF @Decision IS NULL OR @Decision NOT IN ('APPROVE', 'REJECT')
        THROW 51051, 'Decision must be APPROVE or REJECT.', 1;

    IF @Decision = 'REJECT' AND NULLIF(LTRIM(RTRIM(@Rejection_Reason)), '') IS NULL
        THROW 51052, 'A reason is required when rejecting a project.', 1;

    IF NOT EXISTS
    (
        SELECT 1 FROM dbo.PROJECT
        WHERE Project_ID = @Project_ID AND Approval_Status = 'Pending'
    )
        THROW 51053, 'Only pending projects can be moderated.', 1;

    UPDATE dbo.PROJECT
    SET Approval_Status = CASE WHEN @Decision = 'APPROVE' THEN 'Approved' ELSE 'Rejected' END,
        Approved_By = @Moderator_User_ID,
        Approval_Date = SYSDATETIME(),
        Rejection_Reason = CASE WHEN @Decision = 'REJECT' THEN @Rejection_Reason ELSE NULL END
    WHERE Project_ID = @Project_ID;

    INSERT INTO dbo.AUDIT_LOG
        (Audit_Action, Audit_Table, Record_ID, Actor_User_ID, Audit_Details)
    VALUES
        (CASE WHEN @Decision = 'APPROVE' THEN 'PROJECT_APPROVED' ELSE 'PROJECT_REJECTED' END,
         'PROJECT', @Project_ID, @Moderator_User_ID,
         CASE WHEN @Decision = 'APPROVE' THEN 'Project approved for public display.'
              ELSE CONCAT('Project rejected. Reason: ', @Rejection_Reason) END);
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_SetUserActiveStatus
    @Moderator_User_ID INT,
    @Target_User_ID INT,
    @Is_Active BIT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.USER_ AS U
        JOIN dbo.APP_ROLE AS R ON R.Role_ID = U.Role_ID
        WHERE U.User_ID = @Moderator_User_ID
          AND U.Is_Active = 1
          AND R.Role_Name = 'Moderator'
    )
        THROW 51054, 'Moderator privileges are required for this action.', 1;

    IF @Moderator_User_ID = @Target_User_ID AND @Is_Active = 0
        THROW 51055, 'A moderator cannot deactivate their own account.', 1;

    UPDATE dbo.USER_
    SET Is_Active = @Is_Active
    WHERE User_ID = @Target_User_ID;

    IF @@ROWCOUNT = 0
        THROW 51056, 'The selected user account does not exist.', 1;

    INSERT INTO dbo.AUDIT_LOG
        (Audit_Action, Audit_Table, Record_ID, Actor_User_ID, Audit_Details)
    VALUES
        (CASE WHEN @Is_Active = 1 THEN 'USER_ACTIVATED' ELSE 'USER_DEACTIVATED' END,
         'USER_', @Target_User_ID, @Moderator_User_ID,
         CASE WHEN @Is_Active = 1 THEN 'User account activated.' ELSE 'User account deactivated.' END);
END;
GO

---------------------------------------------------------------------------------------------------
-- J. Public project listing view
-- Only approved projects are returned. Closed projects remain visible as historical projects;
-- the donation procedure separately prevents donations after the closing date.
---------------------------------------------------------------------------------------------------
CREATE OR ALTER VIEW dbo.View_Public_Projects
AS
SELECT
    P.Project_ID,
    P.Description,
    P.Posted_Date,
    P.Closing_Date,
    P.Target_Amount,
    P.Team_ID,
    T.Team_Name,
    P.Approval_Status,
    CASE
        WHEN CP.Project_ID IS NOT NULL THEN 'Commercial'
        WHEN CHP.Project_ID IS NOT NULL THEN 'Charity'
        ELSE 'Unclassified'
    END AS Project_Type,
    CP.Profit_Margin,
    CHP.Beneficiaries,
    COALESCE(SUM(D.Donation_Amount), 0) AS Amount_Raised,
    P.Target_Amount - COALESCE(SUM(D.Donation_Amount), 0) AS Amount_Remaining
FROM dbo.PROJECT AS P
JOIN dbo.TEAM AS T ON T.Team_ID = P.Team_ID
LEFT JOIN dbo.COMMERCIAL_PROJECT AS CP ON CP.Project_ID = P.Project_ID
LEFT JOIN dbo.CHARITY_PROJECT AS CHP ON CHP.Project_ID = P.Project_ID
LEFT JOIN dbo.DONATION AS D ON D.Project_ID = P.Project_ID
WHERE P.Approval_Status = 'Approved'
GROUP BY
    P.Project_ID, P.Description, P.Posted_Date, P.Closing_Date,
    P.Target_Amount, P.Team_ID, T.Team_Name, P.Approval_Status,
    CP.Project_ID, CP.Profit_Margin, CHP.Project_ID, CHP.Beneficiaries;
GO

SELECT Role_ID FROM dbo.APP_ROLE WHERE Role_Name = 'Moderator';

SELECT * FROM dbo.APP_ROLE;

SELECT * FROM USER_;


---------------------------------------------------------------------------------------------------
-- K. Example moderator promotion 
---------------------------------------------------------------------------------------------------
UPDATE dbo.USER_
SET Role_ID = (SELECT Role_ID FROM dbo.APP_ROLE WHERE Role_Name = 'Moderator')
WHERE Email_Address = 'test01@example.com';
GO










---------------------------------------------------------------------------------------------------
-- L. Website integration notes
-- The website backend should call these procedures using parameterized commands:
--   Registration/profile:  sp_RegisterUser, sp_UpdateUserProfile
--   Teams:                 sp_CreateTeam, sp_JoinTeam, sp_LeaveTeam,
--                          sp_SetTeamLeader, sp_LeaderRemoveTeamMember
--   Projects:              sp_CreateCharityProject, sp_CreateCommercialProject,
--                          sp_UpdateTeamProject
--   Donations:             sp_MakeDonation
--   Moderation:            sp_ModerateProject, sp_SetUserActiveStatus
--   Public browsing:       SELECT from dbo.View_Public_Projects
--
-- Login is normally handled by the backend: retrieve the account by email, verify the submitted
-- password against Password_Hash using a password-hashing library, and create a secure session.
-- Do not expose Password_Hash to the browser. Do not rely on the old shared SQL logins as website
-- user identities. Do not grant browser clients direct SQL Server access.
---------------------------------------------------------------------------------------------------
