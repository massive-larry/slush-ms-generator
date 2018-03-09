REST APIs
=========

## Resources

Most of the time a REST API will be dealing with objects of a certain type
and structure. For want of a better name, a resoure, for instance a user profile.

### resourceType

These resources will have a schema and a name, hence they should be labeled with
a `resourceType` -  e.g. `USER`

### revisionId
If appropriate they should also have a `revisionId` (i.e. version). This should
be a string and a new `revisionId` should be "greater than" the one it replaces.
Most of the time this can just be an increaing number

Example:

```
{
  "resourceType" : "USER",
  "revisionId" : "1",
  "userId" : "a70a91d4-7e7c-4709-b8fe-05e64d541021",
  "firstName" : "Jill",
  "registrationTime" : "2017-11-29T11:45:34.277Z"
}
```

## Fields and Naming Conventions

* **Keys** should be in `lowerCamelCase`
* **Values** should be of appropriate type. For instance try not to have numbers
  represented as strings if you are actually representing a number (the `revisionId`
  above is an exception as the key should be standardised but the value flexible.
* **Use arrays only when you need to** - they are harder to update and can be
  annoying to index in some databases
* **Enumerated Values** should be `UPPER_SNAKE_CASE`, these represent non-random
  values that are known or passed around (for example the `resourceType` field)
* **Random IDs should be guids** unless they need to be used by a human (for
  example if we expect a user to remember their userId)
* Timestamp values should be in ISO 8601 ms format, in UTC time. e.g.
  `"2011-10-05T14:48:00.000Z"` (just use `(new Date()).toISOString()`)
* Timestamp *keys* should should end in the string `Time`

## API Response Structure

All non error API repsonses should be a JSON object with a top level `data` field

This `data` would usually be an object but could also be an array of objects:

```
{
  "data" : {
    "resourceType" : "USER",
    "revisionId" : "1",
    "userId" : "a70a91d4-7e7c-4709-b8fe-05e64d541021",
    "firstName" : "Jill",
    "registrationTime" : "2017-11-29T11:45:34.277Z"
  }
}
```
If returning multiple resources:

```
{
    "data" : [
        { "resourceType" : "USER" },
        { ... },
        ...
    ]
}
```

## Error Response Structure

All error responses should contain:

1. An `statusCode` field which matches the http status that was sent
3. An `errorCode` string which should be in _CamelCaps_. It should be human
   readable but also fixed so that it can be used by the consumer to
   identify specific errors. If the error is non specific it should fall back
   to the default code for this status (i.e. `BadRequest`, `InternalServerError`
    etc)
4. An `message` string which is human readable and decribes the error

Example:

```
{
  "statusCode": 400,
  "errorcode": "BadRequest",
  "message": "Uknown field 'test'"
}
```

## Resource updates

To update a resource, expost an HTTP PATCH endpoint which adhers to the
[JSON Merge Patch](https://tools.ietf.org/html/rfc7396) specification. In
summary send in what you want to update. The merge logic is:

* All values except Objects are replaced
* `null` removes that key
* Each key in an object is merged according to these rules

So it will basically do what you expect, remembering that arrays are replaced.
See [here](https://tools.ietf.org/html/rfc7396#section-3) for an example

## URL Path structure

1. Always have a version at the start: e.g. `/v1/...`
2. Always have the name of the service/resource/business unit after that e.g.
   `/v1/users/...`
3. Use plurals i.e. `users` not `user`

## Response Schemas

1. Add new fields whenever you like - clients should never fail validation if a
   a new key is added to a response
2. Never make a breaking change, instead just version your API and remove the
   old version when nobody uses it anymore
3. Do not vary the response based on who the client is. i.e. if you have an API
   to get a user profile, do not implement `GET /v1/users` and take a user
   id from a header or an authentication token, instead always force the client
   to specify the resource they want: `GET /v1/users/1234`.
