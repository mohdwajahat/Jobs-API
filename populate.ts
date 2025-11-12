import { readFileSync } from "fs";
import connectDB from "../Jobs-API/src/db/connect";
import path from "path";
import Job from "../Jobs-API/src/models/Jobs"
import "dotenv/config"



const absolutePath =  path.resolve(__dirname,"./MOCK_DATA.json");

const start = async() => {
    try {
        const fileData = JSON.parse(readFileSync(absolutePath,"utf8"));
        await connectDB(process.env.MONGO_URL!);
        await Job.deleteMany();
        await Job.create(fileData);
        console.log("success")
        process.exit(0);
    } catch (error) {
        console.log(error);
        console.log("not working");
        process.exit(1);
    }


}

start();