import {clock} from '../../src/helpers/performance'

describe('Unit test for helpers/performance.ts', () => {

    test('Should return value superior or equal to 200 because wait 200 ms', async done=> {
        let start = clock(null);

        await sleep(200)

        let end = clock(start);

        expect(end >= 200).toBe(true)
        done();
    })

    test('Should return value superior or equal to 300 because wait 300 ms', async done=> {
        let start = clock(null);

        await sleep(300)

        let end = clock(start);

        expect(end >= 300).toBe(true)
        done();
    })

})

const sleep = (m:any) => new Promise(r => setTimeout(r, m))