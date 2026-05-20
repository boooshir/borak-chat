# Friendship API spec

## Friend request api

Endpoint : POST /api/friend-request

Headers:

- Authorization : Bearer jwt-token

Request Body:

```json
{
  "friendPublicId": "asas3nkasd2"
}
```

Response Success Body:

```json
{
  "success": true,
  "message": "Friend request sent."
}
```

Response Error Body:

```json
## not found error
{
  "success": false,
  "message": "user not found"
}
## field error
{
    "success": false,
    "message": "invalid field",
    "errors": {
        "friendPublicId": ["Expected string, received number"]
    }
}
```

Auth Response Error Body :

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

## Incoming friend request api

Endpoint: GET /api/friend-request/incoming

Headers:
-Authorization : Bearer jwt-token

Response Success Body:

```json
{
  "success": true,
  "messae": "success retrive incoming list",
  "data": [
    {
        "status": "pending",
        "createdAt": "2025-07-03T08:28:46.135Z",
        "token": "0197cf67-0aae-7000-bf22-cd1b64d055c9",
        "requester": {
            "public_id": "asda32wes",
            "username": "testname"
        }
    } 
  ]
}
```

Auth Response Error Body :

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

## Outgoing friend request api

Endpoint: GET /api/friend-request/outgoing

Headers:
-Authorization : Bearer jwt-token

Response Success Body:

```json
{
  "success": true,
  "messae": "success retrive incoming list",
  "data": [
    {
        "status": "pending",
        "createdAt": "2025-07-03T08:28:46.135Z",
        "requester": {
            "public_id": "asda32wes",
            "username": "testname"
        }
    } 
  ]
}
```

Auth Response Error Body :

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

## Accept Friend Request API

Endpoint: PUT /api/friend-request/{request_token}/accept

Headers:

- Authorization : Bearer jwt_token

Response Success Body:

```json
{
  "success": true,
  "message": "Request Friend accepted"
}
```

Response Error Body:

```json
{
  "success": false,
  "message": "opss somthing wrong"
}
```

Auth Response Error Body :

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

## Rejected Friend Request API

Endpoint: PUT /api/firend-request/{request_token}/rejected

Headers:

- Authorization : Bearer jwt_token

Response Success Body:

```json
{
  "success": true,
  "message": "Request Friend rejected"
}
```

Response Error Body:

```json
{
  "success": false,
  "message": "opss somthing wrong"
}
```

Auth Response Error Body :

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

## Get Friend List API

Endpoint: GET /api/friends

Headers:
-Authorization : Bearer jwt_token

Response Success Body

```json
{
  {
    "success": true,
    "data": [
      	{
			"publicId": "DRVQ47I1W5",
			"username": "testname",
			"createdAt": "2025-06-09T09:53:04.207Z"
		},
		{
			"publicId": "F2GV2Y4CK2",
			"username": "testname2",
			"createdAt": "2025-06-26T07:19:27.089Z"
		}    
    ]
  }
}
```

Auth Response Error Body :

```json
{
  "success": false,
  "message": "Unauthorized"
}
```
