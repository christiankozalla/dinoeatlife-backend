# Home - Endpoints

The Household (aka home) entity / table is a reference for all shared resources within a home of many users

All users of a home can perform CRUD on ingredients

- GET /home/{homeId}/ingredients
- POST /home/{homeId}/ingredients
- PUT /home/{homeId}/ingredients/{ingredientId}
- DELETE /home/{homeId}/ingredients/{ingredientId}

A user can perform CRUD on all his recipes, meals and posts

- GET /home/{homeId}/recipes - possible for all users of the home, ACCESS_TOKEN is proof that user is part of household
- POST /home/{homeId}/recipes - creates a new recipe, userId attached as creator
- PUT /home/{homeId}/recipes/{recipeId} - updates an existing recipe, userId in ACCESS_TOKEN must match creator
- DELETE /home/{homeId}/recipes/{ingredientId} - deletes an existing recipe, userId in ACCESS_TOKEN must match creator


Authentication and Authorization:

1. The user has to submit a valid ACCESS_TOKEN via headers
2. AND a DB query must proof that the user belongs to the home (i.e. userId from ACCESS_TOKEN matches one in the list of userIds in Household table)