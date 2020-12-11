import { AxiosRequestConfig, AxiosStatic } from "axios";


const generateAxiosHandler = (axios: AxiosStatic, timeout:number, agent: any|null = null, additionnalOption: AxiosRequestConfig |null =null) => {
    let option: AxiosRequestConfig =  {
        timeout: timeout,
    }
    if (agent) option.httpAgent = agent;
    if (additionnalOption) option = {...option, ...additionnalOption};
    return axios.create(option)
}

const checkRequestResponseIsGood = (value: number): boolean => {
    return value >= 200 && value < 300
}

export {
    generateAxiosHandler,
    checkRequestResponseIsGood
}