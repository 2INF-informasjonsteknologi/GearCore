// Packages

import mongoose, {
    Schema,
    Model
} from "mongoose";



// Interfaces

export interface IUser{
    name: string,
    email: string,
    password?: string
}

export interface IItem{
    producer: string,
    description: string,
    specs: string,
    dateOfPurchase: Date,
    price: number,
    lifetime: number,
    category: string
}



// Types

export type MUser = Model<IUser>;
export type MItem = Model<IItem>;



// Models

export const User: MUser = mongoose.model<IUser, MUser>(
    "users",
    new Schema<IUser, MUser>({
        name: String,
        email: String,
        password: String
    })
);

export const Item: MItem = mongoose.model<IItem, MItem>(
    "items",
    new Schema<IItem, MItem>({
        producer: String,
        description: String,
        specs: String,
        dateOfPurchase: Date,
        price: Number,
        lifetime: Number,
        category: String
    })
);