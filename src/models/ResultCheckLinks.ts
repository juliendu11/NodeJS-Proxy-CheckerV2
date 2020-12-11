import LinkType from "../enum/LinkType";

class ResultCheckLinks {

    Type: LinkType
    Result:Boolean
    Message:String
    Link:string

    constructor(type:LinkType, result:boolean, message:string, link:string){
        this.Type = type;
        this.Result = result;
        this.Message = message;
        this.Link = link;
    }
}

export default ResultCheckLinks;