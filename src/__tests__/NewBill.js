/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import { ROUTES_PATH } from '../constants/routes.js'

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import user from '@testing-library/user-event';
import mockedStore from "../__mocks__/store.js"



describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then it should detect change on file input",  () => {
        const html =  NewBillUI()
        document.body.innerHTML = html
        //to-do write assertion
        localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      
        const onNavigate = jest.fn();

        const newBillClass = new NewBill({document, onNavigate , store: mockedStore , localStorage})
        

        const handleChangeFile1 = jest.fn((e) => newBillClass.handleChangeFile(e))

        const imageInput = screen.getByTestId('file')

        imageInput.addEventListener('change', handleChangeFile1)
        const file = new File(["blob"], 'fichier.png', { type: 'image/png' })
        fireEvent.change(imageInput, {
          target: {
            files: [file]
          }
        })
        expect(handleChangeFile1).toHaveBeenCalled()

    })
    test("Then it should detect wrong extension file input",  () => {
      const html =  NewBillUI()
      document.body.innerHTML = html

      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
    
      const onNavigate = jest.fn();

      const newBillClass = new NewBill({document, onNavigate , store: mockedStore , localStorage})

      const imageInput = screen.getByTestId('file')

      const file = new File(["blob"], 'fichier.png', { type: 'unknown' })
      fireEvent.change(imageInput, {
        target: {
          files: [file]
        }
      })

      expect(newBillClass.isWrongExtensionFile).toBeTruthy()
    })
    test("Then it should handle submit",  () => {
      const html =  NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      const form = document.querySelector(`form[data-testid="form-new-bill"]`)
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
    
      const onNavigate = jest.fn();

      const newBillClass = new NewBill({document, onNavigate , store: mockedStore , localStorage})
      const handleSubmitTest = jest.fn((e) => newBillClass.handleSubmit(e))
      // newBillClass.handleSubmit = jest.fn()
      form.addEventListener('submit', handleSubmitTest)

      form.submit()

      expect(handleSubmitTest).toHaveBeenCalled()
      // expect(newBillClass.handleSubmit).toHaveBeenCalled()
      
    })
    test("Then HandleSubmit should redirect correctly",  () => {
      const html =  NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      const form = document.querySelector(`form[data-testid="form-new-bill"]`)
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
    
      const onNavigate = jest.fn();

      const newBillClass = new NewBill({document, onNavigate , store: mockedStore , localStorage})
      const handleSubmitTest = jest.fn((e) => newBillClass.handleSubmit(e))

      form.addEventListener('submit', handleSubmitTest)

      // Effectue une action qui déclenche l'événement de soumission
      form.submit();
        
      expect(newBillClass.onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
    
      
    })
    test.skip("Then it should handle submit",  () => {
      const html =  NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      jest.clearAllMocks()
      
      const form = document.querySelector(`form[data-testid="form-new-bill"]`)

      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
    
      const onNavigate = jest.fn();

      const typeInput = document.querySelector(`select[data-testid="expense-type"]`)
      const nameInput = document.querySelector(`input[data-testid="expense-name"]`)
      const amountInput = document.querySelector(`input[data-testid="amount"]`)
      const dateInput = document.querySelector(`input[data-testid="datepicker"]`)
      const vatInput = document.querySelector(`input[data-testid="vat"]`)
      const pctInput = document.querySelector(`input[data-testid="pct"]`)
      const commentaryInput = document.querySelector(`textarea[data-testid="commentary"]`)

      typeInput.value = 'Hôtel et logement'
      nameInput.value = "encore"
      amountInput.value = 400
      dateInput.value = "2004-04-04"
      vatInput.value = "80"
      pctInput.value = 20
      commentaryInput.value = "séminaire billed"


      const newBillClass = new NewBill({document, onNavigate , store: mockedStore , localStorage})
      const handleSubmitTest = jest.fn((e) => newBillClass.handleSubmit(e))

      form.addEventListener('submit', handleSubmitTest)

      form.submit()

      console.log(handleSubmitTest);

      newBillClass.updateBill = jest.fn()
      
      expect(newBillClass.updateBill).toHaveBeenCalled();

      // expect(newBillClass.updateBill).toHaveBeenCalledWith({
      //   email: 'a@a',
      //   type: 'Hôtel et logement',
      //   name: 'encore',
      //   amount: 400,
      //   date: '2004-04-04',
      //   vat: '80',
      //   pct: 20,
      //   commentary: 'séminaire billed',
      //   fileUrl: null,
      //   fileName: null,
      //   status: 'pending'
      // });
      

       expect(newBillClass.onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
    
      
    })
  })

  describe("Integration test when I am on NewBill Page", ()=>{
    test("It should display all input's form",async () => {
      await waitFor(() => screen.getByText("Envoyer une note de frais"))

      const labelExpenseType = await screen.getByText("Type de dépense")
      expect(labelExpenseType).toBeTruthy()
      expect(screen.getByTestId("expense-type")).toBeTruthy()

      const labelExpenseName = await screen.getByText("Nom de la dépense")
      expect(labelExpenseName).toBeTruthy()
      expect(screen.getByTestId("expense-name")).toBeTruthy()

      const labelDate = await screen.getByText("Date")
      expect(labelDate).toBeTruthy()
      expect(screen.getByTestId("datepicker")).toBeTruthy()

      const labelAmount = await screen.getByText("Montant TTC")
      expect(labelAmount).toBeTruthy()
      expect(screen.getByTestId("amount")).toBeTruthy()

      const labelVat = await screen.getByText("TVA")
      expect(labelVat).toBeTruthy()
      expect(screen.getByTestId("vat")).toBeTruthy()

      const labelPct = await screen.getByText("%")
      expect(labelPct).toBeTruthy()
      expect(screen.getByTestId("pct")).toBeTruthy()

      const labelCommentary = await screen.getByText("Commentaire")
      expect(labelCommentary).toBeTruthy()
      expect(screen.getByTestId("commentary")).toBeTruthy()

      const labelFile = await screen.getByText("Justificatif")
      expect(labelFile).toBeTruthy()
      expect(screen.getByTestId("file")).toBeTruthy()

      const sendButton = document.querySelector('button[id="btn-send-bill"]')
      expect(sendButton).toBeDefined()
    })
  })

})
