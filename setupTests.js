import $ from 'jquery'
import store from './src/__mocks__/store'

global.$ = global.jQuery = $

jest.spyOn(window, 'alert').mockImplementation(() => {})
jest.spyOn(store, 'bills')
jest.spyOn(store.bills(), 'create')

afterEach(() => jest.clearAllMocks())
