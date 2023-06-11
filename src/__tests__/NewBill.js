/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import { ROUTES_PATH } from '../constants/routes.js'

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import mockedStore from "../__mocks__/store.js"



describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then it should detect change on file input", async () => {
        const html =  NewBillUI()
        document.body.innerHTML = html
        //to-do write assertion
        
        localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
        const onNavigate = jest.fn();
        const newBillClass = new NewBill({document, onNavigate , store: mockedStore , localStorage})
        const handleChangeFile1 = jest.fn((e) => newBillClass.handleChangeFile(e))
        const imageInput = screen.getByTestId('file')

        // verifie que les variables soient NULL
        expect(newBillClass.fileUrl).toBeNull()
        expect(newBillClass.fileName).toBeNull()
        expect(newBillClass.billId).toBeNull()
        expect(newBillClass.fileName).toBeFalsy()

        imageInput.addEventListener('change', handleChangeFile1)

        // Simule un choix de fichier ".png" par l'utilisateur dans l'input File.
        const file = new File(["blob"], 'fichier.png', { type: 'image/png' })
        await fireEvent.change(imageInput, {
          target: {
            files: [file]
          }
        })

        // Vérifie que la méthode à bien été appelée
        expect(handleChangeFile1).toHaveBeenCalled()

        // vérifie que les variables aient bien été modifiées
        expect(newBillClass.fileUrl).not.toBeNull()
        expect(newBillClass.fileName).not.toBeNull()

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

      expect(handleSubmitTest).toHaveBeenCalled()
        
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
