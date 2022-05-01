/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom"
import "@testing-library/jest-dom"
import userEvent from "@testing-library/user-event"
import router from "../app/Router"
import { ROUTES_PATH } from "../constants/routes"
import NewBill, {
  INVALID_EXTENSION_MESSAGE,
  INVALID_FORM_BAD_FILE
} from '../containers/NewBill'
import NewBillUI from "../views/NewBillUI"
import store from '../__mocks__/store'


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

    test("then the mail icon in vertical layout should be highlighted", () => {

      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      // Setup the router.
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()

      // Go to the NewBill page.
      window.onNavigate(ROUTES_PATH.NewBill)

      const windowIcon = screen.getByTestId('icon-mail')
      expect(windowIcon).toHaveClass('active-icon')
    })
  })

  test('creating a new bill redirects me to the bills page', () => {

    const imageFileMock = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })

    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))

    // Setup the router.
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)
    router()

    // Go to the NewBill page.
    window.onNavigate(ROUTES_PATH.NewBill)

    // Get all form's fields.
    const form = {
      type: screen.getByTestId('expense-type'),
      name: screen.getByTestId('expense-name'),
      date: screen.getByTestId('datepicker'),
      amount: screen.getByTestId('amount'),
      vat: screen.getByTestId('vat'),
      pct: screen.getByTestId('pct'),
      commentary: screen.getByTestId('commentary'),
      file: screen.getByTestId('file'),
      submit: screen.getByText('Envoyer'),
    }

    // Fill up the form.
    fireEvent.change(form.type, { target: { selectedIndex: 5 } })
    userEvent.type(form.name, 'PC Asus ROG Strix')
    fireEvent.change(form.date, { target: { value: "2022-07-31" } })
    userEvent.type(form.amount, '1700')
    userEvent.type(form.vat, '170')
    userEvent.type(form.pct, '10')
    userEvent.type(form.commentary, 'Ryzen 7 5800X - 16Go - RTX 3060 - 1To SSD NVMe M.2')
    fireEvent.change(form.file, { target: { files: [imageFileMock] } })

    userEvent.click(form.submit)

    expect(window.location.pathname).toBe('/')
    expect(window.location.hash).toBe(ROUTES_PATH.Bills)
  })

  // Integration POST test.
  test("then completing and submitting the form should send a POST request", async () => {

    const imageFileMock = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })
    const imageBadFileMock = new File(['(⌐□_□)'], 'chucknorris.pdf', { type: 'application/pdf' })

    const expectedPostData = [
      ['type', 'Equipement et matériel'],
      ['name', 'PC Asus ROG Strix'],
      ['date', '2022-07-31'],
      ['amount', '1700'],
      ['vat', '170'],
      ['pct', '10'],
      ['commentary', 'Ryzen 7 5800X - 16Go - RTX 3060 - 1To SSD NVMe M.2'],
      ['email', 'employee@company.test'],
      ['status', 'pending'],
      ['file', expect.objectContaining({
        name: 'chucknorris.png',
        size: imageFileMock.size,
        type: 'image/png',
      })],
    ]

    const expectedPostResponse = {
      fileUrl: 'https://localhost:3456/images/test.jpg',
      key: '1234',
    }

    // Pretend that we're connected as an employee.
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: "employee@company.test",
    }))

    // Render the NewBill page.
    document.body.innerHTML = NewBillUI()
    new NewBill({
      document,
      onNavigate: null,
      store: store,
      localStorage: window.localStorage,
    })


    // Get all form's fields.
    const form = {
      type: screen.getByTestId('expense-type'),
      name: screen.getByTestId('expense-name'),
      date: screen.getByTestId('datepicker'),
      amount: screen.getByTestId('amount'),
      vat: screen.getByTestId('vat'),
      pct: screen.getByTestId('pct'),
      commentary: screen.getByTestId('commentary'),
      file: screen.getByTestId('file'),
      submit: screen.getByText('Envoyer'),
    }

    // Fill up the form.
    fireEvent.change(form.type, { target: { selectedIndex: 5 } })
    userEvent.type(form.name, 'PC Asus ROG Strix')
    fireEvent.change(form.date, { target: { value: "2022-07-31" } })
    userEvent.type(form.amount, '1700')
    userEvent.type(form.vat, '170')
    userEvent.type(form.pct, '10')
    userEvent.type(form.commentary, 'Ryzen 7 5800X - 16Go - RTX 3060 - 1To SSD NVMe M.2')

    // 1. Select a file with bad extension and submit.
    // 2. Select a correct file and submit again.
    fireEvent.change(form.file, { target: { files: [imageBadFileMock] } })
    userEvent.click(form.submit)

    fireEvent.change(form.file, { target: { files: [imageFileMock] } })
    userEvent.click(form.submit)

    // Test error messages on file selection and on submit.
    expect(window.alert).toHaveBeenNthCalledWith(1, INVALID_EXTENSION_MESSAGE)
    expect(window.alert).toHaveBeenNthCalledWith(2, INVALID_FORM_BAD_FILE)

    // Check store usage.
    expect(store.bills).toHaveBeenCalled()
    expect(store.bills().create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.any(FormData),
        headers: expect.objectContaining({
          noContentType: true,
        })
      })
    )
   
    // Check POST request data.
    const formData = Array.from(store.bills().create.mock.calls[0][0].data)
    expect(formData).toHaveLength(expectedPostData.length)
    expect(formData).toEqual(expect.arrayContaining(expectedPostData))

    // Check POST response.
    expect(store.bills().create).toHaveReturnedWith(expect.any(Promise))
    expect(await store.bills().create.mock.results[0].value).toEqual(expectedPostResponse)
  })
})


// For information about setting the file input value, see the testing-library docs:
// https://testing-library.com/docs/dom-testing-library/api-events/#fireeventeventname

// About mocking nested functions:
// https://stackoverflow.com/a/61400342

// A small post on testing objects as arguments:
// https://stackoverflow.com/a/66112144

// Testing the FormData
// https://stackoverflow.com/a/52176572

// Partial matching on arrays:
// https://stackoverflow.com/a/57428906

// A method is using sets (with some disadvantages):
// https://stackoverflow.com/a/53358419
