# Online Bus Monitoring & Management system
Students often face difficulties because they do not know the exact location or arrival time of their university bus, which leads to delays, long waiting times, and missed buses. At the same time, managing student fees manually creates errors, confusion, and extra workload for the administration. No combined system can track buses in real time and manage student fee records accurately.

## Objectives
1) To provide real-time tracking of university buses.
2) To reduce waiting time and prevent students from missing
3) To improve the safety and monitoring of students during 
travel

## Methodology
```mermaid
flowchart TD;
T1("Requiement Gathering")
T2("Analysis")
T3("Plan")
T4("UI/UX Design")
T5("Implementation")
T6("Debug")
T7("Deployment")
T8("Final Testing")
T9("Represent")
T1 --> T2 --> T3 --> T4 --> T5 --> T6 --> T7 --> T8 --> T9
T6 ----> T3
```

## Technologies
Following technologies are used in the development of this project
#### Integrated Development Environments (IDE)
- Visual Studio Code
- Android Studio
#### Frontend Tools
- ReactJS
- ViteJS
- Tailwind CSS
- JavaScript
#### Backend Tools
- Fast-API
- MySQL
#### Mobile Tools
- React Native
- TypeScript

## Requirements
Here are the following requirements need to be installed to run this project
- NodeJS v22.12.0
- Python 3.13.7
- Android Studio with latest SDK
- Android Emulator (minimum Android 7)

## Run Development Environment
These points will help you run the project only in the development environment. Please contact developers for production environment.
- Download the project from the GitHub using 
```
git clone https://github.com/moeezraza35/OBMMS.git
```
- Open a terminal window in the project folder and run the following commands
```
cd frontend
npm install
npm run dev
```
These commands will run the frontend server on port *:3000. You can access it using http://localhost:3000.

- Open a new terminal window in the project folder and run the following commands
```
cd backend
python -m venv venv
```
- For Windows users
```
.\venv\Scripts\activate
```
- For Linux/Mac users
```
source ./venv/bin/activate
```
```
pip install -r requirements.txt
python main.py
```
These commands will run the backend server on port *:8000. You can access it using http://localhost:8000.

## Timeline
- Requirement gathering - 24 Nov 2025
- Analysis - 10 Dec 2025
- Main page UI design - 16 Dec 2025

## Refrences
- https://vite.dev/guide/
- https://www.w3schools.com/react/
- https://tailwindcss.com/docs/installation/using-vite
- https://www.geeksforgeeks.org/python/fastapi-introduction/
- https://www.tutorialspoint.com/fastapi/fastapi_uvicorn.htm
- https://www.tutorialspoint.com/sqlalchemy/
- https://docs.sqlalchemy.org/en/20/orm/quickstart.html
- https://planetscale.com/blog/using-mysql-with-sql-alchemy-hands-on-examples
- https://www.tutorialspoint.com/sqlalchemy/
- https://www.svgrepo.com/
