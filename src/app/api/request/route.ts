import { ResponseType } from "@/lib/types/apiResponse";
import { ServerResponseBuilder } from "@/lib/builders/serverResponseBuilder";
import { InputException } from "@/lib/errors/inputExceptions";
import { config as dotenvConfig } from "dotenv";
import {MongoClient} from 'mongodb'

dotenvConfig()
const uri = (process.env.MONGO_URI  as string);

const client = new MongoClient(uri);

export async function PUT(request: Request) {
    const databaseName = "crisis-corner";
    const collectionName = "requests";

    try {
        const body = await request.json();

        await client.connect();
        const db = client.db(databaseName);
        const collection = db.collection(collectionName);

        const doc = {
            requestorName: body.requestorName,
            itemRequested: body.itemRequested,
            createdDate: new Date(),
            lastEditedDate: new Date(),
            status: "pending"
        };

        const result = await collection.insertOne(doc);

        return new Response(JSON.stringify(result), {
            status: 201,
            headers: { "Content-Type": "application/json" },
        });
    } catch (e) {
        console.log(e);
        if (e instanceof InputException) {
            return new ServerResponseBuilder(ResponseType.INVALID_INPUT).build();
        }
        return new ServerResponseBuilder(ResponseType.UNKNOWN_ERROR).build();
    }
}
