import { apiPost } from "../../../shared/services/api";


export async function askPatientAssistant(data:{
    question:string;
    userId:number;
}){

    const response = await apiPost<any>(
        "/patient/assistant",
        data
    );

    return response;

}