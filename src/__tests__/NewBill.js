/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import user from '@testing-library/user-event';


// jest.mock("../containers/NewBill")
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test.skip("Then it should detect change on file input",  () => {
        const html =  NewBillUI()
        document.body.innerHTML = html
        //to-do write assertion
        localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      
        const onNavigate = jest.fn();
        const store = jest.fn();

        const newBillClass = new NewBill({document, onNavigate , store , localStorage})
        newBillClass.store.bills = jest.fn()

        const handleChangeFile1 = jest.fn((e) => newBillClass.handleChangeFile(e))
        const imageInput = screen.getByTestId('file')

        imageInput.addEventListener('change', handleChangeFile1)
        const file = new File(["blob"], 'chucknorris.png', { type: 'image/png' })
        fireEvent.change(imageInput, {target: {files: [file]}})
        expect(handleChangeFile1).toHaveBeenCalled()
      

    })
  })
})
