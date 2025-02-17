import { sortBillsByDate } from "../utils/Bills"
import NewBill from "../containers/NewBill"

describe("bill utils unit tests", () => {
  it("should order bills from the latest to the earliest", () => {
    const bills = [
      { date: "2020-12-31" },
      { date: "2022-01-01" },
      { date: "2018-04-30" },
      { date: "2022-04-18" },
      { date: "2023-10-06" },
    ]
    const sortedBills = [
      { date: "2023-10-06" },
      { date: "2022-04-18" },
      { date: "2022-01-01" },
      { date: "2020-12-31" },
      { date: "2018-04-30" },
    ]
    sortBillsByDate(bills)
    expect(bills).toEqual(sortedBills)
  })
})

describe('NewBill.fileExtensionIsValid unit tests', () => {
  test.each([
    ['picture.webp', false],
    ['picture.pdf', false],
    ['picture.jpg', true],
    ['picture.jpeg', true],
    ['picture.png', true],
    ['picture', false],
    ['.jpg', true],
    ['', false]
  ])(
    "NewBill.fileExtensionIsValid('%s') is %p",
    (filename, expected) => {
      expect(NewBill.extensionIsValid(filename)).toBe(expected)
    }
  )
})
