const proxySplit = (value:string):string[] => {
    var seperatorCount = (value.match(/[:]/gm) || []).length;
    return value.split(":");
}

export {proxySplit}