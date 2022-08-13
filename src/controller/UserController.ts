import { Request, Response } from "express";
import { RecipeDatabase } from "../database/RecipeDatabase";
import { UserDatabase } from "../database/UserDatabase";
import { User, USER_ROLES } from "../models/User";
import { Authenticator, ITokenPayload } from "../services/Authenticator";
import { HashManager } from "../services/HashManager";
import { IdGenerator } from "../services/IdGenerator";

export class UserController {
    public signup = async (req: Request, res: Response) => {
        let errorCode = 400
        try {
            const nickname = req.body.nickname
            const email = req.body.email
            const password = req.body.password

            if (!nickname || !email || !password) {
                throw new Error("Parâmetros faltando")
            }

            if (typeof nickname !== "string") {
                throw new Error("Parâmetro 'nickname' deve ser uma string")
            }

            if (typeof email !== "string") {
                throw new Error("Parâmetro 'email' deve ser uma string")
            }

            if (typeof password !== "string") {
                throw new Error("Parâmetro 'password' deve ser uma string")
            }

            if (nickname.length < 3) {
                throw new Error("O parâmetro 'nickname' deve possuir ao menos 3 caracteres")
            }

            if (password.length < 6) {
                throw new Error("Password must have at least 6 characters")
            }

            if (!email.includes("@") || !email.includes(".com")) {
                throw new Error("Insert a valid e-mail")
            }

            const idGenerator = new IdGenerator()
            const id = idGenerator.generate()

            const hashManager = new HashManager()
            const hashPassword = await hashManager.hash(password)

            const user = new User(
                id,
                nickname,
                email,
                hashPassword,
                USER_ROLES.NORMAL
            )

            const userDatabase = new UserDatabase()

            const searchUser = await userDatabase.findByEmail(email)

            if (searchUser) {
                errorCode = 409
                throw new Error("This e-mail already have an account")
            }

            await userDatabase.createUser(user)


            const payload: ITokenPayload = {
                id: user.getId(),
                role: user.getRole()
            }

            const authenticator = new Authenticator()
            const token = authenticator.generateToken(payload)

            res.status(201).send({
                message: "User created successfully",
                token
            })
        } catch (error) {
            res.status(errorCode).send({ message: error.message })
        }
    }

    public login = async (req: Request, res: Response) => {
        let errorCode = 400
        try {
            const email = req.body.email
            const password = req.body.password

            if (!email || !password) {
                errorCode = 401
                throw new Error("Missing params: email and/or password")
            }

            if (typeof email !== "string") {
                throw new Error("Email must be string type")
            }

            if (typeof password !== "string") {
                throw new Error("Password must be string type")
            }

            if (password.length < 6) {
                throw new Error("Password must have at least 6 characters")
            }

            if (!email.includes("@") || !email.includes(".com")) {
                throw new Error("Insert a valid e-mail")
            }

            const userDatabase = new UserDatabase()
            const userDB = await userDatabase.findByEmail(email)

            if (!userDB) {
                errorCode = 401
                throw new Error("E-mail doesn't have an account")
            }

            const user = new User(
                userDB.id,
                userDB.nickname,
                userDB.email,
                userDB.password,
                userDB.role
            )

            const hashManager = new HashManager()
            const isPasswordCorrect = await hashManager.compare(
                password,
                user.getPassword()
            )

            if (!isPasswordCorrect) {
                errorCode = 401
                throw new Error("Invalid password")
            }

            const payload: ITokenPayload = {
                id: user.getId(),
                role: user.getRole()
            }

            const authenticator = new Authenticator()
            const token = authenticator.generateToken(payload)

            res.status(200).send({
                message: "You're logged!",
                token
            })
        } catch (error) {
            res.status(errorCode).send({ message: error.message })
        }
    }

    public getUsers = async (req: Request, res: Response) => {
        let errorCode = 400
        try {
            const token = req.headers.authorization
            const search = req.query.search as string

            const authenticator = new Authenticator()
            const payload = authenticator.getTokenPayload(token)

            if (!payload) {
                errorCode = 401
                throw new Error("Missing or invalid token")
            }

            const userDatabase = new UserDatabase()
            
            if(search){
            const usersDB = await userDatabase.searchUsers(search)

            if (typeof search !== "string") {
                throw new Error("Parâmetro 'search' deve ser uma string")
            }

            const users = usersDB.map((userDB) => {
                return new User(
                    userDB.id,
                    userDB.nickname,
                    userDB.email,
                    userDB.password,
                    userDB.role
                )
            })

            const result = users.map((user) => {
                return {
                    id: user.getId(),
                    nickname: user.getNickname(),
                    email: user.getEmail()
                }
            })

            res.status(200).send({ users: result })
        } else{

        const usersDB = await userDatabase.getAllUsers()

        const users = usersDB.map((userDB) => {
            return new User(
                userDB.id,
                userDB.nickname,
                userDB.email,
                userDB.password,
                userDB.role
            )
        })

        const result = users.map((user) => {
            return {
                id: user.getId(),
                nickname: user.getNickname(),
                email: user.getEmail()
            }
        })

        res.status(200).send({ users: result })
    }

        } catch (error) {
            res.status(errorCode).send({ message: error.message })
        }
    }

    public deleteUser = async(req: Request, res: Response) => {
        let errorCode = 400
        try {
            const token = req.headers.authorization
            const id = req.params.id
            const authenticator = new Authenticator()
            const payload = authenticator.getTokenPayload(token)

            if(!payload){
                errorCode = 401
                throw new Error("Missing or invalid token");                
            }

            if(payload.role !== USER_ROLES.ADMIN){
                errorCode = 403
                throw new Error("Forbidden access for normal users");
            }

            const userDatabase = new UserDatabase()
            const searchUser = await userDatabase.findById(id)

            if(!searchUser[0]){
                errorCode = 404
                throw new Error("User not found");
            }
            
            if(id === payload.id){
                throw new Error("You can't delete your own account");
            }

            const userToDelete = new User(
                searchUser[0].id,
                searchUser[0].nickname,
                searchUser[0].email,
                searchUser[0].password,
                searchUser[0].role
            )

            const recipeDatabase = new RecipeDatabase()
            await recipeDatabase.deleteRecipesFromUser(userToDelete.getId())
            await userDatabase.deleteUser(id)


            res.status(200).send({
                message: "User deleted successfully"
            })

        } catch (error) {
            res.status(errorCode).send({
                message: error.message
            })
        }
    }
}