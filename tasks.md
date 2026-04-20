# WorldSkills Task Structure

## Task 1: Asset Management Android Application for KazMunayGas

### Overview

KazMunayGas (KMG) is expanding into new domestic and international markets and requires a centralized asset inventory system. The goal of this session is to build an **Android mobile application** that connects to a remote database via Web API. The application must allow managers to catalog all company assets, register new assets, transfer assets between departments/locations, and view transfer history. The UI must strictly follow the KMG Style Guide.

---

### Steps

1. **Set up the database** — Create a database named `Session1` on your preferred platform (MySQL or MS SQL Server) and import the provided SQL script (`Session1-MySQL.sql` or `Session1-MsSQL.sql`).

2. **Connect the application to the remote database via Web API** — The app must not connect directly to the DB; all data operations must go through a Web API layer. The company will provide the technical specifications for the data exchange interface.

3. **Implement the Asset Catalog screen (main/start screen)** — Display the list of all assets from the database. Each record shows: Asset Name, Department Name, and Asset Serial Number (SN). Add a search bar and filter controls at the top of the screen.

4. **Implement search and filtering** — The search bar (activated after typing more than 2 characters) must filter assets by Asset Name and Asset SN. Four additional filter controls must be placed above the search bar:
   - **Department** dropdown — populated from DB records
   - **Asset Group** dropdown — populated from DB records
   - **Warranty Date Range** — Start Date and End Date pickers to filter by warranty expiry
   - Filters apply immediately upon selection; multiple filters can be combined.

5. **Display result count** — At the bottom of the catalog screen, show the number of filtered results and the total number of assets in the DB (e.g., "3 assets from 35").

6. **Implement landscape orientation mode** — When the device rotates to landscape, the catalog must show only the asset list with Asset Name and SN on one line. Active filters must be preserved. Adding and editing assets is only available in landscape mode.

7. **Implement the Add New Asset screen** — Accessed via the "+" (FAB) button on the catalog screen. The form must include the following fields:
   - Asset Name (text)
   - Department (dropdown from DB)
   - Location (dropdown — shows all locations of the selected department)
   - Asset Group (dropdown from DB)
   - Accountable Party / Employee (dropdown from DB)
   - Asset Description (multi-line text)
   - Expired Warranty date (date picker, optional)
   - Asset Serial Number — auto-generated, read-only field (format: `dd/gg/nnnn`)
   - Photos — user can capture via camera or browse from device gallery (one or more photos)

8. **Implement Serial Number auto-generation algorithm** — The Asset SN is generated dynamically in the format `dd/gg/nnnn`:
   - `dd` = 2-digit Department ID (zero-padded if needed)
   - `gg` = 2-digit Asset Group ID (zero-padded if needed)
   - `nnnn` = 4-digit incrementing unique number per Department+AssetGroup combination (zero-padded if needed)
   - No two assets in the same Department and Asset Group can share the same `nnnn` number.

9. **Implement validation on Add/Edit** — The system must prevent saving two assets with the same name in the same location. All fields except Warranty Date and Photos must be filled before submitting.

10. **Implement the Edit Asset screen** — Accessed via the Edit (pencil) button next to each asset in the catalog. Location, Department, and Asset Group fields are read-only (view only). Other fields are editable. "Submit" saves changes to DB; "Back" (top) and "Cancel" (bottom) return to the main screen without saving.

11. **Implement the Asset Transfer (Move) screen** — Accessed via the Move button next to each asset in the catalog. The screen must:
    - Display Asset Name, Current Department, and Asset SN as read-only fields
    - Provide a "Destination Department" dropdown (must exclude the current department)
    - Provide a "Destination Location" dropdown (shows all locations of the selected destination department)
    - Auto-generate and display "New Asset SN" using the same `dd/gg/nnnn` algorithm for the destination department/group
    - If the asset was previously placed in the same destination department, reuse its previous SN instead of generating a new one
    - "Submit" saves the transfer to DB; "Back" (top) and "Cancel" (bottom) return to main screen

12. **Implement the Transfer History screen** — Accessed via the History (≡) button next to each asset. The screen must:
    - Show all past transfers for the asset, sorted oldest first
    - Display per record: Transfer Date, Old Department, Old Asset SN, New Department, New Asset SN
    - If no transfers occurred in the last 12 months, show an appropriate message directing the user back to the main screen
    - "Back" button at the bottom returns to the main screen

13. **Apply style guide and UX rules throughout the entire application** — See Requirements section below.

---

### Requirements

#### Platform & Architecture
* The UI must be implemented on the **Android platform** and tested only on provided mobile devices.
* All data must be processed through a **remote database via Web API** (no direct DB connection from the app).
* The database name must be `Session1`.
* The provided DB structure **must not be modified** (no table deletions, column additions/removals, or format changes).

#### UI / UX Rules
* The **KMG Style Guide** must be applied consistently throughout the entire application.
* All modules must include **meaningful validation messages and error handling** as required by KMG.
* Use **scrollbars** when list/table content exceeds the visible screen area; hide scrollbars when content fits.
* Date format must follow **ISO standard: YYYY-MM-DD** wherever dates are displayed.
* When a form or dialog is active, **operations in other forms must be disabled** (modal behavior).
* **"Delete" and "Cancel" buttons must be colored red** to prevent accidental clicks.
* When color-coding is used to differentiate rows or records, a **visual legend must be shown** on screen.
* Screenshots provided in the task document are **recommendations only** — the final solution does not need to match them exactly.
* Proper formatting and **correct use of whitespace** to display information is critically important.
* Color highlighting for field separation is at the developer's discretion.

#### Asset Catalog Screen
* Each asset record displays: **Asset Name, Department Name, Asset SN**.
* Search activates after typing **more than 2 characters** — auto-filters by Asset Name and Asset SN.
* Filter controls: Department dropdown, Asset Group dropdown, Warranty Date Range (Start + End).
* Filters apply immediately on selection.
* Bottom bar shows: count of filtered results and total count of assets in the DB.

#### Landscape Mode
* Shows only asset list with Asset Name + SN on one line per record.
* Active filters are preserved when orientation changes.
* Add/Edit actions available only in landscape mode.

#### Add / Edit Asset
* Fields: Asset Name, Department, Location, Asset Group, Accountable Party, Description (multi-line), Expired Warranty (optional), Photos (optional), Auto-generated Asset SN (read-only).
* Location dropdown filters based on selected Department.
* The system must **prevent duplicate asset names in the same location**.
* All fields except Warranty Date and Photos are **mandatory** before submission.
* "Back" (top), "Submit" and "Cancel" (bottom) — only "Submit" saves to DB.
* User can capture or upload **one or more photos** via camera or device gallery.

#### Asset SN Format: `dd/gg/nnnn`
* `dd` — 2-digit zero-padded Department ID
* `gg` — 2-digit zero-padded Asset Group ID
* `nnnn` — 4-digit zero-padded incrementing unique number within the same Department + Asset Group
* No two assets in the same Department+AssetGroup can share `nnnn`.
* All three parts must be zero-padded to their required digit counts automatically.

#### Asset Transfer
* Read-only display: Asset Name, Current Department, Asset SN.
* "Destination Department" must **exclude the current department**.
* "Destination Location" shows all locations for the selected destination department.
* "New Asset SN" is auto-generated after destination department is selected, using the same `dd/gg/nnnn` formula.
* If the asset was previously at the same destination department, **reuse the previous SN** (do not generate a new one).
* "Submit" saves transfer log to `AssetTransferLogs` table.

#### Transfer History
* Displayed fields per record: Transfer Date, Old Department, Old Asset SN, New Department, New Asset SN.
* Sorted **oldest first**.
* If no transfers in the last 12 months, show a message and redirect back to main screen.
* "Back" button at bottom returns to main screen.

#### Time Management
* All deliverables must be **fully completed and functional** by the end of the session.

---

### Database Schema

**Tables (from `Session1-MySQL.sql` / `Session1-MsSQL.sql`):**

| Table | Fields |
|---|---|
| `AssetGroups` | ID (PK), Name |
| `Employees` | ID (PK), FirstName, LastName, Phone |
| `Locations` | ID (PK), Name |
| `Departments` | ID (PK), Name |
| `DepartmentLocations` | ID (PK), DepartmentID (FK), LocationID (FK), StartDate, EndDate |
| `Assets` | ID (PK), AssetSN, AssetName, DepartmentLocationID (FK), EmployeeID (FK), AssetGroupID (FK), Description, WarrantyDate |
| `AssetPhotos` | ID (PK), AssetID (FK), AssetPhoto (BLOB) |
| `AssetTransferLogs` | ID (PK), AssetID (FK), TransferDate, FromAssetSN, ToAssetSN, FromDepartmentLocationID (FK), ToDepartmentLocationID (FK) |

**Seed data:**
- Departments: Exploration, Production, Transportation, R&D, Distribution, QHSE
- Locations: Kazan, Volka, Moscow
- Asset Groups: Hydraulic, Electrical, Mechanical
- 30 Employees pre-loaded
- 4 sample Assets pre-loaded
- 2 sample Transfer Logs pre-loaded

---

### Assessment Criteria

* Correct database connection and data loading via Web API
* Asset Catalog screen displays all required fields and is the startup screen
* Search filters by Asset Name and SN with auto-trigger after 2+ characters
* All 4 filter controls (Department, Asset Group, Warranty Date Start/End) function correctly
* Filters apply immediately on selection
* Result count shown correctly at the bottom of catalog screen
* Landscape orientation shows compact one-line list; filters preserved
* Add New Asset form contains all required fields and saves correctly to DB
* Location dropdown correctly filters by selected Department
* Duplicate asset name in the same location is prevented
* Asset SN auto-generated in correct `dd/gg/nnnn` format with zero-padding
* Photos can be captured or selected from gallery
* Edit Asset screen shows correct data; Location/Department/AssetGroup are read-only
* Asset Transfer screen shows read-only current data
* Destination Department excludes current department
* New Asset SN generated correctly on destination department selection
* Previous SN reused if asset previously moved to same destination department
* Transfer log saved correctly to `AssetTransferLogs`
* Transfer History screen shows all required fields sorted oldest first
* Appropriate message shown when no transfers in last 12 months
* "Delete" / "Cancel" buttons are red
* Modal behavior when forms/dialogs are active
* Style Guide applied consistently
* Scrollbars used correctly
* Date format is YYYY-MM-DD throughout
* Color-coding legend shown when applicable
* All features fully functional by end of session

---

### Sources

* [Session 1/WSC2025_TP09_S1_RU.pdf](Session%201/WSC2025_TP09_S1_RU.pdf) — Main task description (RU)
* [Session 1/Сессия 1..pdf](Session%201/%D0%A1%D0%B5%D1%81%D1%81%D0%B8%D1%8F%201..pdf) — Supplementary task document (RU)
* [Session 1/Session1-MySQL.sql](Session%201/Session1-MySQL.sql) — MySQL database schema and seed data
* [Session 1/Session1-MsSQL.sql](Session%201/Session1-MsSQL.sql) — MS SQL Server database schema and seed data
* [Guideline_RU/TS2025_TP09_Style_Guide_pre_RU.pdf](Guideline_RU/TS2025_TP09_Style_Guide_pre_RU.pdf) — KMG Style Guide (RU)

---

## Task 2: Emergency Maintenance Management Desktop Application for KazMunayGas

### Overview

As part of KazMunayGas's large-scale expansion, the company requires an internal asset maintenance management system. This session focuses on building a **desktop application** to handle **unplanned (emergency) maintenance requests** for company assets. The system supports two user roles — Accountable Party (regular employee) and Maintenance Manager (admin) — each with distinct views and permissions after login.

---

### Steps

1. **Create and import the database** — Create a database named `Session2` on your preferred platform (MySQL or MS SQL Server) and import the provided SQL script (`Session2-MySQL.sql` or `Session2-MsSQL.sql`).

2. **Implement the Login form (section 2.3)** — Build an authentication form with Username and Password fields. Only employees who have a username set in the DB can log in. After successful login, route the user to the appropriate form based on their role (`isAdmin` field):
   - `isAdmin = false / NULL` → Accountable Party form
   - `isAdmin = true` → Maintenance Manager form

3. **Implement the Accountable Party view (section 2.4)** — After login, the accountable party sees a list of **their own assets** with the following columns per row:
   - Asset SN, Asset Name, Last Closed EM Date, Number of EMs
   - "Last Closed EM" = `EMEndDate` of the most recent completed (closed) maintenance for that asset
   - "Number of EMs" = total count of all EM records for that asset
   - Assets that have **open (uncompleted) EM requests** must be **visually highlighted** (different background color or other visual indicator). A color legend must be shown.
   - A "Send Emergency Maintenance Request" button at the bottom opens the new request form.

4. **Implement the New EM Request form (section 2.5)** — Opened when the accountable party selects an asset and clicks "Send Emergency Maintenance Request". The form must show:
   - Selected asset info (read-only): Asset SN, Asset Name, Department
   - Editable fields: Priority (dropdown from DB), Description of Emergency (text), Other Considerations (text)
   - "Send Request" saves the new EM to `EmergencyMaintenances` with `EMReportDate = today`; "Cancel" returns without saving
   - All required fields (Priority, Description) must be filled — show a validation message if not
   - **A new EM can only be registered if there are no other open requests for that asset** (open = `EMEndDate` is NULL)

5. **Implement the Maintenance Manager view (section 2.6)** — After admin login, the manager sees a list of all **open EM requests** from all employees with columns:
   - Asset SN, Asset Name, Report Date (EMReportDate), Employee Full Name, Department
   - Open requests sorted **first by Priority** (Very High → High → General), then by **Report Date oldest first**
   - Selecting a request and clicking "Manage Request" opens the EM Request Details form

6. **Implement the EM Request Details form (section 2.7)** — The manager uses this form to view and update an EM request:
   - **Read-only fields**: Asset SN, Asset Name, Department, Registered On (EMReportDate)
   - **Editable fields**: Start Date (EMStartDate), Completed On (EMEndDate), Technician Note (EMTechnicianNote)
   - **Replacement Parts section**: Manager can add parts used during maintenance:
     - Part Name dropdown (from `Parts` table in DB)
     - Amount field (positive number, decimal allowed)
     - "Add to list" button adds the part to the list below
     - List shows: Part Name, Amount, and a "Remove" action link per row
     - Manager can remove any part from the list
     - Manager may choose not to add any parts
   - **Part effective life warning**: Each part has an `EffectiveLife` (in days). If the selected part was previously used on the **same asset** in another EM request and its effective life has **not yet expired**, show a warning message to the manager.
   - **Business rules / validation**:
     - Start Date cannot be earlier than the EM Report Date
     - Start Date is mandatory before clicking "Submit"
     - Once Completed On (EMEndDate) is set, the manager **cannot make further changes** to the request
     - Completed On can only be filled if a Technician Note is already provided
   - "Submit" saves all changes to DB; "Cancel" returns without saving

---

### Requirements

#### Platform
* This is a **desktop application** (not mobile). Platform choice is at the developer's discretion.
* Style guide must be applied consistently throughout.

#### Authentication
* Only employees with a `Username` set in the `Employees` table can log in.
* `isAdmin = 1` → Maintenance Manager role; `isAdmin = NULL/0` → Accountable Party role.
* After successful login, redirect to the role-appropriate form immediately.

#### Accountable Party Rules
* The asset list shows **only assets assigned to the logged-in employee** (`EmployeeID` in `Assets`).
* Assets with open EM requests (where `EMEndDate IS NULL`) must be **visually distinguished** with a color legend shown on screen.
* "Last Closed EM" = `EMEndDate` of the most recently closed EM. Show `--` if none exists.
* "Number of EMs" = total EM records for that asset (open + closed).
* A new EM request can only be created if the asset has **no currently open EM** (no record with `EMEndDate IS NULL`).

#### New EM Request Rules
* Asset SN, Asset Name, Department are pre-filled from DB and **read-only**.
* Priority and Description of Emergency are **mandatory**; show a validation message if empty.
* Saved with `EMReportDate = current date`; `EMStartDate`, `EMEndDate`, `EMTechnicianNote` start as NULL.

#### Maintenance Manager Rules
* Sees **all open requests** (not just their own) from all employees.
* Open request = `EMEndDate IS NULL`.
* Sort order: Priority descending (Very High → High → General), then `EMReportDate` ascending (oldest first).

#### EM Request Details Rules
* Start Date (`EMStartDate`) must be ≥ `EMReportDate`.
* Start Date is **required** before submitting.
* `EMEndDate` (Completed On) can only be set if `EMTechnicianNote` is already filled.
* Once `EMEndDate` is set (request is closed), **no further edits are allowed**.
* Part Amount must be a **positive decimal number**.
* If a selected part was previously used on the **same asset** in another EM and its `EffectiveLife` (days since last use) has **not yet expired**, display a warning message.
* Manager can add zero or more parts; parts can be removed before submitting.

#### General UX Rules (same as Session 1)
* Style Guide applied uniformly.
* Meaningful validation and error messages for all modules.
* Use code comments for readability.
* Scrollbars when content overflows; hide when not needed.
* Date format: **YYYY-MM-DD** (ISO standard).
* Modal behavior: when a form/dialog is active, other forms are disabled.
* **"Delete" and "Cancel" buttons must be red.**
* Color-coding must include a visual legend.
* All deliverables must be fully functional by end of session.

---

### Database Schema

**Database name:** `Session2`

| Table | Fields |
|---|---|
| `Departments` | ID (PK), Name |
| `Locations` | ID (PK), Name |
| `DepartmentLocations` | ID (PK), DepartmentID (FK), LocationID (FK), StartDate, EndDate |
| `AssetGroups` | ID (PK), Name |
| `Employees` | ID (PK), FirstName, LastName, Phone, isAdmin, Username, Password |
| `Assets` | ID (PK), AssetSN, AssetName, DepartmentLocationID (FK), EmployeeID (FK), AssetGroupID (FK), Description, WarrantyDate |
| `Priorities` | ID (PK), Name |
| `EmergencyMaintenances` | ID (PK), AssetID (FK), PriorityID (FK), DescriptionEmergency, OtherConsiderations, EMReportDate, EMStartDate, EMEndDate, EMTechnicianNote |
| `Parts` | ID (PK), Name, EffectiveLife (days, nullable) |
| `ChangedParts` | ID (PK), EmergencyMaintenanceID (FK), PartID (FK), Amount |

**Seed data:**
- Departments: Exploration, Production, Transportation, R&D, Distribution, QHSE
- Locations: Kazan, Volka, Moscow
- Asset Groups: Hydraulic, Pneumatic, Electrical, Mechanical, Fixed/Stationary, Facility, Buildings
- Priorities: General, High, Very High
- 30 Employees (3 have credentials: `mohamed/1234`, `josefa/1324`, `lyn/1234` — Lyn is admin)
- 4 sample Assets
- 3 sample EmergencyMaintenances
- 12 sample Parts (with varying EffectiveLife values)
- 2 sample ChangedParts records

---

### Assessment Criteria

* Database `Session2` created and SQL imported correctly
* Login form authenticates using Username + Password from DB
* Only employees with a Username set can log in
* Correct role-based routing after login (Accountable Party vs Manager)
* Accountable Party sees only their own assets
* Asset list shows correct columns: Asset SN, Asset Name, Last Closed EM, Number of EMs
* Open EM assets visually highlighted with color legend
* "Last Closed EM" shows correct date or `--` if no closed EMs
* "Number of EMs" count is accurate (all EMs, open + closed)
* New EM request form pre-fills asset data as read-only
* Validation prevents submission with empty Priority or Description
* New EM blocked if asset already has an open request
* New EM saved with today's date as EMReportDate
* Manager view shows all open requests only
* Open requests sorted correctly: Very High → High → General, then oldest first
* EM Request Details shows correct asset info as read-only
* Start Date validation: cannot be before EMReportDate
* Start Date required before Submit
* EMEndDate can only be set when Technician Note is filled
* Once EMEndDate is set, form becomes read-only (no further edits)
* Parts dropdown populated from DB
* Part Amount accepts positive decimals only
* Effective life warning shown when applicable (same part, same asset, within effective life)
* Parts can be removed from the list before submitting
* Changes saved correctly to DB on Submit
* Cancel returns without saving
* Delete/Cancel buttons colored red
* Modal behavior enforced
* Date format YYYY-MM-DD throughout
* Style Guide applied consistently
* All features fully functional by end of session

---

### Sources

* [Session 2/WSC2025_TP09_S2_RU.pdf](Session%202/WSC2025_TP09_S2_RU.pdf) — Main task description (RU)
* [Session 2/Session2-MySQL.sql](Session%202/Session2-MySQL.sql) — MySQL database schema and seed data
* [Session 2/Session2-MsSQL.sql](Session%202/Session2-MsSQL.sql) — MS SQL Server database schema and seed data

---

## Task 3: Preventive Maintenance (PM) Android Application for KazMunayGas

### Overview

As part of KazMunayGas's asset management system, this session requires building an **Android mobile application** connected to a remote database via Web API. The app handles **planned (preventive) maintenance** tasks for company assets. PM tasks are routine, fixed-interval jobs (inspections, cleaning, lubrication, calibration) that repeat on time-based schedules (daily/weekly/monthly) or kilometer-based milestones. The application displays active tasks to technicians and allows registering new recurring PM schedules.

---

### Steps

1. **Create and import the database** — Create a database named `Session3` on your preferred platform (MySQL or MS SQL Server) and import the provided SQL script.

2. **Implement the PM List screen — main/start screen (section 3.3)** — Display all active PM tasks. Each row shows: Asset Name, Asset SN, Task Name, Schedule Type, and either ScheduleDate or ScheduleKilometer depending on the task type.

3. **Implement the "Active Date" field** — Placed at the top of the PM List screen. Defaults to the current system date. Changing this date must immediately refresh the active task list.

4. **Determine and display active tasks** — Two types of active tasks must be shown:
   - **Time-based tasks** (have `ScheduleDate`): tasks whose date falls in one of three windows relative to the Active Date:
     - Overdue: `ScheduleDate` < Active Date
     - Due today: `ScheduleDate` = Active Date
     - Due in next 4 days: `ScheduleDate` between Active Date+1 and Active Date+4
   - **Milestone-based tasks** (have `ScheduleKilometer`): tasks that become active when the latest odometer reading in `AssetOdometers` for that asset has reached or exceeded `ScheduleKilometer`.

5. **Implement task sorting** — The list must be sorted in the following order:
   1. Unprocessed (`TaskDone = false`) milestone-based tasks
   2. Unprocessed overdue time-based tasks
   3. Unprocessed time-based tasks due on the Active Date
   4. Unprocessed time-based tasks due in the next 4 days
   5. All processed (`TaskDone = true`) tasks at the very end

6. **Implement color-coding with a visible legend** — Colors must be applied per row:
   - **Milestone-based**: Black = unprocessed; Gray = processed
   - **Time-based overdue**: Red = unprocessed; Orange = processed
   - **Time-based due today**: Black = unprocessed; Green = processed
   - **Time-based due in next 4 days**: Purple = unprocessed; Black = processed
   - A legend explaining all colors must be visible on screen

7. **Implement the TaskDone checkbox** — Each task row has a checkbox reflecting `TaskDone`. Tapping it toggles the value, saves to DB immediately, and refreshes the list instantly without navigating away.

8. **Implement filters at the bottom of the PM List screen** — Two dropdown filters:
   - Asset Name (populated from `Assets` table)
   - Task Name (populated from `Tasks` table)
   - Any filter change immediately refreshes the list
   - "Clear Filter" button resets both dropdowns to default and shows all active tasks

9. **Implement the Add New PM Task screen (section 3.4)** — Accessed via FAB (+) button (always visible at bottom-right, fixed during scroll). The form collects:
   - **Task Name** — dropdown from `Tasks` table
   - **Asset Name** — dropdown from `Assets` table, with "Add to list" button allowing multiple assets to be linked; each added asset shows in a list with a remove (✕) option
   - **Schedule Model** — dropdown from `PMScheduleModels` table
   - **Dynamic schedule parameters** — change based on the selected model (see Requirements)
   - **Start Date and End Date** — date pickers (applicable to time-based models only)

10. **Generate PMTasks records on Submit** — Based on the selected schedule model and parameters, generate all individual `PMTasks` rows for each asset in the list, within the defined date or kilometer range, and save them to the DB. Then return to the PM List and refresh it.

11. **Apply navigation buttons** — "Back" (top) and "Cancel" (bottom) return to the PM List without saving. "Submit" saves all new PM task records and refreshes the main list.

---

### Requirements

#### Platform & Architecture
* **Android mobile application** — accepted only on provided mobile devices.
* All data must go through **Web API** (central DB, no direct connection).
* DB name: `Session3`. DB structure must not be modified.

#### PM List Screen
* Displays: Asset Name, Asset SN, Task Name, Schedule Type, ScheduleDate or ScheduleKilometer.
* "Active Date" at top — defaults to today; list refreshes on change.
* Scrollable list in the middle of the screen.
* TaskDone checkbox per row — toggling saves to DB and refreshes list immediately.
* Two filter dropdowns at bottom (Asset Name, Task Name); filter changes refresh list immediately.
* "Clear Filter" button resets filters.
* FAB (+) stays fixed at bottom-right during scroll.

#### Active Task Logic
* **Time-based** (`ScheduleDate` not null): include tasks where `ScheduleDate` ≤ Active Date+4 AND `ScheduleDate` is not in the past beyond the current Active Date window. Specifically: overdue (before today), due today, due in next 4 days.
* **Milestone-based** (`ScheduleKilometer` not null): active when the latest `OdometerAmount` for that asset in `AssetOdometers` ≥ `ScheduleKilometer`.

#### Sort Order (strict)
1. Unprocessed milestone-based
2. Unprocessed overdue time-based
3. Unprocessed due-today time-based
4. Unprocessed next-4-days time-based
5. All processed (TaskDone = true) tasks

#### Color Coding (mandatory legend on screen)
| Category | Unprocessed | Processed |
|---|---|---|
| Milestone-based | Black | Gray |
| Overdue time-based | Red | Orange |
| Due today time-based | Black | Green |
| Next 4 days time-based | Purple | Black |

#### Schedule Models & Parameters (for Create PM screen)

| Model | Type | Required Parameters |
|---|---|---|
| **Daily** | Time-based | Interval in days (e.g., every 12 days) |
| **Weekly** | Time-based | Day of week + interval in weeks (e.g., every 3 weeks on Monday) |
| **Monthly** | Time-based | Day of month + interval in months (e.g., every 2 months on the 3rd) |
| **Every X Kilometer** | Milestone-based | Start km + End km + Interval km (e.g., every 5,000 km from 20,000 to 50,000) |

* Parameters must be shown/hidden **dynamically** based on the selected Schedule Model.
* **Start Date / End Date** apply only to time-based models — they define the date range within which the recurring tasks are generated.
* For kilometer-based: the km range (start → end, every X km) defines which `ScheduleKilometer` values are inserted.

#### Create PM Task Validation
* At least one asset must be added to the list.
* Task Name and Schedule Model are required.
* For time-based: Start Date and End Date are required.
* For kilometer-based: Start km, End km, and Interval km are required.
* **No overlapping kilometer ranges allowed** for the same Task + Asset combination. E.g., if oil change every 5,000 km is already scheduled from 20,000–50,000 km, the user cannot add another oil change in the 30,000–50,000 range.
* For time-based: if Start Date = End Date and interval > duration, only one task occurrence is generated. The system generates as many occurrences as fit within the date range.

#### General UX Rules
* Style Guide applied uniformly.
* Meaningful validation and error messages.
* Scrollbars when content overflows; hidden when not needed.
* Date format: **YYYY-MM-DD**.
* Modal behavior: active form disables other forms.
* **"Delete" and "Cancel" buttons must be red.**
* All deliverables fully functional by end of session.

---

### Database Schema

**Database name:** `Session3`

| Table | Fields |
|---|---|
| `Assets` | ID (PK), AssetSN, AssetName, DepartmentLocationID, EmployeeID, AssetGroupID, Description, WarrantyDate |
| `AssetOdometers` | ID (PK), AssetID (FK→Assets), ReadDate, OdometerAmount |
| `Tasks` | ID (PK), Name |
| `PMScheduleTypes` | ID (PK), Name — values: "By Date", "By Milage" |
| `PMScheduleModels` | ID (PK), Name, PMScheduleTypeID (FK→PMScheduleTypes) |
| `PMTasks` | ID (PK), AssetID (FK→Assets), TaskID (FK→Tasks), PMScheduleTypeID (FK→PMScheduleTypes), ScheduleDate (nullable), ScheduleKilometer (nullable), TaskDone |

**Seed data:**
- 4 Assets (Toyota Hilux FAF321, Suction Line 852, ZENY Rotary Vane, Volvo FH16)
- AssetOdometers: 6 readings for assets 1 and 4 (km-tracked vehicles)
- Tasks: 7 tasks (Get Tires Rotated, Check Engine Oil, Check Air Filter, Check Battery, Inspect paint, Inspect cord, Pull pump)
- PMScheduleTypes: By Date (1), By Milage (2)
- PMScheduleModels: Daily, Weekly, Monthly (all time-based), Every X Kilometer (milestone-based)
- PMTasks: 481 pre-generated rows covering km-based and date-based schedules for assets 1, 3, and 4

---

### Assessment Criteria

* DB `Session3` created and SQL imported correctly
* PM List is the startup screen
* Each task row shows Asset Name, Asset SN, Task Name, Schedule Type, and ScheduleDate or ScheduleKilometer
* "Active Date" field defaults to today and updates list on change
* Time-based active tasks correctly shown: overdue, due today, due in next 4 days
* Milestone-based active tasks correctly triggered from `AssetOdometers` data
* Task sort order matches specification (milestone → overdue → today → next 4 days → processed)
* TaskDone checkbox toggles and saves to DB immediately, list refreshes without navigation
* Color-coding matches specification for all 4 categories × 2 states
* Color legend visible on screen
* Asset Name and Task Name filter dropdowns populated from DB
* Filter changes update list immediately
* "Clear Filter" resets both dropdowns and shows all active tasks
* FAB (+) stays visible and fixed at bottom-right during scroll
* Create PM form contains: Task Name, Asset Name (multi-select list), Schedule Model, dynamic parameters, Start/End Date
* Dynamic parameters display correctly based on selected Schedule Model
* Daily model: accepts day interval, generates correct occurrences within date range
* Weekly model: accepts day-of-week + week interval, generates correct occurrences
* Monthly model: accepts day-of-month + month interval, generates correct occurrences
* Every X Kilometer model: accepts start km, end km, interval km, generates correct milestones
* Overlapping km range validation works correctly
* Multiple assets can be added and removed from the create form
* Submit saves all generated PMTasks to DB and refreshes PM List
* Back and Cancel return without saving
* Cancel/Delete buttons are red
* Date format YYYY-MM-DD throughout
* Style Guide applied consistently
* All features fully functional by end of session

---

### Sources

* [Session 3/WSC2025_TP09_S3_RU.pdf](Session%203/WSC2025_TP09_S3_RU.pdf) — Main task description (RU)
* [Session 3/Session3-MySQL.sql](Session%203/Session3-MySQL.sql) — MySQL database schema and seed data
* [Session 3/Session3-MsSQL.sql](Session%203/Session3-MsSQL.sql) — MS SQL Server database schema and seed data

---

## Task 4: Inventory & Warehouse Management Desktop Application for KazMunayGas

### Overview

This session continues development of the KazMunayGas asset management system. The goal is to build a **Windows desktop application** for administrators that covers three modules: **Purchase Order Management** (buying parts from external suppliers), **Warehouse Management** (moving parts between warehouses), and an **Inventory Report** (viewing stock levels per warehouse). All three modules are accessible from a single main form via tab buttons at the top.

---

### Steps

1. **Create and import the database** — Create a database named `Session4` on your preferred platform (MySQL or MS SQL Server) and import the provided SQL script. If the DB already exists (provided by administrators), use it as-is.

2. **Implement the main Inventory Management screen (section 4.3)** — This is the startup form. It shows a unified list of all transactions (both Purchase Orders and Warehouse Movements) with columns: Part Name, Transaction Type, Date, Amount, Source, Destination. Three tab buttons at the top navigate to: Purchase Order Management, Warehouse Management, Inventory Report.

3. **Implement sorting on the main list** — Default sort: by Date ascending (oldest first); if same date, Purchase Orders appear above Warehouse Movements. Column headers are clickable: one click sorts ascending, second click sorts descending, third click resets to default. A sort-direction arrow appears on the active sort column header.

4. **Implement color-coding on the Amount column** — Purchase Order rows have a **green background** on the Amount cell. Warehouse Management rows have a different visual style. A color legend must be shown.

5. **Implement Edit and Remove actions per row** — Each row has Edit and Remove buttons. Removing a transaction that would cause any warehouse's part stock to go **below 0** must be blocked with an error message.

6. **Implement the Purchase Order form (section 4.4)** — Opened via the "Purchase Order Management" tab button. Fields:
   - Supplier (dropdown from DB)
   - Warehouse / Destination Warehouse (dropdown from DB)
   - Date (date picker)
   - Parts List: Part Name (searchable dropdown from DB), Batch Number (text, required only if `BatchNumberHasRequired = true`), Amount (positive decimal) — "Add to list" button; list shows Part Name, Batch Number, Amount, Remove action
   - At least one part must be added before submitting
   - When editing: cannot remove a part if doing so would make warehouse stock go negative

7. **Implement Batch Number logic** — If `BatchNumberHasRequired = true` for a part, batch number is mandatory and stored. If `false`, any entered value is ignored and not saved. Parts with different batch numbers are treated as **separate stock items** — stock is calculated per (Part Name + Batch Number) combination. The same part name can appear multiple times in one order only if batch numbers differ.

8. **Implement the Warehouse Management form (section 4.5)** — Opened via the "Warehouse Management" tab button. Fields:
   - Source Warehouse (dropdown from DB) — only parts currently in this warehouse appear in the Parts dropdown
   - Destination Warehouse (dropdown from DB) — must differ from Source
   - Date (date picker)
   - Parts List: Part Name (searchable, filtered to parts available in Source Warehouse), Batch Number (dropdown if `BatchNumberHasRequired = true`, otherwise text), Amount (positive decimal) — "Add to list"; list shows Part Name, Batch Number, Amount, Remove
   - At least one part required
   - System must never allow stock at any warehouse to go negative at any time

9. **Implement the Inventory Report screen (section 4.6)** — Opened via the "Inventory Report" tab button. Fields:
   - Warehouse dropdown (from DB)
   - Inventory Type radio buttons: **Current Stock**, **Received Stock**, **Out of Stock**
   - Result table shows: Part Name, Current Stock, Received Stock, and an action button "View Batch Numbers" for parts that have batch numbers
   - "View Batch Numbers" opens a sub-view listing all batch numbers for that part with their individual Current Stock and Received Stock values
   - Stock calculations use (Part Name + Batch Number) as a combined key when batch numbers apply

---

### Requirements

#### Platform
* **Windows desktop application** for administrators.
* Style Guide applied uniformly throughout.
* DB name: `Session4`. DB structure must not be modified.

#### Main Inventory List (section 4.3)
* Columns: Part Name, Transaction Type, Date, Amount, Source, Destination.
* Default sort: Date ascending; ties resolved by putting Purchase Orders before Warehouse Movements.
* Clickable column headers: click 1 = ascending, click 2 = descending, click 3 = reset to default. Arrow indicator shown on active sort column.
* Amount cell: **green background** for Purchase Order rows.
* Edit and Remove buttons per row.
* Delete blocked if it would cause stock at any warehouse to go below 0 — show error message.

#### Purchase Order (section 4.4)
* Required fields: Supplier, Destination Warehouse, Date, at least one part.
* Part Name: searchable dropdown from `Parts` table.
* Batch Number: **mandatory and stored** only if `BatchNumberHasRequired = true`; otherwise ignored.
* Amount: positive decimal value.
* Same part name allowed multiple times in one order only if batch numbers differ.
* Parts are removed from the list with a Remove button.
* When editing: cannot remove a part if removal would cause stock to go negative.
* Saved as `TransactionTypeID = 1` (Purchase Order) in `Orders`; items saved to `OrderItems`.

#### Warehouse Management (section 4.5)
* Required fields: Source Warehouse, Destination Warehouse (must differ), Date, at least one part.
* Part Name dropdown: **filtered to only parts currently in the Source Warehouse** (stock > 0).
* Batch Number: dropdown (if `BatchNumberHasRequired = true`), otherwise free text.
* Amount: positive decimal value; cannot exceed available stock of that part in the Source Warehouse.
* Same part name allowed with different batch numbers.
* System must never let stock at **any warehouse** go below 0 at any time.
* Source and Destination warehouses cannot be the same.
* Saved as `TransactionTypeID = 2` (Warehouse Management) in `Orders`.

#### Inventory Report (section 4.6)
* Warehouse selector (dropdown).
* Inventory Type (radio buttons):
  - **Current Stock** — parts currently in stock at the selected warehouse (quantity > 0)
  - **Received Stock** — all parts ever received into the selected warehouse (via Purchase Orders)
  - **Out of Stock** — parts that were previously received but are now at 0
* Report columns: Part Name, Current Stock, Received Stock.
* Parts with `BatchNumberHasRequired = true` show a **"View Batch Numbers"** action link.
* "View Batch Numbers" displays a list of all batch numbers for that part with individual Current Stock and Received Stock per batch.
* Stock = sum of all inbound transactions (Purchase Orders to this warehouse) minus all outbound transfers (Warehouse Movements from this warehouse), grouped by Part Name (+ Batch Number if applicable).

#### Batch Number Rules (applies throughout)
* `BatchNumberHasRequired = true` → batch number is **mandatory**, stored, and used to distinguish stock.
* `BatchNumberHasRequired = false` → batch number input is **ignored** and not saved to DB.
* When batch numbers are active: stock is calculated per **(Part Name + Batch Number)** pair.
* Multiple rows with the same part name but different batch numbers are allowed in the same order.

#### General UX Rules
* Style Guide applied uniformly.
* Meaningful validation and error messages.
* Scrollbars when content overflows; hidden when not needed.
* Date format: **YYYY-MM-DD**.
* Modal behavior: active form disables other forms.
* **"Delete" and "Cancel" buttons must be red.**
* Color-coding with visible legend.
* All deliverables fully functional by end of session.

---

### Database Schema

**Database name:** `Session4`

| Table | Fields |
|---|---|
| `TransactionTypes` | ID (PK), Name — values: "Purchase Order", "Warehouse Management" |
| `Suppliers` | ID (PK), Name |
| `Warehouses` | ID (PK), Name |
| `Parts` | ID (PK), Name, EffectiveLife, BatchNumberHasRequired, MinimumAmount |
| `Orders` | ID (PK), TransactionTypeID (FK), SupplierID (FK, nullable), SourceWarehouseID (FK, nullable), DestinationWarehouseID (FK, nullable), Date |
| `OrderItems` | ID (PK), OrderID (FK→Orders), PartID (FK→Parts), BatchNumber (nullable), Amount |

**Seed data:**
- TransactionTypes: Purchase Order (1), Warehouse Management (2)
- Suppliers: MJOK Petroleum, Kazan Bosch Center, Denso Corp, Castrol Corp
- Warehouses: Central Warehouse (1), Volka Warehouse (2)
- Parts: 12 parts — some with `BatchNumberHasRequired = true` (e.g., michelin tyres, CT16V Turbo, Electric Fuel Pump), some with `MinimumAmount` set
- Orders: 37 orders (26 Purchase Orders, 11 Warehouse Movements)
- OrderItems: 136 line items across all orders

**Stock calculation logic (inferred):**
- For a given warehouse and part (+ batch if applicable):
  - **Received** = SUM of Amount from Purchase Orders where `DestinationWarehouseID = warehouse`
  - **Transferred out** = SUM of Amount from Warehouse Movements where `SourceWarehouseID = warehouse`
  - **Transferred in** = SUM of Amount from Warehouse Movements where `DestinationWarehouseID = warehouse`
  - **Current Stock** = Received + Transferred In − Transferred Out

---

### Assessment Criteria

* DB `Session4` created and SQL imported correctly
* Main Inventory screen is the startup form with 3 tab buttons
* All transactions shown with correct columns: Part Name, Transaction Type, Date, Amount, Source, Destination
* Default sort: oldest date first; same-date Purchase Orders before Warehouse Movements
* Column header sort works: ascending → descending → reset; arrow indicator shown
* Amount column green background for Purchase Order rows
* Edit and Remove buttons per row functional
* Delete blocked and error shown if stock would go negative
* Purchase Order form: Supplier, Warehouse, Date, Parts list with correct fields
* Part Name searchable in Purchase Order and Warehouse Management forms
* Batch Number mandatory and stored when `BatchNumberHasRequired = true`; ignored when false
* Duplicate part name allowed in one order only with different batch numbers
* Edit Purchase Order: cannot remove part if stock would go negative
* Warehouse Management form: Source, Destination (must differ), Date, filtered Parts list
* Parts dropdown in Warehouse Management filtered to Source Warehouse stock only
* Batch Number shown as dropdown in Warehouse Management when required
* Transfer blocked if stock at any warehouse would go below 0
* Source and Destination warehouses cannot be the same
* Inventory Report: warehouse dropdown and 3 inventory type radio buttons
* Current Stock report shows correct quantities
* Received Stock report shows all ever-received parts
* Out of Stock report shows parts at 0 that were previously received
* "View Batch Numbers" action appears for batch-tracked parts
* Batch number sub-view shows correct per-batch current and received stock
* Stock calculated correctly using (Part Name + Batch Number) key when applicable
* Cancel/Delete buttons red
* Date format YYYY-MM-DD throughout
* Modal behavior enforced
* Style Guide applied consistently
* All features fully functional by end of session

---

### Sources

* [Session 4/WSC2025_TP09_S4_RU.pdf](Session%204/WSC2025_TP09_S4_RU.pdf) — Main task description (RU)
* [Session 4/Session4-MySQL.sql](Session%204/Session4-MySQL.sql) — MySQL database schema and seed data
* [Session 4/Session4-MsSQL.sql](Session%204/Session4-MsSQL.sql) — MS SQL Server database schema and seed data

---

## Task 5: Inventory Management System for KazMunayGas

### Overview

Build a desktop inventory management application for KazMunayGas maintenance managers and administrators. The system provides an **Inventory Dashboard** that visualizes how material-technical assets are used and where emergency maintenance funds are spent, and includes a **Material-Technical Asset Management** form for searching, allocating, and submitting parts to active EM work orders.

The application consists of two main screens:
1. **Inventory Dashboard** — five data panels (three tables + two charts) showing EM spending analytics
2. **Material-Technical Asset Management** — a form for searching parts, allocating them by costing method, and submitting assignments to active EM work orders

---

### Steps

1. **Create the database** — Create a database named `Session5` on your preferred platform (MySQL or MS SQL Server).

2. **Import the provided SQL script** — Run `Session5-MySQL.sql` (MySQL) or `Session5-MsSQL.sql` (MS SQL Server) against the `Session5` database. Do **not** modify the schema in any way.

3. **Build the Inventory Dashboard form** — Display all five sections on a single screen (see Panel Requirements below). Add an "Inventory Control" button that opens the Asset Management form.

4. **Implement multi-language support** — Add a language dropdown at the bottom of the Dashboard. Load available languages by scanning XML files in the `languages/` folder. Use `default.xml` as the fallback for missing keys. Persist the user's last selected language across restarts. Skip XML files with parsing errors.

5. **Build the Material-Technical Asset Management form** — Implement the "Search for Parts", "Allocated Parts", and "Assigned Parts" sections with their respective buttons and submission logic.

6. **Apply the uniform style guide** — Highlight Delete and Cancel buttons in red, use modal dialogs, use ISO date format `YYYY-MM-DD`, and show/hide scrollbars based on content.

---

### Requirements

#### General

* Apply the provided uniform style guide throughout the entire application
* All modules must include applicable error checks and messages
* Use scrollbars when table/list records overflow; hide them when content fits
* Date format: `YYYY-MM-DD` (ISO 8601)
* Modal forms/dialogs must disable interaction with other forms while active
* Delete and Cancel buttons must be highlighted in red
* Screenshots in the task document are recommendations only — exact layout not mandatory
* Colors in charts may differ from the style guide

#### Database Schema

| Table | Key Fields |
|---|---|
| `departments` | ID, Name |
| `locations` | ID, Name |
| `departmentlocations` | ID, DepartmentID, LocationID, StartDate, EndDate |
| `assets` | ID, AssetSN, AssetName, DepartmentLocationID, EmployeeID, AssetGroupID, Description, WarrantyDate |
| `parts` | ID, Name, EffectiveLife, BatchNumberHasRequired, MinimumQuantity |
| `warehouses` | ID, Name |
| `suppliers` | ID, Name |
| `transactiontypes` | ID, Name *(Purchase Order, Warehouse Management, Used on Emergency Maintenance, Extermination Part)* |
| `orders` | ID, TransactionTypeID, SupplierID, EmergencyMaintenancesID, SourceWarehouseID, DestinationWarehouseID, Date, Time |
| `orderitems` | ID, OrderID, PartID, BatchNumber, Amount, Stock, UnitPrice |
| `emergencymaintenances` | ID, AssetID, PriorityID, DescriptionEmergency, OtherConsiderations, EMRequestDate, EMStartDate, EMEndDate, EMTechnicianNote |

> The DB schema must **not** be altered in any way.

#### Panel 1 — "EM Spending by Department"

* Show monthly department expenses for EM requests
* Count only parts used in **completed** EM work orders (have both `EMStartDate` and `EMEndDate`)
* Display only months that have at least one completed EM order
* Highlight the highest monthly expense value in **red** and the lowest non-zero value in **green**
* If highest equals lowest, use red

#### Panel 2 — "Monthly Report for Most-Used Parts"

* Two rows per month:
  * **"Highest Cost"** — part(s) costing the company the most that month
  * **"Most Number"** — part(s) used most frequently (by count) that month
* Only months with completed EM orders shown
* Multiple parts tying for the same criterion are separated by commas

#### Panel 3 — "Monthly Report of Costly Assets"

* Show the asset(s) with the highest cumulative part cost per month (parts used in completed EM repairs)
* Display the asset's department name below the asset name
* Only months with completed EM orders shown
* Multiple tying assets separated by commas

#### Panel 4 — "Department Spending Ratio" (Pie Chart)

* Pie chart comparing total EM part expenses per department
* Each department gets a distinct color with a label/legend

#### Panel 5 — "Monthly Department Spending" (Bar Chart)

* Grouped/stacked bar chart of monthly EM part expenses per department
* Each column represents one month; bars per department within each column
* Month labels on axes; each department has a distinct color with a corresponding legend

#### Multi-Language Support

* Language selection dropdown at the bottom of the Dashboard form
* Application scans the `languages/` folder on startup for XML translation files
* `default.xml` is the fallback — used for any keys not found in the selected language file
* Last selected language is saved and restored on next launch
* XML files with errors are silently excluded from the dropdown list

#### Material-Technical Asset Management Form

**Header fields:**
* Warehouse (dropdown)
* Asset Name / EM Number (dropdown) — populated with assets that have **active** EM orders (have `EMStartDate` but no `EMEndDate`); if an asset has multiple open EM orders it appears once per EM order
* Date (date picker)

**"Search for Parts" section:**
* Warehouse — dropdown of available warehouses
* Part Name — dropdown listing only parts available in the selected warehouse up to the selected date
* Amount — numeric input for requested quantity
* Allocation Method — dropdown with three options:
  * **FIFO** (First In, First Out): oldest batch taken first; cost of earliest purchase listed first
  * **LIFO** (Last In, First Out): most recently received batch used first
  * **Minimum Cost**: batch with the lowest unit price used first
* "Remove" button — searches the DB and populates matching parts into the "Allocated Parts" table

**"Allocated Parts" section:**
* Columns: Part Name, Batch Number, Unit Price, Amount
* "Assign to EM" button — moves all rows from Allocated Parts to the Assigned Parts table
* User may perform additional searches and assign more parts after each move

**"Assigned Parts" section:**
* Columns: Part Name, Batch Number, Unit Price, Amount
* User can delete individual rows before submitting
* "Submit" button — saves all assigned parts to the database

**Submission rules:**
* At least one part must be present to submit
* Material quantity must not be less than 0
* Parts with the same Part Name but different Batch Numbers are treated as distinct items; remaining stock calculated per (Name + BatchNumber) pair

---

### Assessment Criteria

* Database `Session5` created and SQL script imported without errors
* Inventory Dashboard displays all five panels with accurate data
* Highest/lowest monthly expense correctly highlighted in red/green
* "Most-Used Parts" report shows correct "Highest Cost" and "Most Number" rows per month
* "Costly Assets" report correctly sums part costs per asset per month and shows department name
* Pie chart correctly represents department spending ratios with distinct colors and legend
* Bar chart correctly shows monthly department spending with labeled axes and legend
* Language dropdown loads available XML files from `languages/` folder
* Default language fallback (`default.xml`) works when keys are missing in selected language
* Last selected language is remembered across application restarts
* XML files with errors are excluded without crashing the application
* Asset Management form shows only assets with active (open) EM orders
* Part Name dropdown correctly filters parts by selected warehouse and date
* FIFO, LIFO, and Minimum Cost allocation methods produce correct batch ordering
* "Remove" → "Assign to EM" flow moves parts correctly between tables
* Submission persists data to the database; at least one part is required
* Delete/Cancel buttons are highlighted in red throughout
* Modal dialogs disable background form interactions
* Dates displayed in `YYYY-MM-DD` format throughout
* Style Guide applied consistently
* All features fully functional by end of session

---

### Sources

* [Session 5/WSC2025_TP09_S5_RU.pdf](Session%205/WSC2025_TP09_S5_RU.pdf) — Main task description (RU)
* [Session 5/Сессия 5.pdf](Session%205/%D0%A1%D0%B5%D1%81%D1%81%D0%B8%D1%8F%205.pdf) — Supplementary task document (RU)
* [Session 5/Session5-MySQL.sql](Session%205/Session5-MySQL.sql) — MySQL database schema and seed data
* [Session 5/Session5-MsSQL.sql](Session%205/Session5-MsSQL.sql) — MS SQL Server database schema and seed data
* [Session 5/default.xml](Session%205/default.xml) — Default English language XML file

---

## Task 6: Data Analysis and Reporting for KazMunayGas

### Overview

Build a complete data analysis pipeline for KazMunayGas using Python. The project involves loading and cleaning three CSV datasets (sales transactions, products, partners), performing statistical and business analysis, generating visualizations, and producing forecasts and segmentation outputs. All results are exported as CSV or PDF deliverables following the KMG Corporate Style Guide.

---

### Steps

1. **Load and explore data (Task 1.1)** — Import the three CSV files, display the first 5 rows of each, determine data types, and identify all data quality issues. Export findings to `Session6_DataExploration.txt`.

2. **Clean and transform data (Task 1.2)** — Fix missing values, convert date columns, and standardize phone numbers. Export `partners_cleaned.csv` and `sales_transactions_cleaned.csv`.

3. **Sales trend analysis (Task 1.3)** — Calculate monthly revenue, transaction count, and average order value. Create three line charts and identify the top 3 months by revenue. Export `Session6_SalesTrends.pdf`.

4. **Product performance analysis (Task 1.4)** — Calculate total quantity sold, revenue, and profit margin per product. Create a bar chart by category and a top-3 products table. Export `Session6_ProductPerformance.pdf`.

5. **Partner and contractor analysis (Task 1.5)** — Visualize partner age distribution and gender split, and calculate average spending by membership tier. Export `Session6_PartnerAnalysis.pdf`.

6. **Sales volume forecasting (Task 1.6)** — Implement an ARIMA model on daily total sales and generate a 30-day forecast with MAE. Export `Session6_SalesForecast.csv`.

7. **Partner segmentation and recommendations (Task 1.7)** — Engineer features, apply K-means clustering (3 clusters), and build a recommendation engine for top 3 products per partner. Export `Session6_Segmentation_and_Recommendations.csv`.

8. **Product performance and price optimization (Task 1.8)** — Compute revenue/margin rankings, analyze monthly category trends, calculate Price Elasticity of Demand, and suggest price adjustments. Export `Session6_Product_Performance.csv` and `Session6_Price_Analysis.csv`.

9. **Partner Lifetime Value calculation (Task 1.9)** — Calculate PLTV per partner using average purchase value × purchase frequency × 36. Export `Session6_CLTV.csv`.

10. **Partner churn analysis (Task 1.10)** — Identify churned partners, compute churn rate, and compare average PLTV between churned and active partners. Export `Session6_Churn_Analysis.csv`.

---

### Requirements

#### Input Data

| File | Key Columns | Constraints |
|---|---|---|
| `sales_transactions.csv` | transaction_id, partner_id, date, product_id, quantity, unit_price, payment_method, sales_channel, store_id, promotion_id, discount_amount | quantity ≥ 0; payment_method ∈ {Bank Transfer, Credit, Cash}; sales_channel ∈ {Domestic, Export} |
| `products_KMG.csv` | product_id, product_name, category, ingredients, price, cost, seasonal, active, introduced_date | categories: Crude Oil, Refined Products, Gas/LPG, Petrochemicals |
| `partners_KMG.csv` | partner_id, first_name, last_name, age, gender, postal_code, email, phone_number, membership_status, join_date, last_purchase_date, total_spending, average_order_value, frequency, preferred_category, churned | membership: Basic/Silver/Gold; gender: M/F; churned: Boolean |

#### Known Data Quality Issues to Handle

**sales_transactions.csv:**
- Missing `promotion_id` and `store_id` values → fill with `'0'`
- Date column needs conversion to datetime (add random time between 9am–5pm)

**products_KMG.csv:**
- Negative prices and costs
- Inconsistent date formats (mixed YYYY-MM-DD, MM-DD-YYYY, DD-MM-YYYY, future dates)
- Missing prices/costs
- Inconsistent boolean values (True/False/Yes/No/1/0)

**partners_KMG.csv:**
- Missing `age` → fill with median age
- Missing `phone_number` → fill with `'0'`
- Inconsistent phone number formats → standardize (keep digits and leading `+` only)
- Invalid/inconsistent dates (1900s, future years)
- Inconsistent `churned` values (True/False/Yes/No/0/1/N/U)
- Inconsistent `membership_status` casing (Basic/BASIC/basic, Silver/SILVER, Gold/GOLD/gold)
- Date column needs conversion to datetime (add random time between 9am–5pm)

#### Task 1.1 — Data Exploration

* Report must identify and document:
  * **Invalid Dates** — dates outside expected range
  * **Negative Values** — quantities or prices below 0
  * **Invalid IDs** — product/partner IDs not found in the corresponding reference file
  * **Unexpected Values** — values violating categorical column constraints
  * **Formatting Issues** — extra spaces, inconsistent formatting
* Deliverable: `Session6_DataExploration.txt`

#### Task 1.2 — Data Cleaning

* Fill missing `age` in partners with **median age**
* Fill missing `phone_number` with `'0'`
* Fill missing `promotion_id` with `'0'`
* Convert date columns to datetime; add random time between **9:00am and 5:00pm**
* Standardize phone numbers: **remove all non-numeric characters except leading `+`**
* Deliverables: `partners_cleaned.csv`, `sales_transactions_cleaned.csv`

#### Task 1.3 — Sales Trend Analysis

* Calculate per month: total revenue, number of transactions, average order value
* Create **3 line charts** (one per metric, x-axis = month)
* Create **1 table** listing top 3 months by revenue
* Deliverable: `Session6_SalesTrends.pdf`

#### Task 1.4 — Product Performance Analysis

* Calculate per product: total quantity sold, total revenue
* Calculate profit margin per product: `Price − Cost`
* Create **bar chart**: total revenue by product category
* Create **table**: top 3 best-selling products by quantity
* Deliverable: `Session6_ProductPerformance.pdf`

#### Task 1.5 — Partner Analysis

* Visualize age distribution using groups: **18–24, 25–34, 35–44, 45+** (bar chart)
* Display gender distribution (M/F) as a **percentage table**
* Calculate average total spending by membership tier (Basic / Silver / Gold)
* Deliverable: `Session6_PartnerAnalysis.pdf`

#### Task 1.6 — Sales Volume Forecasting (ARIMA)

* Aggregate daily total sales from `sales_transactions_cleaned.csv`
* Fit an **ARIMA model** to the daily time series
* Generate **30-day forecast**
* Calculate **Mean Absolute Error (MAE)**
* Deliverable: `Session6_SalesForecast.csv`
  * Columns: `Date` (YYYY-MM-DD), `Predicted_Sales` (float)

#### Task 1.7 — Partner Segmentation & Recommendations

* Feature engineering per partner:
  * `total_purchases` — total transaction count
  * `avg_purchase_value` — average transaction value
* Apply **K-means clustering** with **3 clusters** (small / medium / large-volume contractors)
* Recommendation engine:
  * Identify top 3 products **frequently purchased together**
  * For each partner recommend top 3 products **not yet purchased**, based on cluster purchasing trends
* Deliverable: `Session6_Segmentation_and_Recommendations.csv`
  * Columns: `partner_id`, `cluster_label`, `recommended_product_1`, `recommended_product_2`, `recommended_product_3`

#### Task 1.8 — Price Optimization

* Product performance table: `product_id`, total quantity sold, total revenue — sorted by revenue descending
* Profit margin table: sorted by margin descending
* Monthly trends by category with seasonality patterns
* **Price Elasticity of Demand (PED)** per product:
  * `PED = (% change in quantity) / (% change in price)`
  * High PED (elastic) → suggest small price **decrease** to increase volume
  * Low PED (inelastic) → suggest small price **increase** to boost profit
* Deliverables:
  * `Session6_Product_Performance.csv` — columns: `product_id`, `total_quantity_sold`, `total_revenue`, `profit_margin`
  * `Session6_Price_Analysis.csv` — columns: `product_id`, `price_elasticity_of_demand`, `suggested_price_change` (%)

#### Task 1.9 — Partner Lifetime Value (PLTV)

* Per partner:
  * Average purchase value
  * Purchase frequency = transactions per month
  * **PLTV = Average Purchase Value × Purchase Frequency × 36**
* Deliverable: `Session6_CLTV.csv`
  * Columns: `partner_id` (int), `pltv` (float, 2 decimal places)

#### Task 1.10 — Churn Analysis

* Identify churned partners (`churned = TRUE`)
* Calculate overall **churn rate (%)**
* Calculate **average PLTV** for churned vs. active partners separately
* Deliverable: `Session6_Churn_Analysis.csv`
  * Columns: `churn_rate` (%), `avg_pltv_churned`, `avg_pltv_active` (2 decimal places each)

---

### Assessment Criteria

* All three CSV files loaded and first 5 rows displayed per file
* Data types and non-numeric columns correctly identified
* All five categories of data quality issues documented in `Session6_DataExploration.txt`
* Missing age filled with median; missing phone/promotion_id filled with `'0'`
* Date columns correctly converted to datetime with random 9am–5pm time component
* Phone numbers standardized (only digits and leading `+` retained)
* `partners_cleaned.csv` and `sales_transactions_cleaned.csv` exported correctly
* Monthly revenue, transaction count, and average order value calculated correctly
* Three line charts created with month on x-axis
* Top 3 months by revenue identified and tabulated
* Per-product quantity, revenue, and profit margin calculated correctly
* Revenue by category bar chart created
* Top 3 best-selling products table correct
* Age distribution bar chart uses correct groups (18–24, 25–34, 35–44, 45+)
* Gender distribution shown as percentages
* Average spending calculated per membership tier
* ARIMA model fitted on daily sales time series
* 30-day forecast generated with MAE calculated
* `Session6_SalesForecast.csv` has correct columns and date format
* `total_purchases` and `avg_purchase_value` features engineered correctly
* K-means applied with 3 clusters; cluster labels assigned per partner
* Product recommendations generated (top 3 not-yet-purchased per partner based on cluster)
* PED calculated correctly per product
* Price adjustment suggestions align with elasticity direction
* All four CSV performance/price files have correct columns and sorting
* PLTV formula applied correctly (avg_value × frequency × 36)
* Churn rate, avg_pltv_churned, avg_pltv_active all correct to 2 decimal places
* All visualizations follow KMG Corporate Style Guide
* All deliverables produced and complete by end of session

---

### Sources

* [Session 6/WSC2025_TP09_S6_actual_en.pdf](Session%206/WSC2025_TP09_S6_actual_en.pdf) — Main task description (EN)
* [Session 6/WSC2025_TP09_S6_actual_en+.pdf](Session%206/WSC2025_TP09_S6_actual_en%2B.pdf) — Extended task description (EN)
* [Session 6/WSC2025_TP09_data_dictionary_en.pdf](Session%206/WSC2025_TP09_data_dictionary_en.pdf) — Data dictionary (EN)
* [Session 6/WSC2025_TP09_ARIMA_Models_actual.pdf](Session%206/WSC2025_TP09_ARIMA_Models_actual.pdf) — ARIMA technical reference
* [Session 6/sales_transactions.csv](Session%206/sales_transactions.csv) — Raw sales data
* [Session 6/products_KMG.csv](Session%206/products_KMG.csv) — Raw products data
* [Session 6/partners_KMG.csv](Session%206/partners_KMG.csv) — Raw partners data

---
