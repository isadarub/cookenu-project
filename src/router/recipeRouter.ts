import { Router } from 'express'
import { RecipeController } from '../controller/RecipeController'

export const recipeRouter = Router()

const recipeController = new RecipeController()

// FAZER ORDENAÇÃO E PAGINAÇÃO
recipeRouter.get("/", recipeController.getRecipes)
// VALIDAÇÕES DE TIPO e NÚMERO DE CARACTERES
recipeRouter.post('/create', recipeController.createRecipe)

recipeRouter.put('/:id', recipeController.editRecipe)
recipeRouter.delete('/:id', recipeController.deleteRecipe)