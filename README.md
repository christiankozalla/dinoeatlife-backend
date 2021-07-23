<img src="https://user-images.githubusercontent.com/59053508/126830750-5b79bd56-dc24-4418-8168-94dc44e641ad.png" alt="Dino Eat Life Logo" width="69px" height="94px" style="display: block; margin: 0 auto;">

<h1 style="text-align: center;">Dino Eat Life - Backend</h1>

The backend of Dino Eat Life is a Node.js API built with

- [Hapi.js](https://hapi.dev/)
- [PostgreSQL](https://postgresql.org/) running in [Docker](htts://docker.com/)
- [Primsa](https://prisma.io/)
- [Hapi-Auth-JWT2](https://github.com/dwyl/hapi-auth-jwt2)

## Database Schema

All tables for data entities are created withing `prisma/schema.prisma` using Prismas declarative language for data modeling. The data model though pretty stable is still subject to changes in development.

## Routes

The API provides a documentation which can be accessed via `http://<base_url>/documentation`. The documentation is generated with [Hapi-Swagger](https://www.npmjs.com/package/hapi-swagger)

- `/home` to fetch data related to the authenticated user and their family members or flat mates
- `/posts` for CRUD operations on users' posts
- `/profile` to fetch a users profile (public) or CRUD by the authenticated user
- `/register` to register users
- `/login` to login users and return JWTs
- `/validate` to verify email token for email verification (still in development)
