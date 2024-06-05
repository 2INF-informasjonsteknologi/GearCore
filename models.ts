// Packages

import mongoose, {
    Schema,
    Model
} from "mongoose";



// Interfaces

export interface IUser{
    id: string,
    name: string,
    email: string,
    password?: string,
    items: Array<string>,
    admin: boolean
}

export interface IItem{
    id: string,
    producer: string,
    description: string,
    specs: string,
    dateOfPurchase: Date,
    price: number,
    lifetime: number,
    category: string,
    borrowedBy: string
}



// Types

export type MUser = Model<IUser>;
export type MItem = Model<IItem>;



// Models

export const User: MUser = mongoose.model<IUser, MUser>(
    "users",
    new Schema<IUser, MUser>({
        id: String,
        name: String,
        email: String,
        password: String,
        items: [String],
        admin: Boolean
    })
);

export const Item: MItem = mongoose.model<IItem, MItem>(
    "items",
    new Schema<IItem, MItem>({
        id: String,
        producer: String,
        description: String,
        specs: String,
        dateOfPurchase: Date,
        price: Number,
        lifetime: Number,
        category: String,
        borrowedBy: String
    })
);