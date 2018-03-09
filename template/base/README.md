# [[ Inter Project Name ]]
How to start the microservice:

For locahost, set up your ENV variable CONFIG_ENV to localhost

- Linux:
  - npm install
  - npm run build
  - npm start

- Windows:
  - npm install
  - npm run build
  - npm run start-win

- Allowed ENV variables
  - PORT - set up port
  - logLevel - set up the log level for bunyan
  - NODE_ENV - should be set to "development" or "production"
  - CONFIG_ENV - to same name as file in config/env to load it
    - Standard envs for deployment are: dev, test, stag, prod
    - For localhost development, you can use localhost CONFIG_ENV or write your own
    - For tests set up CONFIG_ENV=integration
    - Merging arrays is not working as expected, do not use array if possible and if you use array, dont create default items in src/config/config
  - deploymentVersion - what you put here will appear at /version endpoint

- Set up heap space
  - Node.js app takes 25MB(Node 8.9.1)-35MB(Node 6.12.0) of memory in docker container without any heap taken
  - Stack and Buffer are not in heap space either, in general at least 15 MB is used
  - If you need to use buffer extensively (i.e. working with files) you need more heap space
  - At total have at least 50MB outside of heap space
  - For 512MB docker container set the heap space to 460MB
    - Set the environment variable to CUSTOM_MAX_OLD_SPACE_SIZE=460
    - If CUSTOM_MAX_OLD_SPACE_SIZE is not set up, 460 is used by default

Information about ENV variables can be found [here](https://wiki.massiveinteractive.com/display/PERLIV/ENV+variables+for+Microservices)

This code is using API 1.0.0, link: //todo when swaggerhub is up and running

### You should know
#### Controller handling
In middleware/index.ts are methods errorHandler and standardHandler, all requests should end
in one of this method

in routes/api.ts you can see the endpoint defined. The handleController wraps last controller,
so you do not have to think about try-catching errors etc. Whatever promise is returned from
the function passed as parameter (the controller method), is processed to the output for user

Use this approach all the time, do not use res.json on your own.


## Postman

- Download [postman collection](https://www.getpostman.com/collections/b445169440b10401080c)
  - Or import file Massive-Template.postman_collection.json from root
- Create new environment, set baseurl to http://localhost:3000

## How to start with new microservice
- [Create new repository on Github](https://wiki.massiveinteractive.com/display/PERLIV/DAZN+Github#DAZNGithub-SettingupRepository)
- Clone it to locally
- Copy all the files from template beside /node_modules and dist
- Run npm install, npm run build, npm run test to see if everything is alright
- Commit and push to develop and master
    - [commits naming convention](https://wiki.massiveinteractive.com/display/MASENG/Git+Workflow#GitWorkflow-Commitsnamingconventions)
- Go to readme.md and change the name on first line
    - [readme.md sample](https://github.com/wearehive/project-guidelines/blob/master/README.sample.md)
- Go to package.json and change the version, name, repository etc.
- Start coding

## How to use template

### GIT
We are following GIT flow, you can read about it [here](http://nvie.com/posts/a-successful-git-branching-model/) or [here](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
  - all your new features you create in separate branch, then you create PR into develop
  - when you have all you want in develop you create release branch from it
    - release branch looks like release-1.4.4
    - in release branch, you should focus on changing version in package.json and update readme.md and changelog.md
    - when you are satisfied, create PR to master
  - when release branch is merged into master, create tag with that version and push it into the remote

### Versioning
Follow [this](https://wiki.massiveinteractive.com/display/PERLIV/Microservice+Versioning)

For API we are following the API-first design. The semantic version of microservice is not
directly tight to API version.

Define your API on swaggerhub independently to this project, but reference correct version
in readme.md and in src/config/defaults (apiVersion)

### Logging
We are using bunyan, if you are in req-context, use req.state.logger to log anything. This logger
automatically adds correlationId and sessionId to your logs, which makes them trackable.

You have to pass logger (and anything else in req.state) to services and repositories.
Look to /services/generalService.ts

If you want to log something outside the request-chain, require logger directly and log it

Remeber to:
- Every log should have the message
- Bunyan requires object first, string message as second one
- Use the serializers (currently futureModules/serializers) to serialize known object for your microservice

### Folder structure and meanings
All requests should follow this path:
- controllers -> services -> repositories -> components
- to see how this looks like in real app, you can look to [develop-showcase](https://github.com/getndazn/microservice-template-nodejs/tree/develop-showcase) branch
  - some parts can be outdated, but basic structure remains
- if you do not have any database or data source, you do not need repositories
  - controllers -> services is enough
  - controllers -> services -> components can be used too, if you do not want to include repositories
    - however do it only if you know what you are doing or do a consultation

The folders:
- components
  - should be the main access point for all external services and libraries
  - i.e. mongoose, s3, redis
  - mocking decision (return mock or real service) should be done here
- config
  - obtains all the configuration
- controllers
  - first access point for all requests
  - should just handle input/output and call correct service method
  - do not put any business logic here
- errors
  - contains standard errors that application understands
- futureModules
  - temporary folder with modules that should be pass to private modules in future
- middleware
  - should contain all middlewares method
- routes
  - here you define connection between URL and your controllers
  - all middlewares should be handled here
- repositories (if they exist)
  - should be connection point between component (i.e. massMongoose) and service (i.e. userService)
  - you can put "correct data"-related business logic here, i.e. "all users should have lowered email before saving to db"
  - for different repositories, look to branches named like develop-mongo, develop-redis
- services
  - all business logic should be here
  - services can call each other
  - services should call repositories for access to data sources
    - they should not call data sources directly

### Mocking
If it is possible, put the decision about using/not using mock in configuration as boolean (true/false), i.e. "mockMongo: true"
- in components/your_service_like_mongoose create general access point to data source you want
- based on boolean, the component should return mock or real service
- if it is not necessary, do not have any "useMongo" inside controller, service or repository
  - try to be as close to production env as possible even with mocks

You can look to develop-showcase mentioned earlier, there are simple mocks

### General coding tips
- classes
  - controllers, services and repositories should not be classes
    - you do not want to think about creating instance of service when you require it
  - if you do not have to create several instances, do not use classes
    - keep it simple and "node.js" - every file is kind of Singleton, do not fight with it
  - it is perfectly fine to create classes when you really need them
    - think about if this is really the case

- do not mutate
  - if you receive any parameter in your function, make absolutely sure, you do not change it
    - see Examples section below
  - use _.cloneDeep (almost always safe) or _merge (care about shallow copy and that the first object is mutated)


### Examples

This will change the original req.query!
```javascript
   function someMiddleware(req, res, next) {
      const myParams = req.query;
      myParams.ohno = 'I am changed';
   }
```

This is safe
```javascript
   function someMiddleware(req, res, next) {
      const myParams = _.cloneDeep(req.query);
      myParams.ohno = 'I am changed';
   }
```
