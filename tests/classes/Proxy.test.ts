import Proxy from '../../src/classes/Proxy'
import axios from 'axios'
import ProxyStatus from '../../src/enum/ProxyStatus';
import fs from 'fs'
import ProxyAnonymousLevel from '../../src/enum/ProxyAnonymousLevel';
import createSocksProxyAgent, { SocksProxyAgent } from 'socks-proxy-agent';
import ProxyVersion from '../../src/enum/ProxyVersion';

const proxy = "198.45.2.6.90:80";
const proxyJudge = "https://test.com";
const proxyInformationProvider = "https://test.com";
const myIp = "192.14.50.120";

const testsFolder = require('path').resolve(__dirname, '..')
const fakeProxyJudgeDataFile = testsFolder + '/ressources/fakeProxyJudgeData.txt';
const fakeProxyJudgeData = fs.readFileSync(fakeProxyJudgeDataFile, 'utf8')

describe('Unit test for classes/Proxy', () => {
    jest.mock('axios');

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('Should set proxy, address and port when construct', () => {
        const instance = new Proxy(proxy, axios);

        expect(instance.address).toBe("198.45.2.6.90")
        expect(instance.port).toBe("80")
        expect(instance.proxy).toBe(proxy)
    })

    test('Should set timeTaken when call checkProxy', async done => {
        const promise1 = new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve({
                    status: 200,
                    data: fakeProxyJudgeData
                });
            }, 300);
        });
        const mockedAxios = axios as jest.Mocked<typeof axios>;
        mockedAxios.create = jest.fn().mockReturnValue({
            get: jest.fn().mockReturnValue(promise1)
        })

        const instance = new Proxy(proxy, mockedAxios);
        await instance.checkProxy(proxyJudge, proxyInformationProvider, myIp);

        expect(instance.timeTaken).not.toBe(0)
        expect(instance.timeTaken >= 300).toBe(true)
        done()
    })

    test('Should set status = Dead because returned status is not 200 when call checkProxy', async done => {
        const mockedAxios = axios as jest.Mocked<typeof axios>;
        mockedAxios.create = jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
                status: 500,
                data: fakeProxyJudgeData
            })
        })

        const instance = new Proxy(proxy, mockedAxios);
        await instance.checkProxy(proxyJudge, proxyInformationProvider, myIp);

        expect(instance.status).toBe(ProxyStatus.Dead)
        done()
    })

    test('Should set status = Alive because returned status is 200 when call checkProxy', async done => {
        const mockedAxios = axios as jest.Mocked<typeof axios>;
        mockedAxios.create = jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
                status: 200,
                data: fakeProxyJudgeData
            })
        })

        const instance = new Proxy(proxy, mockedAxios);
        await instance.checkProxy(proxyJudge, proxyInformationProvider, myIp);

        expect(instance.status).toBe(ProxyStatus.Alive)
        done()
    })

    test('Should set anonymousLevel Medium because Proxy address found when call checkProxy', async done => {
        const mockedAxios = axios as jest.Mocked<typeof axios>;
        mockedAxios.create = jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
                status: 200,
                data: replaceAll(fakeProxyJudgeData, '50.90.176.75', proxy.split(':')[0])
            })
        })

        const instance = new Proxy(proxy, mockedAxios);
        await instance.checkProxy(proxyJudge, proxyInformationProvider, myIp);

        expect(instance.status).toBe(ProxyStatus.Alive)
        expect(instance.anonymousLevel).toBe(ProxyAnonymousLevel.Medium)
        done()
    })

    test('Should set anonymousLevel Low because MyIP address found when call checkProxy', async done => {
        const mockedAxios = axios as jest.Mocked<typeof axios>;
        mockedAxios.create = jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
                status: 200,
                data: replaceAll(fakeProxyJudgeData, '50.90.176.75', myIp)
            })
        })
        const instance = new Proxy(proxy, mockedAxios);
        await instance.checkProxy(proxyJudge, proxyInformationProvider, myIp);

        expect(instance.status).toBe(ProxyStatus.Alive)
        expect(instance.anonymousLevel).toBe(ProxyAnonymousLevel.Low)
        done()
    })

    test('Should set anonymousLevel Hight because no address found when call checkProxy', async done => {
        const mockedAxios = axios as jest.Mocked<typeof axios>;
        mockedAxios.create = jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
                status: 200,
                data: replaceAll(fakeProxyJudgeData, '50.90.176.75', '')
            })
        })

        const instance = new Proxy(proxy, mockedAxios);
        await instance.checkProxy(proxyJudge, proxyInformationProvider, myIp);

        expect(instance.status).toBe(ProxyStatus.Alive)
        expect(instance.anonymousLevel).toBe(ProxyAnonymousLevel.Hight)
        done()
    })

    test('Should set country because "country" available in string response when call checkProxy', async done => {
        const dataInformationProvider = {
            country: 'FRANCE'
        }

        const data = {
            testHttp: {
                status: 200,
                data: ''
            },
            getProxyJudgeData: {
                status: 200,
                data: replaceAll(fakeProxyJudgeData, '50.90.176.75', '')
            },
            getProxyInformationProviderData: {
                status: 200,
                data: JSON.stringify(dataInformationProvider)
            }
        }

        const mockedAxios = axios as jest.Mocked<typeof axios>;
        mockedAxios.create = jest.fn().mockReturnValue({
            get: jest.fn()
                .mockResolvedValueOnce(data.testHttp)
                .mockResolvedValueOnce(data.getProxyJudgeData)
                .mockResolvedValueOnce(data.getProxyInformationProviderData)
        })

        const instance = new Proxy(proxy, mockedAxios);
        await instance.checkProxy(proxyJudge, proxyInformationProvider, myIp);

        expect(instance.status).toBe(ProxyStatus.Alive)
        expect(instance.country).toBe(dataInformationProvider.country)
        done()
    })

    test('Should set country because "country" available in Object response when call checkProxy', async done => {
        const dataInformationProvider = {
            country: 'FRANCE'
        }

        const data = {
            testHttp: {
                status: 200,
                data: ''
            },
            getProxyJudgeData: {
                status: 200,
                data: replaceAll(fakeProxyJudgeData, '50.90.176.75', '')
            },
            getProxyInformationProviderData: {
                status: 200,
                data: dataInformationProvider
            }
        }

        const mockedAxios = axios as jest.Mocked<typeof axios>;
        mockedAxios.create = jest.fn().mockReturnValue({
            get: jest.fn()
                .mockResolvedValueOnce(data.testHttp)
                .mockResolvedValueOnce(data.getProxyJudgeData)
                .mockResolvedValueOnce(data.getProxyInformationProviderData)
        })

        const instance = new Proxy(proxy, mockedAxios);
        await instance.checkProxy(proxyJudge, proxyInformationProvider, myIp);

        expect(instance.country).toBe(dataInformationProvider.country)
        done()
    })

    test('Should set country because "country_name" available in string response when call checkProxy', async done => {
        const dataInformationProvider = {
            country_name: 'FRANCE'
        }

        const data = {
            testHttp: {
                status: 200,
                data: ''
            },
            getProxyJudgeData: {
                status: 200,
                data: replaceAll(fakeProxyJudgeData, '50.90.176.75', '')
            },
            getProxyInformationProviderData: {
                status: 200,
                data: JSON.stringify(dataInformationProvider)
            }
        }

        const mockedAxios = axios as jest.Mocked<typeof axios>;
        mockedAxios.create = jest.fn().mockReturnValue({
            get: jest.fn()
                .mockResolvedValueOnce(data.testHttp)
                .mockResolvedValueOnce(data.getProxyJudgeData)
                .mockResolvedValueOnce(data.getProxyInformationProviderData)
        })
        const instance = new Proxy(proxy, mockedAxios);
        await instance.checkProxy(proxyJudge, proxyInformationProvider, myIp);

        expect(instance.country).toBe(dataInformationProvider.country_name)
        done()
    })

    test('Should set country because "country_name" available in Object response when call checkProxy', async done => {
        const dataInformationProvider = {
            country_name: 'FRANCE'
        }

        const data = {
            testHttp: {
                status: 200,
                data: ''
            },
            getProxyJudgeData: {
                status: 200,
                data: replaceAll(fakeProxyJudgeData, '50.90.176.75', '')
            },
            getProxyInformationProviderData: {
                status: 200,
                data: dataInformationProvider
            }
        }

        const mockedAxios = axios as jest.Mocked<typeof axios>;
        mockedAxios.create = jest.fn().mockReturnValue({
            get: jest.fn()
                .mockResolvedValueOnce(data.testHttp)
                .mockResolvedValueOnce(data.getProxyJudgeData)
                .mockResolvedValueOnce(data.getProxyInformationProviderData)
        })

        const instance = new Proxy(proxy, mockedAxios);
        await instance.checkProxy(proxyJudge, proxyInformationProvider, myIp);

        expect(instance.country).toBe(dataInformationProvider.country_name)
        done()
    })

    test('Should set timeout option 5000 in axios get', async done => {
        const dataInformationProvider = {
            country_name: 'FRANCE'
        }

        const data = {
            testHttp: {
                status: 200,
                data: ''
            },
            getProxyJudgeData: {
                status: 200,
                data: replaceAll(fakeProxyJudgeData, '50.90.176.75', '')
            },
            getProxyInformationProviderData: {
                status: 200,
                data: dataInformationProvider
            }
        }

        const mockedAxios = axios as jest.Mocked<typeof axios>;
        mockedAxios.create = jest.fn().mockReturnValue({
            get: jest.fn()
                .mockResolvedValueOnce(data.testHttp)
                .mockResolvedValueOnce(data.getProxyJudgeData)
                .mockResolvedValueOnce(data.getProxyInformationProviderData)
        })

        const instance = new Proxy(proxy, mockedAxios);
        await instance.checkProxy(proxyJudge, proxyInformationProvider, myIp, 5000);

        expect(mockedAxios.create).toBeCalledWith({
            timeout: 5000,
            proxy: {
                host: proxy.split(':')[0],
                port: parseInt(proxy.split(':')[1]),
            },
        })
        done()
    })

    test('Should set timeout option 8000 in axios get', async done => {
        const dataInformationProvider = {
            country_name: 'FRANCE'
        }

        const data = {
            testHttp: {
                status: 200,
                data: ''
            },
            getProxyJudgeData: {
                status: 200,
                data: replaceAll(fakeProxyJudgeData, '50.90.176.75', '')
            },
            getProxyInformationProviderData: {
                status: 200,
                data: dataInformationProvider
            }
        }

        const mockedAxios = axios as jest.Mocked<typeof axios>;
        mockedAxios.create = jest.fn().mockReturnValue({
            get: jest.fn()
                .mockResolvedValueOnce(data.testHttp)
                .mockResolvedValueOnce(data.getProxyJudgeData)
                .mockResolvedValueOnce(data.getProxyInformationProviderData)
        })

        const instance = new Proxy(proxy, mockedAxios);
        await instance.checkProxy(proxyJudge, proxyInformationProvider, myIp, 8000);

        expect(mockedAxios.create).toBeCalledWith({
            timeout: 8000,
            proxy: {
                host: proxy.split(':')[0],
                port: parseInt(proxy.split(':')[1]),
            },
        })
        done()
    })

    test('Should set proxy.auth when username and password are available in axios get', async done => {
        const dataInformationProvider = {
            country_name: 'FRANCE'
        }

        const data = {
            testHttp: {
                status: 200,
                data: ''
            },
            getProxyJudgeData: {
                status: 200,
                data: replaceAll(fakeProxyJudgeData, '50.90.176.75', '')
            },
            getProxyInformationProviderData: {
                status: 200,
                data: dataInformationProvider
            }
        }

        const mockedAxios = axios as jest.Mocked<typeof axios>;
        mockedAxios.create = jest.fn().mockReturnValue({
            get: jest.fn()
                .mockResolvedValueOnce(data.testHttp)
                .mockResolvedValueOnce(data.getProxyJudgeData)
                .mockResolvedValueOnce(data.getProxyInformationProviderData)
        })

        const newProxy = "58.145.587.20:50:test11:123"

        const instance = new Proxy(newProxy, mockedAxios);
        await instance.checkProxy(proxyJudge, proxyInformationProvider, myIp, 8000);

        expect(mockedAxios.create).toBeCalledWith({
            timeout: 8000,
            proxy: {
                host: newProxy.split(':')[0],
                port: parseInt(newProxy.split(':')[1]),
                auth: {
                    username: newProxy.split(':')[2],
                    password: newProxy.split(':')[3]
                }
            },
        })
        done()
    })


    test('Should not set proxy.auth when username and password not available in axios get', async done => {
        const dataInformationProvider = {
            country_name: 'FRANCE'
        }

        const data = {
            testHttp: {
                status: 200,
                data: ''
            },
            getProxyJudgeData: {
                status: 200,
                data: replaceAll(fakeProxyJudgeData, '50.90.176.75', '')
            },
            getProxyInformationProviderData: {
                status: 200,
                data: dataInformationProvider
            }
        }

        const mockedAxios = axios as jest.Mocked<typeof axios>;
        mockedAxios.create = jest.fn().mockReturnValue({
            get: jest.fn()
                .mockResolvedValueOnce(data.testHttp)
                .mockResolvedValueOnce(data.getProxyJudgeData)
                .mockResolvedValueOnce(data.getProxyInformationProviderData)
        })

        const newProxy = "58.145.587.20:50"

        const instance = new Proxy(newProxy, mockedAxios);
        await instance.checkProxy(proxyJudge, proxyInformationProvider, myIp, 8000);

        expect(mockedAxios.create).toBeCalledWith({
            timeout: 8000,
            proxy: {
                host: newProxy.split(':')[0],
                port: parseInt(newProxy.split(':')[1]),
            },
        })
        done()
    })

    test('Should use HTTP proxy for the first test then SOCKS proxy because HTTP proxy FAILED, SOCKS WORK set version = ProxyVersion.SOCKS', async done => {
        const dataInformationProvider = {
            country_name: 'FRANCE'
        }
        const mockedAxios = axios as jest.Mocked<typeof axios>;
        mockedAxios.create = jest.fn().mockReturnValue({
            get: jest.fn()
                .mockResolvedValueOnce({ // -> Test HTTP
                    status: 500,
                    data: ''
                })
                .mockResolvedValueOnce({ // -> Test socks
                    status: 200,
                    data: ''
                })
                .mockResolvedValueOnce({ // -> Get proxy judge data
                    status: 200,
                    data: replaceAll(fakeProxyJudgeData, '50.90.176.75', '')
                })
                .mockResolvedValueOnce({ // -> Get proxy information provider data
                    status: 200,
                    data: dataInformationProvider
                })
        })

        const newProxy = "58.145.587.20:50"

        const instance = new Proxy(newProxy, mockedAxios);
        await instance.checkProxy(proxyJudge, proxyInformationProvider, myIp, 8000);


        const socksAgentOption: createSocksProxyAgent.SocksProxyAgentOptions = {
            host: `socks://58.145.587.20:50`,
            timeout: 8000,
        };
        const socksAgent = new SocksProxyAgent(socksAgentOption);

        expect(mockedAxios.create.mock.calls[0][0]).toEqual(
            {
                timeout: 8000,
                proxy: {
                    host: newProxy.split(':')[0],
                    port: parseInt(newProxy.split(':')[1]),
                },
            },
        )
        expect(mockedAxios.create.mock.calls[1][0]).toEqual(
            {
                timeout: 8000,
                httpAgent: socksAgent
            }
        )
        expect(instance.version).toBe(ProxyVersion.SOCKS)
        done()
    })

    test('Should use HTTP proxy for the first test, WORK and set version = ProxyVersion.HTTP', async done => {
        const dataInformationProvider = {
            country_name: 'FRANCE'
        }
        const mockedAxios = axios as jest.Mocked<typeof axios>;
        mockedAxios.create = jest.fn().mockReturnValue({
            get: jest.fn()
                .mockResolvedValueOnce({ // -> Test HTTP
                    status: 200,
                    data: ''
                })
                .mockResolvedValueOnce({ // -> Get proxy judge data
                    status: 200,
                    data: replaceAll(fakeProxyJudgeData, '50.90.176.75', '')
                })
                .mockResolvedValueOnce({ // -> Get proxy information provider data
                    status: 200,
                    data: dataInformationProvider
                })
        })

        const newProxy = "58.145.587.20:50"

        const instance = new Proxy(newProxy, mockedAxios);
        await instance.checkProxy(proxyJudge, proxyInformationProvider, myIp, 8000);

        expect(mockedAxios.create.mock.calls[0][0]).toEqual(
            {
                timeout: 8000,
                proxy: {
                    host: newProxy.split(':')[0],
                    port: parseInt(newProxy.split(':')[1]),
                },
            },
        )
        expect(instance.version).toBe(ProxyVersion.HTTP)
        done()
    })

    test('Should use HTTP proxy for the first test then SOCKS proxy because HTTP proxy FAILED, SOCKS FAILED also and set version = ProxyVersion.Unknown', async done => {
        const mockedAxios = axios as jest.Mocked<typeof axios>;
        mockedAxios.create = jest.fn().mockReturnValue({
            get: jest.fn()
                .mockResolvedValueOnce({ // -> Test HTTP
                    status: 500,
                    data: ''
                })
                .mockResolvedValueOnce({ // -> Test socks
                    status: 500,
                    data: ''
                })
        })

        const newProxy = "58.145.587.20:50"

        const instance = new Proxy(newProxy, mockedAxios);
        await instance.checkProxy(proxyJudge, proxyInformationProvider, myIp, 8000);


        const socksAgentOption: createSocksProxyAgent.SocksProxyAgentOptions = {
            host: `socks://58.145.587.20:50`,
            timeout: 8000,
        };
        const socksAgent = new SocksProxyAgent(socksAgentOption);

        expect(mockedAxios.create.mock.calls[0][0]).toEqual(
            {
                timeout: 8000,
                proxy: {
                    host: newProxy.split(':')[0],
                    port: parseInt(newProxy.split(':')[1]),
                },
            },
        )
        expect(mockedAxios.create.mock.calls[1][0]).toEqual(
            {
                timeout: 8000,
                httpAgent: socksAgent
            }
        )
        expect(instance.version).toBe(ProxyVersion.Unknown)
        done()
    })
})

function replaceAll(str: any, find: any, replace: any) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function escapeRegExp(string: any) {
    return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}