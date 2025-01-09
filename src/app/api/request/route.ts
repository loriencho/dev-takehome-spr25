import { ResponseType } from "@/lib/types/apiResponse";
import { ServerResponseBuilder } from "@/lib/builders/serverResponseBuilder";
import { InputException } from "@/lib/errors/inputExceptions";
import { config as dotenvConfig } from "dotenv";
import { MongoClient, ObjectId} from 'mongodb'
import { PAGINATION_PAGE_SIZE } from "@/lib/constants/config";

dotenvConfig()
const uri = (process.env.MONGO_URI as string);

const client = new MongoClient(uri);

export async function GET(request: Request) {
    const databaseName = "crisis-corner";
    const collectionName = "requests";
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const status = url.searchParams.get("status") || "";
    const page_size = PAGINATION_PAGE_SIZE;

    await client.connect();
    const db = client.db(databaseName);
    const collection = db.collection(collectionName);

    const criteria = (
        (['pending', 'completed', 'approved', 'rejected'].includes(status)) ?
            { "status": status }
            : {}
    );

    try {
        const result = await collection
            .find(criteria).skip((page - 1) * page_size)
            .limit(page_size).sort({ createdDate: -1 }).toArray();

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (e) {
        if (e instanceof InputException) {
            return new ServerResponseBuilder(ResponseType.INVALID_INPUT).build();
        }
        return new ServerResponseBuilder(ResponseType.UNKNOWN_ERROR).build();
    }
}

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
        if (e instanceof InputException) {
            return new ServerResponseBuilder(ResponseType.INVALID_INPUT).build();
        }
        return new ServerResponseBuilder(ResponseType.UNKNOWN_ERROR).build();
    }
}

export async function PATCH(request: Request) {
    const databaseName = "crisis-corner";
    const collectionName = "requests";
    try {
        const body = await request.json();

        await client.connect();
        const db = client.db(databaseName);
        const collection = db.collection(collectionName);

        const result = await collection.updateOne(
            { _id: ObjectId.createFromHexString(body.id)},
            {
                $set: {
                    status: body.status,
                    lastEditedDate: new Date()
                }
            },
            { upsert: false }
        );

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (e) {
        if (e instanceof InputException) {
            return new ServerResponseBuilder(ResponseType.INVALID_INPUT).build();
        }
        return new ServerResponseBuilder(ResponseType.UNKNOWN_ERROR).build();
    }
}