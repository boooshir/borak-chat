# Direct Messaged API spec

## Retrive Direct Messages API

Endpoint: GET /api/messages/direct/:friendId

Headers:
-Authorization : Bearer jwt_token

Response Success Body :

```json
{
  "success": true,
  "data": {
        "friendName": "testname",
        "currentPage" : 1,
        "totalPage" : 11,
        "hasMore": true,
        "messages": [
            {
                "id": 1,
                "content": "tis his content",
                "isRead": false,
                "sender": "bangsyir",
                "isOwn": false 
            },
            {
                "id": 2,
                "content": "tis his content",
                "isRead": false,
                "sender": "testname",
                "isOwn": true 
            },
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

## Send direct message Api

Endpoint: POST /api/messages/direct/:friendId

Headers:
-Authorization : Bearer jwt_token

Request Body:

```json
{
  "content": "test message",
}
```

Respose Success Body :

```json
{
  "success": true,
  "message": "success",
  "data": {
    "content": "test message",
    "receiver_id": 3
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

## Mark a direct message as read API

Endpoint : PUT /api/messages/direct/:friendId/read
Headers :

- Authorization : Bearer jwt_token

Response Success Body :

```json
{
  "success": true,
  "message": "success updated read message"
}
```

Response Error Body :

```json
{
  "success": false,
  "message": "message is not found"
}
```

Auth Response Error Body :

```json
{
  "success": false,
  "message": "Unauthorized"
}
```
