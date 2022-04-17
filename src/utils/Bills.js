/**
 * Sort an array of bills, in place and by date (latest to earliest).
 *
 * @param {Array} bills
 */
export const sortBillsByDate = (bills) => {
  if (bills && bills.length) {
    const antiChrono = (a, b) => (a.date < b.date ? 1 : -1)
    bills.sort(antiChrono)
  }
}
