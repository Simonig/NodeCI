const Page = require('./helpers/page');

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000')

})

afterEach(async () => {
    await page.close()
})

describe('When logged in', () => {

    beforeEach(async () => {
        await page.login();
        await page.click('a.btn-floating')
    });

    test('can see blog create form', async () => {
        const label = await page.getContentOf('form label')
        expect(label).toEqual('Blog Title')

    })



    describe('and using valid inputs', () => {

        beforeEach(async () => {
            await page.type('.title input', 'My title')
            await page.type('.content input', 'My content')
            await page.click('form button')
        })

        test('Submitting takes user to review screen', async () => {
            const text = await page.getContentOf('h5')
            expect(text).toEqual('Please confirm your entries')
        })

        test('Submitting then saving adds blogs to index page', async () => {
            await page.click('button.green')
            await page.waitFor('.card')
            const title = await page.getContentOf('.card-title')
            const content = await page.getContentOf('p')

            expect(title).toEqual('My title')
            expect(content).toEqual('My content')

        })

    })
    describe('and using invalid inputs', () => {

        beforeEach(async () => {
            await page.click('form button')
        })

        test('the form show an error message', async () => {
            const titleError = await page.getContentOf('.title .red-text')
            const contentError = await page.getContentOf('.content .red-text')

            expect(titleError).toEqual('You must provide a value')
            expect(contentError).toEqual('You must provide a value')
        })
    })
})

describe('User is not logged in', async () => {
    const actions = [
        { method: 'get', path: '/api/blogs' },
        { method: 'post', path: '/api/blogs', data: { content: 'My content', title: 'My title' } }
    ]

    test('Blog related actions are prohibided', async () => {
        const responses = await page.execRequests(actions)

        for (let response of responses) {
            expect(response).toEqual({ error: 'You must log in!' })
        }
    })
})
