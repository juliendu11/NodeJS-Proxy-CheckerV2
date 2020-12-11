import ProxyAnonymousLevel from '../src/enum/ProxyAnonymousLevel';
import ProxySpeedLevel from '../src/enum/ProxySpeedLevel';
import ProxyStatus from '../src/enum/ProxyStatus';
import ProxyChecker from '../src/index';
import Result from '../src/models/Result';
import ResultCheckLinks from '../src/models/ResultCheckLinks';
import LinkType from '../src/enum/LinkType';
import {generateAxiosHandler} from '../src/helpers/request'
import axios from 'axios'
const fakeProxies = [
    '144.91.98.115:5836',
    '144.91.98.116:5836',
    '144.91.98.117:5836'
]

describe('Unit test for index.ts', () => {
    jest.mock('axios')

    afterEach(jest.resetAllMocks)
    
    test('Should correct load proxies with file when call addProxiesFromFile', () => {
        const fakeProxiesFile = __dirname + '/ressources/proxies.txt'
        const instance = new ProxyChecker();
        instance.addProxiesFromFile(fakeProxiesFile)

        expect(instance.proxiesList.length).toBe(13);
    })

    test('Should correct load proxies with array when call addProxiesFromArray', () => {
        const instance = new ProxyChecker();
        instance.addProxiesFromArray(fakeProxies)

        expect(instance.proxiesList.length).toBe(fakeProxies.length);
    })

    test('Should correct load proxies when call addOnly1Proxy', () => {
        const instance = new ProxyChecker();
        instance.addOnly1Proxy(fakeProxies[0])

        expect(instance.proxiesList.length).toBe(1);
    })

    test('Should have 1 proxy judge in the list because we dont use addDefaultProxyJudge but we add one with addProxyJudge', () => {
        const instance = new ProxyChecker();
        instance.addProxyJudge(["https://test.com/"])

        expect(instance.proxyJudgesList.length).toBe(1);
    })

    test('Should have 2 proxy judge in the list because we dont use addDefaultProxyJudge but we add two with addProxyJudge', () => {
        const instance = new ProxyChecker();
        instance.addProxyJudge(["https://test.com/", "https://test2.com/"])

        expect(instance.proxyJudgesList.length).toBe(2);
    })

    test('Should have ... proxy judge in the list because we use addDefaultProxyJudge and we add two with addProxyJudge', () => {
        const instance = new ProxyChecker();
        instance.addDefaultProxyJudge();
        instance.addProxyJudge(["https://test.com/", "https://test2.com/"])

        const lenghtExpected = instance.defaultProxyJudge.length + 2;

        expect(instance.proxyJudgesList.length).toBe(lenghtExpected);
    })


    test('Should have 1 proxy information provider in the list because we dont use addDefaultProxyInformationProvider but we add one with addProxyInformationProvider', () => {
        const instance = new ProxyChecker();
        instance.addProxyInformationProvider(["https://test.com/"])

        expect(instance.proxyInformationProvider.length).toBe(1);
    })

    test('Should have 2 proxy information provider in the list because we dont use addDefaultProxyInformationProvider but we add two with addProxyInformationProvider', () => {
        const instance = new ProxyChecker();
        instance.addProxyInformationProvider(["https://test.com/", "https://test2.com/"])

        expect(instance.proxyInformationProvider.length).toBe(2);
    })

    test('Should have ... proxy information provider in the list because we use addDefaultProxyInformationProvider and we add two with addProxyInformationProvider', () => {
        const instance = new ProxyChecker();
        instance.addDefaultProxyInformationProvider();
        instance.addProxyInformationProvider(["https://test.com/", "https://test2.com/"])

        const lenghtExpected = instance.defaultProxyInformationProvider.length + 2;

        expect(instance.proxyInformationProvider.length).toBe(lenghtExpected);
    })


    test('Should return exception when call check because no proxy loaded but the rest is OK', async done => {
        const instance = new ProxyChecker();
        // instance.addProxiesFromArray(fakeProxies)
        instance.addDefaultProxyInformationProvider();
        instance.addDefaultProxyJudge();

        await expect(instance.check(null)).rejects.toThrow("No proxies added")
        done()
    })

    test('Should return correct information with respect to proxy information when calling check with 3 proxy return 3 result', async done => {
        const instance = new ProxyChecker();
        instance.addProxiesFromArray(fakeProxies)

        const mockCheck = jest.fn();
        instance.proxiesList.forEach(v => v.checkProxy = mockCheck)

        instance.proxiesList[0].status = ProxyStatus.Alive;
        instance.proxiesList[1].status = ProxyStatus.Dead;
        instance.proxiesList[2].status = ProxyStatus.Dead;

        instance.proxiesList[0].anonymousLevel = ProxyAnonymousLevel.Hight
        instance.proxiesList[1].anonymousLevel = ProxyAnonymousLevel.Low
        instance.proxiesList[2].anonymousLevel = ProxyAnonymousLevel.Medium

        instance.proxiesList[0].speedLevel = ProxySpeedLevel.Fast
        instance.proxiesList[1].speedLevel = ProxySpeedLevel.Medium
        instance.proxiesList[2].speedLevel = ProxySpeedLevel.Slow

        instance.proxiesList[0].country = "France"
        instance.proxiesList[1].country = "Italie"
        instance.proxiesList[2].country = "Espagne"

        var result = await instance.check(null);
        expect(result.length).toBe(fakeProxies.length)


        expect(result[0].Proxy).toBe(instance.proxiesList[0].proxy)
        expect(result[0].Country).toBe(instance.proxiesList[0].country)
        expect(result[0].ProxyAnonymousLevel).toBe(instance.proxiesList[0].anonymousLevel)
        expect(result[0].ProxyInformationProviderSelected).toBe(instance.proxiesList[0].proxyInformationProviderSelected)
        expect(result[0].ProxyJudgeSelected).toBe(instance.proxiesList[0].proxyJudgeSelected)
        expect(result[0].ProxySpeedLevel).toBe(instance.proxiesList[0].speedLevel)
        expect(result[0].ProxyStatus).toBe(instance.proxiesList[0].status)
        expect(result[0].ProxyVersion).toBe(instance.proxiesList[0].version)
        expect(result[0].TimeTaken).toBe(instance.proxiesList[0].timeTaken)

        expect(result[1].Proxy).toBe(instance.proxiesList[1].proxy)
        expect(result[1].Country).toBe(instance.proxiesList[1].country)
        expect(result[1].ProxyAnonymousLevel).toBe(instance.proxiesList[1].anonymousLevel)
        expect(result[1].ProxyInformationProviderSelected).toBe(instance.proxiesList[1].proxyInformationProviderSelected)
        expect(result[1].ProxyJudgeSelected).toBe(instance.proxiesList[1].proxyJudgeSelected)
        expect(result[1].ProxySpeedLevel).toBe(instance.proxiesList[1].speedLevel)
        expect(result[1].ProxyStatus).toBe(instance.proxiesList[1].status)
        expect(result[1].ProxyVersion).toBe(instance.proxiesList[1].version)
        expect(result[1].TimeTaken).toBe(instance.proxiesList[1].timeTaken)

        expect(result[2].Proxy).toBe(instance.proxiesList[2].proxy)
        expect(result[2].Country).toBe(instance.proxiesList[2].country)
        expect(result[2].ProxyAnonymousLevel).toBe(instance.proxiesList[2].anonymousLevel)
        expect(result[2].ProxyInformationProviderSelected).toBe(instance.proxiesList[2].proxyInformationProviderSelected)
        expect(result[2].ProxyJudgeSelected).toBe(instance.proxiesList[2].proxyJudgeSelected)
        expect(result[2].ProxySpeedLevel).toBe(instance.proxiesList[2].speedLevel)
        expect(result[2].ProxyStatus).toBe(instance.proxiesList[2].status)
        expect(result[2].ProxyVersion).toBe(instance.proxiesList[2].version)
        expect(result[2].TimeTaken).toBe(instance.proxiesList[2].timeTaken)


        done();
    })

    test('Should use callback 3 times and return Result type when call check because callback is available and have 3 proxy', async done => {
        const instance = new ProxyChecker();
        instance.addProxiesFromArray(fakeProxies)

        let called = 0
        let returnedCallback: any = []

        const mockCheck = jest.fn();
        instance.proxiesList.forEach(v => v.checkProxy = mockCheck)

        await instance.check((result: any) => {
            called++;
            returnedCallback.push(result)
        })

        expect(called).toBe(3);
        expect(returnedCallback[0]).toBeInstanceOf(Result);
        expect(returnedCallback[1]).toBeInstanceOf(Result);
        expect(returnedCallback[2]).toBeInstanceOf(Result);

        done();
    })

    test('Should set timeout 3000 when call setRequestTimeout with 3000', () => {
        const instance = new ProxyChecker();
        instance.setRequestTimeout(3000);

        expect(instance.timeout).toBe(3000);
    })

    test('Should return corresponding result when call checkProxyJudgeLinks', async done => {
        axios.create = jest.fn().mockReturnValue({
            get: jest.fn()
                .mockResolvedValueOnce({ 
                    status: 200,
                    data: 'test'
                })
                .mockResolvedValueOnce({ 
                    status: 500,
                    data: 'test'
                })
                .mockResolvedValueOnce({
                    status: 200,
                    data: ''
                })
        })
        const instance = new ProxyChecker();
        instance.addProxyJudge(['http://test1.com', 'http://test2.com', 'http://test3.com'])


        const result = await instance.checkProxyJudgeLinks(null);

        expect(result).toHaveLength(3);

        expect(result[0]).toEqual(
            new ResultCheckLinks(LinkType.ProxyJudge, true, "", 'http://test1.com')
        )
        expect(result[1]).toEqual(
            new ResultCheckLinks(LinkType.ProxyJudge, false, `Response code is 500`, 'http://test2.com')
        )
        expect(result[2]).toEqual(
            new ResultCheckLinks(LinkType.ProxyJudge, false, "No data received in response", 'http://test3.com')
        )
        done();
    })

    test('Should return corresponding result when call checkProxyInformationProviderLinks', async done => {
        axios.create = jest.fn().mockReturnValue({
            get: jest.fn()
                .mockResolvedValueOnce({ 
                    status: 200,
                    data: 'test'
                })
                .mockResolvedValueOnce({ 
                    status: 500,
                    data: 'test'
                })
                .mockResolvedValueOnce({
                    status: 200,
                    data: ''
                })
        })

        const instance = new ProxyChecker();
        instance.addProxyInformationProvider(['http://test1.com', 'http://test2.com', 'http://test3.com'])


        const result = await instance.checkProxyInformationProviderLinks(null);

        expect(result).toHaveLength(3);

        expect(result[0]).toEqual(
            new ResultCheckLinks(LinkType.ProxyInformationProvider, true, "", 'http://test1.com')
        )
        expect(result[1]).toEqual(
            new ResultCheckLinks(LinkType.ProxyInformationProvider, false, `Response code is 500`, 'http://test2.com')
        )
        expect(result[2]).toEqual(
            new ResultCheckLinks(LinkType.ProxyInformationProvider, false, "No data received in response", 'http://test3.com')
        )
        done();
    })
})