import {checkRequestResponseIsGood, generateAxiosHandler} from '../../src/helpers/request';
import axios, { AxiosRequestConfig } from 'axios'

describe('Unit test for helpers/request', () => {
   test('Should return true because is 200 status code', () => {
       expect(checkRequestResponseIsGood(200)).toBe(true)
   })

   test('Should return true because is 204 status code', () => {
    expect(checkRequestResponseIsGood(204)).toBe(true)
    })

    test('Should return false because is 400 status code', () => {
        expect(checkRequestResponseIsGood(400)).toBe(false)
    })

    test('Should return false because is 500 status code', () => {
        expect(checkRequestResponseIsGood(500)).toBe(false)
    })

    test('Should return false because is 100 status code', () => {
        expect(checkRequestResponseIsGood(100)).toBe(false)
    })


    test('Should create axios instance with correct 5 timeout in option but not set agent and additionnalOption', () => {
        const mockedAxios = axios as jest.Mocked<typeof axios>;
        mockedAxios.create = jest.fn();
        generateAxiosHandler(mockedAxios, 5)

        expect(mockedAxios.create).toBeCalledWith({
            timeout: 5
        })
    })

    test('Should create axios instance with correct httpAgent in option but not set additionnalOption', () => {
        const mockedAxios = axios as jest.Mocked<typeof axios>;
        mockedAxios.create = jest.fn();
        const agent = {
            a:'t'
        }
        generateAxiosHandler(mockedAxios, 5, agent)

        expect(mockedAxios.create).toBeCalledWith({
            timeout: 5,
            httpAgent :agent
        })
    })

    test('Should create axios instance with correct additionnalOption in option', () => {
        const mockedAxios = axios as jest.Mocked<typeof axios>;
        mockedAxios.create = jest.fn();
        const additionnalOption: AxiosRequestConfig = {
            proxy: {
                host: 'test.com',
                port:80
            }
        }
        generateAxiosHandler(mockedAxios, 5, null, additionnalOption)

        expect(mockedAxios.create).toBeCalledWith({
            timeout: 5,
            ...additionnalOption
        })
    })
})