interface ProxySplitResult {

    values: string[]
    hasAuth: boolean,
    goodFormat: boolean
}

const proxySplit = (value: string): ProxySplitResult => {
    var seperatorCount = (value.match(/[:]/gm) || []).length;
    var goodFormat = false;
    var splitted: string[] = [];

    if (seperatorCount === 3) {
        let error =false;
        //WIth id
        splitted = value.split(":");

        splitted.forEach(value => {
            error = value === ""
        });
        
        goodFormat = !error;
    } else if (seperatorCount === 1) {
        //Normal
        splitted = value.split(":");
        goodFormat = splitted[0] !== "" && splitted[1] != "";
    }

    return {
        values: splitted,
        hasAuth: seperatorCount === 3,
        goodFormat: goodFormat
    };
}

export { proxySplit }