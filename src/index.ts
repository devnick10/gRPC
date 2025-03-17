import path from "path";

// GRPC is Protocol like http and we use grpc-js library for our node backend
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { ProtoGrpcType } from "./proto/message";
import { AddressBookServiceHandlers } from "./proto/AddressBookService";
import { Status } from "@grpc/grpc-js/build/src/constants";

// get the file as packagedefinition
const packageDefinition = protoLoader.loadSync(path.join(__dirname, '../src/message.proto'))

// provide packageDefinition to grpc.loadPackageDefinition
const personProto = grpc.loadPackageDefinition(packageDefinition) as unknown as ProtoGrpcType;

// for exmaple we store data in inmemory array. In realword use database.
const PERSONS = [
    {
        name: "nikhil",
        age: 22,
    },
    {
        name: "harry",
        age: 34
    }
]



const handler: AddressBookServiceHandlers = {
    // call like req in http and callback like res in http
    AddPerson(call, callback) {
        let person = {
            name: call.request.name,
            age: call.request.age
        }

        PERSONS.push(person);
        // callback first arg is Error and second is reponse object
        // grpc encode the data to protobuff under the hood not need to do any encode logic 
        callback(null, person)
    },
    GetPersonByName(call,callback){
        const name = call.request.name;
        const person = PERSONS.find(x => x.name = name)
        if (person) {
            callback(null, person)
        }else{
            callback({
                code:Status.NOT_FOUND,
                details:"not found"
            },null)
        }
    }
}

// create server is http in express we done const app = express()
const server = new grpc.Server();

// in proto service we have multiple services can we can register them one-by-one 
// express example 
// app.use('api/v1/user',userHandler);
// here in object we add single fuction but we also can add multiple functions

server.addService((personProto.AddressBookService).service, handler)

// start server
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    server.start();
})
