import { apiPost } from "../../../shared/services/api";


export async function askPatientAssistant(
    message:string,
    userId:number
){

    return apiPost(
        "/patient/assistant",
        {
            message,
            userId
        }
    );

}