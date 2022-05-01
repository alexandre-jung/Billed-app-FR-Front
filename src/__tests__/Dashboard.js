/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import {fireEvent, screen, waitFor, waitForElementToBeRemoved} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import DashboardFormUI from "../views/DashboardFormUI.js"
import DashboardUI from "../views/DashboardUI.js"
import Dashboard, { filteredBills, cards } from "../containers/Dashboard.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import { bills } from "../fixtures/bills"
import router from "../app/Router"


function onNavigate(pathname) {
  document.body.innerHTML = ROUTES({ pathname })
}

// It is working only if we import mockStore BEFORE router.
jest.mock("../app/store", () => mockStore)

describe('Given I am connected as an Admin', () => {
  describe('When I am on Dashboard page, there are bills, and there is one pending', () => {
    test('Then, filteredBills by pending status should return 1 bill', () => {
      const filtered_bills = filteredBills(bills, "pending")
      expect(filtered_bills.length).toBe(1)
    })
  })
  describe('When I am on Dashboard page, there are bills, and there is one accepted', () => {
    test('Then, filteredBills by accepted status should return 1 bill', () => {
      const filtered_bills = filteredBills(bills, "accepted")
      expect(filtered_bills.length).toBe(1)
    })
  })
  describe('When I am on Dashboard page, there are bills, and there is two refused', () => {
    test('Then, filteredBills by accepted status should return 2 bills', () => {
      const filtered_bills = filteredBills(bills, "refused")
      expect(filtered_bills.length).toBe(2)
    })
  })
  describe('When I am on Dashboard page but it is loading', () => {
    test('Then, Loading page should be rendered', () => {
      document.body.innerHTML = DashboardUI({ loading: true })
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })
  describe('When I am on Dashboard page but back-end send an error message', () => {
    test('Then, Error page should be rendered', () => {
      document.body.innerHTML = DashboardUI({ error: 'some error message' })
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })

  describe('When I am on Dashboard page and I click on arrows 2 times', () => {
    test('Then, tickets list should be unfolding, and cards should appear, then disappear', async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Admin'
      }))

      document.body.innerHTML = DashboardUI({ data: { bills } })
      const dashboard = new Dashboard({
        document,
        onNavigate: null,
        store: null,
        bills,
        localStorage: window.localStorage
      })

      const handler1 = dashboard.handleShowTickets.bind({ self: dashboard })
      const handler2 = dashboard.handleShowTickets.bind({ self: dashboard })
      const handler3 = dashboard.handleShowTickets.bind({ self: dashboard })

      const handleShowTickets1 = jest.fn((e) => handler1(e, bills, 1))
      const handleShowTickets2 = jest.fn((e) => handler2(e, bills, 2))
      const handleShowTickets3 = jest.fn((e) => handler3(e, bills, 3))

      const icon1 = screen.getByTestId('arrow-icon1')
      const icon2 = screen.getByTestId('arrow-icon2')
      const icon3 = screen.getByTestId('arrow-icon3')

      icon1.addEventListener('click', handleShowTickets1)
      icon2.addEventListener('click', handleShowTickets2)
      icon3.addEventListener('click', handleShowTickets3)

      userEvent.click(icon1)
      expect(screen.queryByTestId('open-bill47qAXb6fIm2zOKkLzMro')).toBeTruthy()
      userEvent.click(icon1)
      expect(screen.queryByTestId('open-bill47qAXb6fIm2zOKkLzMro')).not.toBeTruthy()
      expect(handleShowTickets1).toHaveBeenCalledTimes(2)

      userEvent.click(icon2)
      expect(screen.queryByTestId('open-billUIUZtnPQvnbFnB0ozvJh')).toBeTruthy()
      userEvent.click(icon2)
      expect(screen.queryByTestId('open-billUIUZtnPQvnbFnB0ozvJh')).not.toBeTruthy()
      expect(handleShowTickets2).toHaveBeenCalledTimes(2)

      userEvent.click(icon3)
      expect(screen.queryByTestId('open-billBeKy5Mo4jkmdfPGYpTxZ')).toBeTruthy()
      userEvent.click(icon3)
      expect(screen.queryByTestId('open-billBeKy5Mo4jkmdfPGYpTxZ')).not.toBeTruthy()
      expect(handleShowTickets3).toHaveBeenCalledTimes(2)
    })
  })

  describe('When I am on Dashboard page and I click on edit icon of a card', () => {

    test('Then, right form should be filled',  () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Admin'
      }))

      document.body.innerHTML = DashboardUI({ data: { bills } })
      const dashboard = new Dashboard({
        document,
        onNavigate: null,
        store: null,
        bills,
        localStorage: window.localStorage
      })

      const handleShowTickets1 = jest.fn((e) => dashboard.handleShowTickets.bind({ self: dashboard })(e, bills, 1))
      const icon1 = screen.getByTestId('arrow-icon1')
      icon1.addEventListener('click', handleShowTickets1)

      userEvent.click(icon1)
      expect(handleShowTickets1).toHaveBeenCalled()
      expect(screen.getByTestId(`open-bill47qAXb6fIm2zOKkLzMro`)).toBeTruthy()

      const iconEdit = screen.getByTestId('open-bill47qAXb6fIm2zOKkLzMro')
      userEvent.click(iconEdit)
      expect(screen.getByTestId(`dashboard-form`)).toBeTruthy()
    })
  })

  describe('When I am on Dashboard page and I click 2 times on edit icon of a card', () => {

    test('Then, big bill Icon should Appear',  () => {

      const getBigBilledIcon = () => screen.queryByTestId("big-billed-icon")

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Admin'
      }))

      document.body.innerHTML = DashboardUI({ data: { bills } })
      const dashboard = new Dashboard({
        document,
        onNavigate: null,
        store: null,
        bills,
        localStorage: window.localStorage
      })

      const handleShowTickets1 = jest.fn((e) => dashboard.handleShowTickets.bind({ self: dashboard })(e, bills, 1))
      const icon1 = screen.getByTestId('arrow-icon1')
      icon1.addEventListener('click', handleShowTickets1)

      userEvent.click(icon1)
      expect(handleShowTickets1).toHaveBeenCalled()
      expect(screen.getByTestId(`open-bill47qAXb6fIm2zOKkLzMro`)).toBeTruthy()

      const iconEdit = screen.getByTestId('open-bill47qAXb6fIm2zOKkLzMro')
      userEvent.click(iconEdit)

      expect(getBigBilledIcon()).toBeFalsy()
      userEvent.click(iconEdit)
      expect(getBigBilledIcon()).toBeTruthy()
    })
  })


  describe('When I am on Dashboard and there are no bills', () => {
    test('Then, no cards should be shown', () => {
      document.body.innerHTML = cards([])
      const iconEdit = screen.queryByTestId('open-bill47qAXb6fIm2zOKkLzMro')
      expect(iconEdit).toBeNull()
    })
  })
})

describe('Given I am connected as Admin, and I am on Dashboard page, and I clicked on a pending bill', () => {
  describe('When I click on accept button', () => {

    test('I should stay on Dashboard with big billed icon instead of form', async () => {

      document.body.innerHTML = DashboardFormUI(bills[0])
      const dashboard = new Dashboard({
        document,
        onNavigate,
        store: mockStore,
        bills,
        localStorage: window.localStorage
      })

      const acceptButton = screen.getByTestId("btn-accept-bill-d")
      const handleAcceptSubmit = jest.fn((e) => dashboard.handleAcceptSubmit(e, bills[0]))
      acceptButton.addEventListener("click", handleAcceptSubmit)

      fireEvent.click(acceptButton)
      expect(handleAcceptSubmit).toHaveBeenCalled()

      // Use findBy* to leave the update enough time to complete.
      const bigBilledIcon = await screen.findByTestId("big-billed-icon")
      expect(bigBilledIcon).toBeTruthy()
    })
  })
  describe('When I click on refuse button', () => {

    test('I should stay on Dashboard with big billed icon instead of form', async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Admin'
      }))

      document.body.innerHTML = DashboardFormUI(bills[0])
      const dashboard = new Dashboard({
        document,
        onNavigate,
        store: mockStore,
        bills,
        localStorage: window.localStorage
      })

      const refuseButton = screen.getByTestId("btn-refuse-bill-d")
      const handleRefuseSubmit = jest.fn((e) => dashboard.handleRefuseSubmit(e, bills[0]))
      refuseButton.addEventListener("click", handleRefuseSubmit)

      fireEvent.click(refuseButton)
      expect(handleRefuseSubmit).toHaveBeenCalled()

      // Use findBy* to leave the update enough time to complete.
      const bigBilledIcon = await screen.findByTestId("big-billed-icon")
      expect(bigBilledIcon).toBeTruthy()
    })
  })
})

describe('Given I am connected as Admin and I am on Dashboard page and I clicked on a bill', () => {
  describe('When I click on the icon eye', () => {

    test('A modal should open', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Admin'
      }))

      document.body.innerHTML = DashboardFormUI(bills[0])
      const dashboard = new Dashboard({
        document,
        onNavigate: null,
        store: null,
        bills,
        localStorage: window.localStorage
      })

      const handleClickIconEye = jest.fn(dashboard.handleClickIconEye)
      const eye = screen.getByTestId('icon-eye-d')
      eye.addEventListener('click', handleClickIconEye)
      userEvent.click(eye)
      expect(handleClickIconEye).toHaveBeenCalled()

      const modale = screen.getByTestId('modaleFileAdmin')
      expect(modale).toBeTruthy()
    })
  })
})

// GET request integration test.
describe("Given I am a user connected as Admin", async () => {
  describe("When I navigate to Dashboard", () => {

    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Admin", email: "a@a" }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Dashboard)
      await waitFor(() => screen.getByText("Validations"))
      const contentPending  = await screen.findByText("En attente (1)")
      expect(contentPending).toBeTruthy()
      const contentRefused  = await screen.findByText("Refusé (2)")
      expect(contentRefused).toBeTruthy()
      expect(screen.getByTestId("big-billed-icon")).toBeTruthy()
    })

    describe("When an error occurs on API", () => {

      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Admin'
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })

      test("fetches bills from an API and fails with 404 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 404"))
            }
          }})
        window.onNavigate(ROUTES_PATH.Dashboard)
        await new Promise(process.nextTick)
        const message = await screen.findByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })

      test("fetches messages from an API and fails with 500 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }})

        window.onNavigate(ROUTES_PATH.Dashboard)
        await new Promise(process.nextTick)
        const message = await screen.findByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })
  })
})

// Integration test.
describe('When I am on Dashboard page', () => {

  test('then, accepting a note should call the correct handler', async () => {

    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Admin'
    }))

    document.body.innerHTML = DashboardUI({ data: { bills } })
    const dashboard = new Dashboard({
      document,
      onNavigate,
      store: mockStore,
      bills,
      localStorage: window.localStorage
    })

    jest.spyOn(dashboard, 'handleAcceptSubmit')

    // Unfold the list
    const icon1 = screen.getByTestId('arrow-icon1')
    userEvent.click(icon1)
    expect(screen.queryByTestId('open-bill47qAXb6fIm2zOKkLzMro')).toBeTruthy()

    // Click on the edit note button.
    const iconEdit = screen.getByTestId('open-bill47qAXb6fIm2zOKkLzMro')
    userEvent.click(iconEdit)

    // Accept the note
    const acceptButton = screen.getByTestId("btn-accept-bill-d")
    fireEvent.click(acceptButton)

    expect(dashboard.handleAcceptSubmit).toHaveBeenCalledWith(
      expect.any($.Event),
      {
        "id": "47qAXb6fIm2zOKkLzMro",
        "vat": "80",
        "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        "status": "pending",
        "type": "Hôtel et logement",
        "commentary": "séminaire billed",
        "name": "encore",
        "fileName": "preview-facture-free-201801-pdf-1.jpg",
        "date": "2004-04-04",
        "amount": 400,
        "commentAdmin": "ok",
        "email": "a@a",
        "pct": 20
      }
    )
  })

  test('then, refusing a note should call the correct handler', async () => {

    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Admin'
    }))

    document.body.innerHTML = DashboardUI({ data: { bills } })
    const dashboard = new Dashboard({
      document,
      onNavigate,
      store: mockStore,
      bills,
      localStorage: window.localStorage
    })

    jest.spyOn(dashboard, 'handleRefuseSubmit')

    // Unfold the list
    const icon1 = screen.getByTestId('arrow-icon1')
    userEvent.click(icon1)
    expect(screen.queryByTestId('open-bill47qAXb6fIm2zOKkLzMro')).toBeTruthy()

    // Click on the edit note button.
    const iconEdit = screen.getByTestId('open-bill47qAXb6fIm2zOKkLzMro')
    userEvent.click(iconEdit)

    // Accept the note
    const refuseButton = screen.getByTestId("btn-refuse-bill-d")
    fireEvent.click(refuseButton)

    expect(dashboard.handleRefuseSubmit).toHaveBeenCalledWith(
      expect.any($.Event),
      {
        "id": "47qAXb6fIm2zOKkLzMro",
        "vat": "80",
        "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        "status": "pending",
        "type": "Hôtel et logement",
        "commentary": "séminaire billed",
        "name": "encore",
        "fileName": "preview-facture-free-201801-pdf-1.jpg",
        "date": "2004-04-04",
        "amount": 400,
        "commentAdmin": "ok",
        "email": "a@a",
        "pct": 20
      }
    )
  })
})
