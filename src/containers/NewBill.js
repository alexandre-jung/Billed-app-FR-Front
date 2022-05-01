import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

const VALID_EXTENSIONS = ['.jpg', '.jpeg', '.png']

export const INVALID_EXTENSION_MESSAGE = `
Invalid file extension.
Valid extensions are:
.jpg
.jpeg
.png
`

export const INVALID_FORM_BAD_FILE = `
The form is not valid.\n${INVALID_EXTENSION_MESSAGE}
`

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    new Logout({ document, localStorage, onNavigate })
  }

  /**
   * Handles file selection and displays an error
   * if the file extension is invalid.
   * 
   * @param { Event } event 
   */
  handleChangeFile = event => {
    event.preventDefault()
    if (!NewBill.extensionIsValid(this.formData.get('file').name)) {
      alert(INVALID_EXTENSION_MESSAGE)
    }
  }

  /**
   * Handles form submit, validates data, and finally calls
   * the bill creation function if everything is ok.
   * 
   * @param { SubmitEvent } event
   * @returns 
   */
  handleSubmit = event => {
    event.preventDefault()
    if (NewBill.extensionIsValid(this.formData.get('file').name)) {
      this.createBill(this.formData)
      if (this.onNavigate) this.onNavigate(ROUTES_PATH['Bills'])
    } else {
      alert(INVALID_FORM_BAD_FILE)
    }
  }

  /**
   * Retrieve form data, and sets additional parameters.
   */
  get formData() {
    const formElement = this.document.querySelector('form[data-testid="form-new-bill"]')
    const formData = new FormData(formElement)

    formData.set('email', JSON.parse(localStorage.getItem("user")).email)
    formData.set('status', 'pending')

    // FormData does not retrieve the file informations when we set it programmatically in Jest,
    // so we have to manually set it in order to make it testable.
    const fileInput = formElement.querySelector('[name="file"]')
    formData.set('file', fileInput.files[0])

    return formData
  }

  /**
   * Send POST request for bill creation and navigates
   * to the bill dashboard on success.
   *
   * @param { FormData } billFormData 
   */
  createBill = (billFormData) => {  // istanbul ignore next
    this.store
      .bills()
      .create({
        data: billFormData,
        headers: {
          noContentType: true
        }
      })
      .then((response) => {
        this.billId = response.key
        this.fileUrl = response.fileUrl
        this.fileName = response.fileName
        this.onNavigate(ROUTES_PATH['Bills'])
      }).catch(console.error)
  }

  /**
   * Returns the extension of a file name.
   * 
   * @param { String } fileName
   * @returns { ?String }
   */
  static getExtension(fileName) {
    if (!fileName) return null
    const lastDotIndex = fileName.lastIndexOf('.')
    const extension = lastDotIndex != -1 ? fileName.slice(lastDotIndex) : ''
    return extension
  }

  /**
   * Validate a file extension.
   *
   * @param { String } fileName
   */
  static extensionIsValid(fileName) {
    const extension = this.getExtension(fileName)
    if (!extension) return false
    return VALID_EXTENSIONS.includes(extension.toLowerCase())
  }
}
