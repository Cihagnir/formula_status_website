# Backend for Website: README

## Overview

This project involves the development of a backend system for a website using **Python Flask** framework. The backend is responsible for handling REST API requests from the frontend, performing the necessary operations, and returning appropriate responses. The backend integrates with various technologies and services to deliver a robust and efficient system.

### Key Technologies:

- **Python Flask**: Core framework for building the backend and handling REST API endpoints.
- **AWS RDS with MySQL**: Database system for storing and managing data.
- **AWS EC2**: Hosting and deployment of the backend server.
- **Plotly**: For generating and returning data visualizations as JSON objects.
- **Open F1 API**: For periodically updating database content.

## System Architecture

1. **Frontend Interaction**:

   - The backend exposes REST API endpoints to the frontend.
   - API endpoints handle CRUD operations and visualization requests.

2. **Database Operations**:

   - A MySQL database hosted on AWS RDS stores the necessary data.
   - Backend processes incoming requests and performs database queries to retrieve or update information.

3. **Data Visualization**:

   - When required, the backend processes data and uses Plotly to generate graphical representations.
   - These visualizations are returned to the frontend as Plotly JSON objects.

4. **Data Updates**:

   - The backend interacts with the Open F1 API at specified intervals to fetch updated data.
   - Retrieved data is processed and inserted into the MySQL database to ensure information is current.

5. **Deployment**:

   - The backend is deployed on an AWS EC2 instance for scalability and reliability.
   - A Python virtual environment is used during deployment as a security measure.

## Detailed Functionality

### 1. Handling REST API Requests:

- The backend routes are defined using Flask to handle specific endpoints.
- Examples of API operations:
  - Retrieving data from the database.
  - Sending processed data as JSON.
  - Returning Plotly JSON objects for graphical representations.

### 2. Database Integration:

- Using SQLAlchemy or PyMySQL, the backend connects to the MySQL database on AWS RDS.
- Operations include:
  - Fetching records based on query parameters.
  - Inserting new data from the Open F1 API.
  - Updating existing records.

### 3. Visualization with Plotly:

- Data retrieved from the database is processed for visualization.
- The backend generates Plotly charts (e.g., line charts, bar charts).
- Visualizations are serialized into Plotly JSON format and sent to the frontend.

### 4. Open F1 API Integration:

- A scheduled task queries the Open F1 API for fresh data.
- Newly fetched data is validated, processed, and stored in the MySQL database.

### 5. Deployment:

- The Flask application is packaged and deployed on an AWS EC2 instance.
- Deployment considerations include:
  - Configuring the instance for scalability.
  - Ensuring security through proper IAM roles and instance security groups.
  - Setting up environment variables for sensitive configurations (e.g., database credentials).
  - Using a Python virtual environment to isolate dependencies and enhance security.

## Getting Started

### Prerequisites

- Python 3.8+
- Flask 2.0+
- MySQL database (configured on AWS RDS)
- AWS EC2 instance for deployment
- Access to Open F1 API

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

3. Configure environment variables:

   - `DATABASE_URL`: Connection string for the MySQL database.
   - `API_KEY`: Key for accessing the Open F1 API.



### Deployment

1. Package the application and transfer it to an AWS EC2 instance.

2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install necessary dependencies within the virtual environment:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure the Flask app to run as a service using tools like `gunicorn` or `uwsgi`.

5. Set up a reverse proxy with Nginx.


## Basic Code Rules

These parts explain the code standards to follow. While not conventional, they aim to be as clear as possible.

1. **Snake Case for Main Usage**:

   - External libraries should remain distinct.

2. **Use 2-Space Tabs**:

   - To accommodate varying screen widths.

3. **Descriptive Variable Names**:

   - Variable names should be clear and self-explanatory, without being overly verbose.

4. **User Type Indications**:

   - Example: `status_controller_interface`, `xxx_xxx_struct`

5. **Variable Type Indications**:

   - Example: `default_input_json`, `session_year_int`

6. **Function Naming**:

   - Function names should start with a capital letter.
   - Example: `Sql_Data_Retriever`, `User_Selection_Handler`

## Future Enhancements

- Add more endpoints for extended functionalities.
- Optimize database queries for better performance.
- Introduce caching mechanisms for frequently accessed data.
- Expand integration with additional APIs for enriched data sources.




