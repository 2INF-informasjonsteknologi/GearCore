// Packages

import {
    Router as R,
    Request as Req,
    Response as Res,
    NextFunction as Next
} from "express";

import {
    User,
    IUser
} from "../../models.ts";

import {
    Document
} from "mongoose";

import mw from "../../middleware.ts";
import bcrypt from "bcrypt";



// Configuration

const app: R = R();



// Endpoints

app.post("/log-in", mw.requireBody("email", "password"), async (req: Req, res: Res): Promise<void | Res> => {
    const body: {email: string, password: string} = req.body;

    if(!(await User.exists({email: body.email.toLowerCase()}))){
        return res.status(404).send({
            code: 404,
            message: {
                en: "No user with this email exists!",
                no: "Det finnes ingen bruker med denne epost-adressen!"
            },
            key: "email"
        });
    }

    const user: Document<unknown, {}, IUser> & IUser = await User.findOne({email: body.email.toLowerCase()}) || new User();

    if(!(await bcrypt.compare(body.password, (user.password || "")))){
        return res.status(401).send({
            code: 401,
            message: {
                en: "Invalid credentials for this user!",
                no: "Ugyldig legitimasjon til denne brukeren!"
            },
            key: "password"
        });
    }

    req.session.user = mw.sanitize<IUser>(user.toJSON());

    res.status(200).send({
        code: 200,
        message: {
            en: "Login successful!",
            no: "Innlogging vellykket!"
        }
    });
});

app.post("/sign-up", mw.requireBody("name", "email", "password"), async (req: Req, res: Res): Promise<void | Res> => {
    const body: {name: string, email: string, password: string} = req.body;

    if(await User.exists({email: body.email.toLowerCase()})){
        return res.status(409).send({
            code: 409,
            message: {
                en: "This email is already in use!",
                no: "Denne epost-adressen er allerede i bruk!"
            },
            key: "email"
        });
    }

    if(!body.email.toLowerCase().endsWith("@innlandetfylke.no")){
        return res.status(401).send({
            code: 401,
            message: {
                en: "This email is not under the \"innlandetfylke.no\" domain!",
                no: "Epost-adressen er ikke under \"innlandetfylke.no\"-domenet!"
            },
            key: "email"
        });
    }

    const user: Document<unknown, {}, IUser> & IUser = new User({
        name: body.name,
        email: body.email,
        password: await bcrypt.hash(body.password, 13)
    });

    await user.save();

    req.session.user = mw.sanitize<IUser>(user.toJSON());

    res.status(200).send({
        code: 200,
        message: {
            en: "Logged in successfully!",
            no: "Innlogging vellykket!"
        }
    });
});



// Export

module.exports = app;