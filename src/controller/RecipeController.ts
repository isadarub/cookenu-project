import { Request, Response } from "express";
import { RecipeDatabase } from "../database/RecipeDatabase";
import { Recipe } from "../models/Recipe";
import { USER_ROLES } from "../models/User";
import { Authenticator } from "../services/Authenticator";
import { IdGenerator } from "../services/IdGenerator";

export class RecipeController {
    public getRecipes = async (req: Request, res: Response) => {
        let errorCode = 400
        try {
            const token = req.headers.authorization
            const search = req.query.search as string

            if (!token) {
                errorCode = 401
                throw new Error("Missing token")
            }

            const authenticator = new Authenticator()
            const payload = authenticator.getTokenPayload(token)

            if (!payload) {
                errorCode = 401
                throw new Error("Invalid Token")
            }

            const recipeDatabase = new RecipeDatabase()

            if(search){
                const recipesDB = await recipeDatabase.searchRecipes(search)
                const recipes = recipesDB

                res.status(200).send({ recipes })
            } else {
            
            const recipesDB = await recipeDatabase.getAllRecipes()
            const recipes = recipesDB.map((recipeDB) => {
                return new Recipe(
                    recipeDB.id,
                    recipeDB.title,
                    recipeDB.description,
                    recipeDB.created_at,
                    recipeDB.updated_at,
                    recipeDB.creator_id
                )
            })

            res.status(200).send({ recipes })
        }
        } catch (error) {
            res.status(errorCode).send({ message: error.message })
        }
    }

    public createRecipe = async(req:Request, res:Response) => {
        let errorCode = 400
        try {
            const title = req.body.title
            const description = req.body.description
            const token = req.headers.authorization

            if (!token) {
                errorCode = 401
                throw new Error("Missing token")
            }

            const authenticator = new Authenticator()
            const payload = authenticator.getTokenPayload(token)

            if (!payload) {
                errorCode = 401
                throw new Error("Invalid token")
            }

            const idGenerator = new IdGenerator()
            const id = idGenerator.generate()

            const recipe = new Recipe(
                id, 
                title, 
                description,
                new Date(),
                new Date(),
                payload.id
            )

            const recipeDatabase = new RecipeDatabase()
            const addRecipe = await recipeDatabase.createRecipe(recipe)
            
            res.status(201).send({
                message: "Success",
                recipe: recipe
            })
            
        } catch (error) {
            res.status(errorCode).send({
                message: error.message
            })
        }
    }

    public editRecipe = async (req: Request, res: Response) => {
        let errorCode = 400
        try {
            const token = req. headers.authorization
            const id = req.params.id
            const title = req.body.title
            const description = req.body.description

            const authenticator = new Authenticator()
            const payload = authenticator.getTokenPayload(token)

            if(!payload){
                errorCode = 401
                throw new Error("Invalid token");
            }

            if(!title && !description){
                errorCode = 422
                throw new Error("Missing params. Insert a title or a description.")
            }

            if(title && typeof title !=="string"){
                errorCode = 422
                throw new Error("Title must be string type");
            }

            if(description && typeof description !== "string"){
                errorCode = 422
                throw new Error("Description must be string type");
            }

            if(title && title.length < 3 || description && description.length < 10){
                errorCode = 422
                throw new Error("Title must be at least 3 characters, and description at least 10");
            }

            const recipeDatabase = new RecipeDatabase()
            const recipeDB = await recipeDatabase.findById(id)

            if(!recipeDB){
                errorCode = 404
                throw new Error("Recipe not found");
            }

            if(payload.role === USER_ROLES.NORMAL){
                if(payload.id !== recipeDB.creator_id){
                errorCode = 403
                throw new Error("Normal users can only modify their own recipes"); 
                }
            }

            const recipe = new Recipe(
                recipeDB.id,
                recipeDB.title,
                recipeDB.description,
                recipeDB.created_at,
                recipeDB.updated_at = new Date(),
                recipeDB.creator_id
            )

            title && recipe.setTitle(title)
            description && recipe.setDescription(description)

            await recipeDatabase.editRecipe(recipe)

            res.status(200).send({
                message: "Successfully updated!",
                recipe
            })


        } catch (error) {
            res.status(errorCode).send(error.message)
        }
    }

    public deleteRecipe = async (req: Request, res: Response) => {
        let errorCode = 400
        try {
            const token = req.headers.authorization
            const id = req.params.id

            if(!token){
                errorCode = 401
                throw new Error("Missing token");
            }

            const authenticator = new Authenticator()
            const payload = authenticator.getTokenPayload(token)

            if(!payload){
                errorCode = 401
                throw new Error("Invalid token");
            }

            const recipeDatabase = new RecipeDatabase()
            const recipeDB = await recipeDatabase.findById(id)
            
            if (!recipeDB){
                errorCode = 404
                throw new Error("Recipe not found");
            }

            if(payload.role === USER_ROLES.NORMAL){
                if(payload.id !== recipeDB.creator_id){
                    errorCode = 403
                    throw new Error("Normal users can only modify their own recipes");
                }
            }

            await recipeDatabase.deleteRecipeById(id)

            res.status(200).send("Recipe deleted successfully!")
        } catch (error) {
            res.status(errorCode).send(error.message)
        }
    }

}