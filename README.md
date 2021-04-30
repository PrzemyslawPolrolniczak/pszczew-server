# Pszczew-server

## What is it?
###### The general purpose of this app is to create system for summer house reservation

## What technologies do it use?

* Node.js
* Express
* TypeScript
* GraphQL
* Apollo
* TypeGraphQL
* PostgreSQL
* Redis
* MikroORM

## How to run it?

In order to be able to run it:

1. You need to install:
- PostgreSQL (https://www.google.com/search?q=how+to+install+postgresql)
- Redis (https://www.google.com/search?q=how+to+install+redis)
2. You need to create `.env` file in your project directory and configure it
```dotenv
DB_NAME= # Name of your PostgreSQL database
DB_PASSWORD= # Password to your PostgreSQL database
APP_PORT= # Specify any port you want for BE to listen on
SESSION_SECRET= # Used to sign the session cookie, this might be anything you want
```

### Todo besides of new functionalities:
- [ ] Dockerize it
- [ ] Add CI/CD