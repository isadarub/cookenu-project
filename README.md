# 🧑‍🍳 Cookenu

A simple cooking recipe system. This system will allow the registration, access and manipulation of users and recipes (main two entities of Typescript, made in classes).

## API Documentation
You can found the complete documentation

[HERE!](https://documenter.getpostman.com/view/20789432/VUjMqSXe)


## Deploy

You can test the API by the deployed version, available in:

[THIS LINK](https://cookenu-belle-project.herokuapp.com/)


## Features

### SIGNUP:
- Receives a nickname, an e-mail and a password to insert a new user.

### LOGIN:
- Receives an e-mail and a password. Return your authentication token.

### GET ALL USERS:
- Get the users list (DEMAND AN AUTHENTICATION TOKEN). You can also search, to find users by nickname and email.

### CREATE RECIPE:
- Create a new recipe post in DB, with a title and a description.

### GET RECIPES:
- Get the recipes list. Only for ADMIN accounts.

### DELETE USER:
- Delete an user founded by id. Only for ADMIN accounts.

### UPDATE RECIPE:
- Receive a title OR a description (can be both, too) and changes the recipe founded by ID. NORMAL accounts can only modify their own recipes.

### DELETE RECIPE:
- Finds a recipe by ID and deletes it. NORMAL accounts can only delete their own recipes.




## Stack

**Back-end:** Node, Express
- [HEROKU APP](https://www.heroku.com)
- [POSTMAN](https://www.postman.com/)

## Autores

- [@isadarub](https://www.github.com/isadarub)
