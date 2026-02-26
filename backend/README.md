# Fast API

Run the following commands to run the development server:

If you're not in the `backend` folder use the following command to enter the `backend` folder.
>cd backend

To create new virtual environment run the following command. *Run this command for once*:
> python -m venv venv

This command will create a `venv` folder in the current folder. This folder is the python's child interpreter.

Next step is to activate the python's `vitual envirnoment`.
For Windows users:
>.\venv\Scripts\activate

For Linux & Mac users:
>source ./venv/bin/activate

If you haven't installed the required packages run the following command *Use this command for once*:
> pip install -r requirements.txt

If database is not initialize run the following command to create database tables:
> python main.py migrate

If you want to create an admin user run the following command:
> python main.py createsuperuser

To run the development server run the following command:
> python main.py runserver

Use `CTRL + C` to stop the server.