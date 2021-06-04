# Posts - Endpoint

## Public

- GET /posts - returns all recent posts; LIMIT: 20 (?)
- GET /posts/{userId} - returns all recent posts by a user; LIMIT: 10

## Private

With Authentication - only the User themself is authorized!

Token payload in "authorization" header must include the users id. Must match {userId} e.g. token.payload.userId === request.params.userId

- POST /posts - creates a post by an authenticated user
- PUT /posts/{postId} - updates a post - only the user, who created the posts is authorized
- DELETE /posts/{postId} - deletes a post - only the user, who created the posts is authorized - (soft delete: sets isDeleted to true)
