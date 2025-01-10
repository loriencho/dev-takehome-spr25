import { ResponseType } from "@/lib/types/apiResponse";
import { ServerResponseBuilder } from "@/lib/builders/serverResponseBuilder";
import { InputException } from "@/lib/errors/inputExceptions";
import { config as dotenvConfig } from "dotenv";
import { MongoClient, ObjectId } from 'mongodb'
import { PAGINATION_PAGE_SIZE } from "@/lib/constants/config";

dotenvConfig()

const uri = (process.env.MONGO_URI as string);
const client = new MongoClient(uri);

export async function GET(request: Request) {
    /*
    '/api/request/':
    Query parameters: page, status

    A GET request that returns all the item requests in the database 
    in descending order of date created. 
    The data is paginated by PAGINATED_PAGE_SIZE.
    If page number is not specified, it defaults to one.
    Status can also be optionally provided to filter items.
    */

    const databaseName = "crisis-corner";
    const collectionName = "requests";
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const status = url.searchParams.get("status") || "";
    const page_size = PAGINATION_PAGE_SIZE;

    // Connect to database and access collection
    await client.connect();
    const db = client.db(databaseName);
    const collection = db.collection(collectionName);

    // Set item status filter
    const criteria = (
        (['pending', 'completed', 'approved', 'rejected'].includes(status)) ?
            { "status": status }
            : {}
    );

    try {
        // Query collection
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
    /*
    '/api/request/':
    A PUT request that adds a new item request to the database.

    The body should be in the following format:
        {
        requestorName: "Jane Doe",
        itemRequested: "Flashlights"
        }
    
    The creation date and last edited date 
    are set to the current date and 
    the status is set to `pending`.
    */

    const databaseName = "crisis-corner";
    const collectionName = "requests";

    try {
        const body = await request.json();

        // Connect to database and access collection
        await client.connect();
        const db = client.db(databaseName);
        const collection = db.collection(collectionName);

        // Create item according to schema
        const doc = {
            requestorName: body.requestorName,
            itemRequested: body.itemRequested,
            createdDate: new Date(),
            lastEditedDate: new Date(),
            status: "pending"
        };

        // Query database
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
    /*
    A PUT request that updates the status 
    of the item with the given id.

    The body should be in the following format:
        {
            id: ________,
            status: approved
        }

    The last edited date is set to the current date 
    and the status is set to the new value.
    */

    const databaseName = "crisis-corner";
    const collectionName = "requests";

    try {
        const body = await request.json();

        // Connect to database and access collection
        await client.connect();
        const db = client.db(databaseName);
        const collection = db.collection(collectionName);

        const objectId = ObjectId.createFromHexString(body.id);
        const updatedFields = {
            status: body.status,
            lastEditedDate: new Date()
        }

        // Query database
        const result = await collection.updateOne(
            { _id: objectId },
            {
                $set: updatedFields
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