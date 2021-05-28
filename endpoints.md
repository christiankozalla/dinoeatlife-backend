# Puroviva Backend Endpoints

## Authentication and authorization in Puroviva:

- Authentication makes sure, the user is who they say they are. Users can create an account (email, password) to register, then authenticate via said email and password (i.e. login to the application)
- Authorization opens or closes resources for an authenticated user depending on their role. Authorization might play a minor role in Puroviva, since an authenticated user should be able to access every resource in their household

Every user is associated with a household

- A new user can create its own household
- Or a new user can be invited by a user of an existing household to join the household

### Resources of a household

A household can posses several resouces (or entities) which are created by its users

- Recipes: A recipe contains information about the preparation of a meal/dish
- Meals: A meal states when a certain recipe will be cooked and consumed together
- Ingredients: A list of items needed to prepare the meals. An ingredient object also contains information about the current availablility in the household

### Shared resources within a household

- Recipes: They contain the preparation, ingredients, etc and a reference to the user who created the recipe. Recipes are shared among all users of a household (perform GET), but only the creator of a recipe can perform GET, PUT, DELETE (see authorization) on an existing recipe
- Meals: Meals are shared among all users of a household (perform GET), but only the creator of a meal can perform GET, PUT, DELETE (see authorization) on an existing meal
- Ingredients: Ingredients are shared among all users of a household (perform GET). If a meal has been consumed, the referenced ingredients will be automatically removed from the stored ingredients Every user of a household can do CRUD on the shared ingredients

### User resources not associated with a household

- Posts: Posts are always public and not associated with a household. Posts are associated with the user who created the post

## Public Endpoints

<hr>

A public endpoint can be accessed without authentication (or authorization)

### Authentication

Every route protected by auth will expect a valid ACCESS_TOKEN in the Authorization header. If no ACCESS_TOKEN provided, the server will ask for a REFRESH_TOKEN to issue a new ACCESS_TOKEN for the user. If both fails, the route cannot return data.

A valid REFRESH_TOKEN can only be used to create a fresh ACCESS_TOKEN. Not to access any protected routes. A REFRESH_TOKEN can only be sent to the /refresh endpoint.

- POST /register - creates a new user (and a new home, if user was not invited before)

- POST /login - takes the users stored credentials (email, password) and returns an ACCESS_TOKEN (in-memory) and a REFRESH_TOKEN (httpOnly cookie) if credentials are valid

- GET /refresh - expects a valid REFRESH_TOKEN as a cookie. Creates a new ACCESS_TOKEN

### Posts

- GET /posts - returns all recent posts; LIMIT: 20 (?)
- GET /posts/{userId} - returns all recent posts by a user; LIMIT: 10

### Users

- GET /users/{userId} - returns the users public profile; e.g. name, bio, posts

## Protected Endpoints by Auth

<hr>

### Posts

- POST /posts - creates a post by an authenticated user
- PUT /posts/{postId} - updates a post - only the user, who created the posts is authorized
- DELETE /posts/{postId} - deletes a post - only the user, who created the posts is authorized

### Users

- POST /users - creates a user (i.e. register)
- PUT /users/{userId} - updates part of the users information - e.g. add or update (optional) profile, change name or password
- DELETE /users/{userId} - deletes a users account, removes them from the associated household

### Household

- POST /home - creates a new home - if a new user has not been invited, a new home will be created for him on register. A user has exactly one home, on the other hand a home can have many users (> 1).
- GET /home/{homeId}?recipe=listAll||recipeId&meal=listAll||mealId&ingredients=listAll - returns all kinds of resources of a household - user must be authenticated AND member of the home - query params recipe, meal, ingredients

### Developer's Notes

<hr>

Hapi provides a way to put **all the routes** under an authentication strategy

```js
// Protect all the routes by default
server.auth.default(NAME_OF_THE_AUTH_STRATEGY);

// Then expose some endpoints to the public
server.route({
  {
    method: "POST",
    path: "/login",
    options: {
      auth: false,
      ...
    }
  }
})
```

<hr>

Hapi provides access to a "global state object" inside of each route handler function.

Things that should be used in all kinds of places of the server can be attached to the object to be ubiquous availible.

```js
// Inside a prismaPlugin we add the prima client instance to global object

server.app.prisma = prisma;

// Once the plugin is registered, we can use the prisma client in each route handler like so:

const { prisma } = request.server.app;
```
