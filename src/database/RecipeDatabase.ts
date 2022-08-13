import { IRecipeDB, Recipe } from "../models/Recipe";
import { BaseDatabase } from "./BaseDatabase";

export class RecipeDatabase extends BaseDatabase {
    public static TABLE_RECIPES = "Cookenu_Recipes"

    public getAllRecipes = async () => {
        const recipesDB: IRecipeDB[] = await BaseDatabase
            .connection(RecipeDatabase.TABLE_RECIPES)
            .select()
        
        return recipesDB
    }

    public searchRecipes = async(search: string) => {
        const result:IRecipeDB[] = await BaseDatabase
            .connection(RecipeDatabase.TABLE_RECIPES)
            .select()
            .where("title", "LIKE", `%${search}%`)
            .orWhere("description", "LIKE", `%${search}%`)

        return result
    }

    public createRecipe = async (recipe: Recipe) => {
        const result: IRecipeDB = {
            id: recipe.getId(),
            title: recipe.getTitle(),
            description: recipe.getDescription(),
            created_at:recipe.getCreatedAt(),
            updated_at:recipe.getUpdatedAt(),
            creator_id:recipe.getCreatorId()
        }

        await BaseDatabase
            .connection(RecipeDatabase.TABLE_RECIPES)
            .insert(result)
    }

    public findById = async (id: string) => {
        const recipeDB: IRecipeDB[] = await BaseDatabase
            .connection(RecipeDatabase.TABLE_RECIPES)
            .select()
            .where({ id })

        return recipeDB[0]
    }

    public editRecipe = async (recipe: Recipe) => {
        const recipeDB: IRecipeDB = {
            id: recipe.getId(),
            title: recipe.getTitle(),
            description: recipe.getDescription(),
            created_at: recipe.getCreatedAt(),
            updated_at: recipe.getUpdatedAt(),
            creator_id: recipe.getCreatorId()
        }

        await BaseDatabase
            .connection(RecipeDatabase.TABLE_RECIPES)
            .update(recipeDB)
            .where({ id: recipeDB.id })
    }

    public deleteRecipeById = async (id: string) => {
        await BaseDatabase
            .connection(RecipeDatabase.TABLE_RECIPES)
            .delete()
            .where({ id })
    }

    public deleteRecipesFromUser = async (userId: string) => {
        const recipesDB: IRecipeDB[] = await BaseDatabase
            .connection(RecipeDatabase.TABLE_RECIPES)
            .select()
            .where({ creator_id: userId })
        
        for (let recipeDB of recipesDB) {
            await this.deleteRecipeById(recipeDB.id)
        }
    }
}