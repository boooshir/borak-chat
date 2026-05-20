# Auth API spec

## Register user api

Endpoint : POST /api/auth/register

Request Body :

```json
{
  "username": "testname",
  "email": "test@mail.com",
  "password": "12345678"
}
```

Response Success Body

```json
{
  "success": true,
  "message": "success",
  "data": {
    "id": 1,
    "username": "testusername",
    "email": "test@mail.com",
    "createdAt": "1-5-2025",
    "updatedAt": "1-5-2025"
  }
}
```

Response Error Body

```json
{
  "success": false,
  "message": "Error",
  "errors": {
    "username":["username is required"|"username is already registered"],
    "email" : ["invalid email"|"email is already registered"],
    "password": ["password is required"],
  }
}
```

## Login user api

Endpoint : POST /api/auth/login

Request Body :

```json
{
  "username": "testname",
  "password": "12345678"
}
```

Response Success Body

```json
{
  "success": true,
  "message": "success",
  "data": {
    "token": "jwt-token"
  }
}
```

Response Error Body

```json
{
  "success": false,
  "message": "Error",
  "errors": {
    "username":["username is required"|"username is already registered"],
    "password": ["password is required"],
  }
}
```

## Update user api

Endpoint : PUT /api/auth/me
Headers :

- Authorization : Beareer jwt-token

Request Body :

```json
{
  "username": "testname",
  "email": "test@mail.com",
  "password": "12345678"
}
```

Response Success Body

```json
{
  "success": true,
  "message": "success",
  "data": {
    "public_id": "public id",
    "username": "testusername",
    "email": "test@mail.com",
    "createdAt": "1-5-2025",
    "updatedAt": "1-5-2025"
  }
}
```

Response Error Body

```json
{
  "success": false,
  "message": "Error",
  "errors": {
    "username":["username is required"|"username is already registered"],
    "email" : ["invalid email"|"email is already registered"],
    "password": ["password is required"],
  }
}
```

## Get user api

Endpoint : GET /api/auth/me
Headers :

- Authorization : Beareer jwt-token

Response Success Body

```json
{
  "success": true,
  "message": "success",
  "data": {
    "id": 1,
    "username": "testusername",
    "email": "test@mail.com",
    "createdAt": "1-5-2025",
    "updatedAt": "1-5-2025"
  }
}
```

Response Error Body

```json
{
  "success": false,
  "message": "Unautorized"
}
```
