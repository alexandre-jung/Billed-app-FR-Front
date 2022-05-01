/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom"
import { screen } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"

import Bills from "../containers/Bills.js"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import router from "../app/Router.js"


// It is working only if we import mockStore BEFORE router.
jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("then the bill icon in vertical layout should be highlighted", async () => {

      // Pretend we're connected as an employee.
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      // Setup the router.
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()

      // Go to employee dashboard.
      window.onNavigate(ROUTES_PATH.Bills)

      const windowIcon = await screen.findByTestId('icon-window')
      expect(windowIcon).toHaveClass('active-icon')

    })

    test("then bills should be ordered from latest to earliest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test("then clicking the eye icon should display the file in a modal", () => {

      // We need to provide an implementation for the `modal` function
      // of the Bootstrap jQuery plugin. For more information, see:
      // How do I mock a jQuery plugin? - https://stackoverflow.com/a/43149183
      // What does jQuery.fn mean? - https://stackoverflow.com/a/4083362
      jQuery.fn.modal = jest.fn()

      // Setup the Bills UI.
      document.body.innerHTML = BillsUI({ data: bills })
      new Bills({ document, onNavigate: null, store: null, localStorage: null })

      // Click the first eye icon.
      const eyeIcon = screen.getAllByTestId('icon-eye')[0]
      userEvent.click(eyeIcon)

      expect(jQuery.fn.modal).toHaveBeenCalledWith('show')
    })

    test("then clicking the new bill button should navigate to the NewBill page", () => {

      const onNavigate = (pathname) => document.body.innerHTML = ROUTES({ pathname })

      // Setup the Bills UI.
      document.body.innerHTML = BillsUI({ data: bills })
      new Bills({ document, onNavigate, store: null, localStorage: null })

      // Click the 'new bill' button'.
      const newBillButton = screen.getByTestId('btn-new-bill')
      userEvent.click(newBillButton)

      expect(document.body).toHaveTextContent('Envoyer une note de frais ')
      expect(screen.queryByTestId('form-new-bill')).toBeTruthy()
    })

    test("then bills are fetched from the API and it succeeds", async () => {

      // Pretend we're connected as an employee.
      localStorage.setItem("user", JSON.stringify({
        type: "Employee",
        email: "employee@company.test",
      }))

      // Setup the router.
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()

      // Go to employee dashboard.
      window.onNavigate(ROUTES_PATH.Bills)

      await new Promise(process.nextTick)
      const tableBody = screen.getByTestId('tbody')
      expect(document.body).toHaveTextContent('Mes notes de frais')
      expect(tableBody.children).toHaveLength(4)
    })

    test("then a bad date should return the unformatted date, and log the error", async () => {

      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )

      // Pretend we're connected as an employee.
      localStorage.setItem("user", JSON.stringify({
        type: "Employee",
        email: "employee@company.test",
      }))

      const consoleSpy = jest.spyOn(console, 'log')

      // Mock the store with a bill containing a bad date.
      const billWithBadDateFormat = (await mockStore.bills().list())[0]
      billWithBadDateFormat.date = "2002-02-02-bad-date-format"
      const bill = { list: () =>  Promise.resolve([billWithBadDateFormat]) }

      // It will be call a second time, while handling the error.
      mockStore.bills
        .mockImplementationOnce(() => bill)
        .mockImplementationOnce(() => bill)

      // Setup the router.
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()

      // Go to employee dashboard.
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick)

      expect(document.body).toHaveTextContent('2002-02-02-bad-date-format')
      expect(console.log).toHaveBeenCalledWith(
        expect.any(RangeError),
        'for',
        (await bill.list())[0],
      )

      // Clean the spy.
      consoleSpy.mockRestore()
    })

    test("then bills are fetched from the API and it fails with a 404 message error", async () => {

      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})

      // Pretend we're connected as an employee.
      localStorage.setItem("user", JSON.stringify({
        type: "Employee",
        email: "employee@company.test",
      }))

      // Setup the router.
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()

      // Go to employee dashboard.
      window.onNavigate(ROUTES_PATH.Bills)

      await new Promise(process.nextTick)
      const message = await screen.findByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("then bills are fetched from the API and it fails with a 500 message error", async () => {

      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      // Pretend we're connected as an employee.
      localStorage.setItem("user", JSON.stringify({
        type: "Employee",
        email: "employee@company.test",
      }))

      // Setup the router.
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()

      // Go to employee dashboard.
      window.onNavigate(ROUTES_PATH.Bills)

      await new Promise(process.nextTick)
      const message = await screen.findByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})
