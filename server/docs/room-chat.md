# Room chat API spec

## Create new room Api

Endpoint : POST /api/rooms

Headers:

- Authorization : Bearer jwt_token

Request Body :

```json
{
  "name": "test toom name",
  "is_privated": true
}
```

Response Success Body :

```json
{
  "success": true,
  "message": "room is created"
}
```

Response Error Body :

```json
{
  "success": false,
  "message": "field error",
  "data": {
    "name": ["name is required"]
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

## List all rooms Api

Endpoint : GET /api/rooms

Headers :

- Authorization : Bearer jwt_token

Response Success Body :

```json
{
	"success": true,
	"message": "success",
	"data": [
		{
			"publicId": "f5b0b6cb-537a-4ada-8877-12dea9c650d3",
			"name": "test room",
			"lastMessage": "hello",
			"lastMessageCreated": "2025-07-23T09:35:55.739Z",
			"totalMember": "3",
			"isPrivate": true
		},
		{
			"publicId": "fac37ec8-84db-4dbb-aa89-d7bbe55e05fe",
			"name": "programing zaman now",
			"lastMessage": null,
			"lastMessageCreated": null,
			"totalMember": "1",
			"isPrivate": true
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

## Get details specific rooms api (include member)

Endpoint : GET /api/rooms/{room_id}

Headers:

- Authorization : Bearer jwt_token

Response Success Body :

```json
{
	"success": true,
	"message": "successfull",
	"data": [
		{
			"publicId": "DRVQ47I1W5",
			"username": "testname",
			"isAdmin": true
		},
		{
			"publicId": "5OS3F5I686",
			"username": "bangsyir",
			"isAdmin": false
		},
		{
			"publicId": "F2GV2Y4CK2",
			"username": "testname2",
			"isAdmin": false
		}
	]
}
```

Response Error room id not exist :

```json
{
  "success": false,
  "message": "room not found"
}
```

Auth Response Error Body :

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

## Get Room Messages Api

Endpoint : GET /api/rooms/{room_id}/messages

Headers:

- Authorization : Bearer jwt_token

Response Success Body :

```json
{
  "success": true,
  "message": "success",
  "data": {
        "room_name": "test room",
		"total_pages": 3,
		"current_page": 2,
		"has_more": true,
        "messages": [
            {
				"id": 26,
				"sender": "testname",
				"content": "how are you",
				"created_at": "2025-07-08T13:55:53.718Z",
				"is_own": false
			},
			{
				"id": 25,
				"sender": "testname",
				"content": "hello",
				"created_at": "2025-07-08T13:55:35.876Z",
				"is_own": false
			},
        ]
    } 
}
```

Response Error room id not exist :

```json
{
  "success": false,
  "message": "room not found"
}
```

Auth Response Error Body :

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

## Send Message to room Api

Endpoint : POST /api/rooms/{room_id}/

Headers:

- Authorization : Bearer jwt_token

Request Body :

```json
{
  "content": "this message from room"
}
```

Response Success Body :

```json
{
  "success": true,
  "message": "messages sended"
}
```

Response Error Input Body :

```json
{
  "success": false,
  "errors": {
    "content": ["content is required"]
  }
}
```

Response Error room id not exist :

```json
{
  "success": false,
  "message": "room not found"
}
```

Auth Response Error Body :

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

## Generate Invitation token Api

Endpoint : POST /api/rooms/{room_id}/invitation

Headers :

- Authorization : Bearer jwt_token

Response Success Body :

```json
{
  "success": true,
  "message": "success create invitaion link"
}
```

Response Error room id not exist :

```json
{
  "success": false,
  "message": "room not found"
}
```

Auth Response Error Body :

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

## Join Room From Invitation

Endpoint : POST /api/rooms/invitaions/{token}/join

Update Invitation table used_by

Headers :

- Authorization : Bearer jwt_token

Response Success Body :

```json
{
  "success": true,
  "message": "Successfull, You are joined"
}
```

Response Error token not exist :

```json
{
  "success": false,
  "message": "Token not found"
}
```

Auth Response Error Body :

```json
{
  "success": false,
  "message": "Unauthorized"
}
```
